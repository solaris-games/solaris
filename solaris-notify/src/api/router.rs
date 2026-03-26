use axum::{
    routing::{delete, get, patch, post, put},
    Router,
};
use tower_http::cors::CorsLayer;

use super::handlers::{self, AppState};
use super::ws;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        // Health
        .route("/api/notify/health", get(health))
        // Notifications
        .route(
            "/api/notify/notifications",
            get(handlers::notifications::list),
        )
        .route(
            "/api/notify/notifications/unread/count",
            get(handlers::notifications::unread_count),
        )
        .route(
            "/api/notify/notifications/:id/read",
            patch(handlers::notifications::mark_read),
        )
        .route(
            "/api/notify/notifications/read-all",
            post(handlers::notifications::mark_all_read),
        )
        .route(
            "/api/notify/notifications/:id",
            delete(handlers::notifications::delete),
        )
        // Webhooks
        .route(
            "/api/notify/webhooks",
            get(handlers::webhooks::list).post(handlers::webhooks::create),
        )
        .route(
            "/api/notify/webhooks/:id",
            put(handlers::webhooks::update).delete(handlers::webhooks::delete),
        )
        .route(
            "/api/notify/webhooks/:id/test",
            post(handlers::webhooks::test),
        )
        // Preferences
        .route(
            "/api/notify/preferences",
            get(handlers::preferences::get).put(handlers::preferences::update),
        )
        // WebSocket
        .route("/ws/notify", get(ws::ws_handler))
        .layer(CorsLayer::permissive())
        .with_state(state)
}

async fn health() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({ "status": "ok" }))
}
