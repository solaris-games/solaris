use axum::{routing::get, Router};
use tower_http::cors::CorsLayer;

use super::{handlers, logs, sse};
use crate::dashboard;

pub fn create_router(state: handlers::AppState) -> Router {
    Router::new()
        // Dashboard UI
        .route("/", get(dashboard::serve_index))
        .route("/static/app.js", get(dashboard::serve_js))
        .route("/static/style.css", get(dashboard::serve_css))
        .route("/api/dash/changelog", get(dashboard::serve_changelog))
        // API
        .route("/api/dash/health", get(handlers::health))
        .route("/api/dash/snapshot", get(handlers::snapshot))
        .route("/api/dash/history", get(handlers::history))
        .route("/api/dash/containers", get(handlers::containers))
        .route(
            "/api/dash/containers/:id/logs",
            get(logs::get_container_logs),
        )
        .route("/api/dash/mongo/stats", get(handlers::mongo_stats))
        .route("/api/dash/nats/stats", get(handlers::nats_stats))
        .route("/api/dash/games/stats", get(handlers::games_stats))
        .route(
            "/api/dash/notifications/stats",
            get(handlers::notifications_stats),
        )
        // Security
        .route("/api/dash/security/summary", get(handlers::security_summary))
        .route("/api/dash/security/report", get(handlers::security_report))
        .route("/api/dash/security/sbom", get(handlers::security_sbom))
        .route("/api/dash/security/vulns", get(handlers::security_vulns))
        .route("/api/dash/security/remediation", get(handlers::security_remediation))
        // SSE
        .route("/api/dash/events", get(sse::events_stream))
        .layer(CorsLayer::permissive())
        .with_state(state)
}
