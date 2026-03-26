mod api;
mod archive;
mod config;
mod db;
mod storage;

use std::sync::Arc;
use std::time::Duration;

use tokio::sync::RwLock;
use tracing::{error, info};

use api::handlers::AppState;
use archive::scanner;
use config::Config;
use db::mongo::Db;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "solaris_archive=info".into()),
        )
        .init();

    let config = Config::from_env();
    info!(
        mongo_uri = %config.mongo_uri,
        archive_path = %config.archive_path.display(),
        poll_interval_secs = config.poll_interval_secs,
        port = config.port,
        "starting solaris-archive"
    );

    // Ensure archive directory exists
    std::fs::create_dir_all(&config.archive_path).expect("failed to create archive directory");

    // Connect to MongoDB
    let db = match Db::connect(&config.mongo_uri).await {
        Ok(db) => {
            info!("connected to MongoDB");
            db
        }
        Err(e) => {
            error!(error = %e, "failed to connect to MongoDB");
            std::process::exit(1);
        }
    };

    // Shared metadata cache
    let cache: scanner::MetadataCache = Arc::new(RwLock::new(Vec::new()));

    // Spawn the archiver background task
    let archiver_db = db.clone();
    let archiver_base = config.archive_path.clone();
    let archiver_cache = cache.clone();
    let poll_interval = Duration::from_secs(config.poll_interval_secs);

    tokio::spawn(async move {
        scanner::run(archiver_db, archiver_base, poll_interval, archiver_cache).await;
    });

    // Start the HTTP server
    let state = AppState {
        archive_path: config.archive_path,
        cache,
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
