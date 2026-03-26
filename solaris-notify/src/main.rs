mod api;
mod auth;
mod bus;
mod channels;
mod config;
mod db;
mod ingestion;
mod router;
mod templates;

use std::sync::Arc;

use tracing::{error, info};

use api::handlers::AppState;
use bus::nats::NatsBus;
use channels::websocket::ConnectionManager;
use config::Config;
use db::mongo::Db;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "solaris_notify=info".into()),
        )
        .init();

    let config = Config::from_env();
    info!(
        mongo_uri = %config.mongo_uri,
        nats_url = %config.nats_url,
        port = config.port,
        "starting solaris-notify"
    );

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

    // Connect to NATS
    let nats = match NatsBus::connect(&config.nats_url).await {
        Ok(nats) => {
            info!("connected to NATS");
            nats
        }
        Err(e) => {
            error!(error = %e, "failed to connect to NATS");
            std::process::exit(1);
        }
    };

    // WebSocket connection manager
    let ws_connections = ConnectionManager::new();

    // Spawn background tasks
    let watcher_db = db.clone();
    let watcher_nats = nats.clone();
    tokio::spawn(async move {
        ingestion::watcher::run(watcher_db, watcher_nats).await;
    });

    let dispatcher_db = db.clone();
    let dispatcher_nats = nats.clone();
    let dispatcher_ws = ws_connections.clone();
    tokio::spawn(async move {
        router::dispatcher::run(dispatcher_db, dispatcher_nats, dispatcher_ws).await;
    });

    // Start HTTP server
    let port = config.port;
    let state = AppState {
        db,
        ws_connections,
        config,
    };

    let app = api::router::create_router(state);
    let addr = format!("0.0.0.0:{port}");
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
