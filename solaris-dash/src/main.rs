mod api;
mod collectors;
mod config;
mod dashboard;
mod store;

use std::sync::Arc;

use bollard::Docker;
use tokio::sync::broadcast;
use tracing::{error, info};

use api::handlers::AppState;
use config::Config;
use store::MetricsStore;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "solaris_dash=info".into()),
        )
        .init();

    let config = Config::from_env();
    info!(
        mongo_uri = %config.mongo_uri,
        port = config.port,
        collect_interval = config.collect_interval_secs,
        "starting solaris-dash"
    );

    // Connect to MongoDB
    let mongo_client = match mongodb::Client::with_uri_str(&config.mongo_uri).await {
        Ok(c) => {
            let db = c.database("solaris");
            if let Err(e) = db.run_command(bson::doc! { "ping": 1 }).await {
                error!(error = %e, "failed to ping MongoDB");
                std::process::exit(1);
            }
            info!("connected to MongoDB");
            c
        }
        Err(e) => {
            error!(error = %e, "failed to connect to MongoDB");
            std::process::exit(1);
        }
    };
    let db = mongo_client.database("solaris");

    // Connect to Docker
    let docker = match Docker::connect_with_local_defaults() {
        Ok(d) => {
            info!("connected to Docker");
            d
        }
        Err(e) => {
            error!(error = %e, "failed to connect to Docker");
            std::process::exit(1);
        }
    };

    // Create shared state
    let store = MetricsStore::new(config.max_history_entries);
    let (sse_tx, _) = broadcast::channel::<store::MetricsSnapshot>(16);
    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .expect("failed to create HTTP client");

    // Initialize security collector
    let security_collector = Arc::new(
        collectors::security::SecurityCollector::new(
            db.clone(),
            config.security_scan_interval_secs,
        ),
    );
    security_collector.init().await;

    // Spawn the weekly security scan loop (separate from 10s metrics loop)
    let scan_collector = security_collector.clone();
    tokio::spawn(async move {
        scan_collector.run_scan_loop().await;
    });

    let collector_ctx = Arc::new(collectors::CollectorContext {
        docker: docker.clone(),
        db: db.clone(),
        http: http_client,
        config: config.clone(),
        security: security_collector,
    });

    // Spawn collector loop
    let collector_store = store.clone();
    let collector_tx = sse_tx.clone();
    tokio::spawn(async move {
        collectors::run_loop(collector_ctx, collector_store, collector_tx).await;
    });

    // Start HTTP server
    let state = AppState {
        store,
        docker,
        sse_tx,
        db,
    };

    let app = api::router::create_router(state);
    let addr = format!("0.0.0.0:{}", config.port);
    info!(addr = %addr, "starting HTTP server");

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("failed to bind");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("server error");
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to listen for ctrl+c");
    info!("shutting down");
}
