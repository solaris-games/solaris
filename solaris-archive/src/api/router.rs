use axum::{
    routing::get,
    Router,
};
use tower_http::cors::CorsLayer;

use super::handlers;
use crate::api::handlers::AppState;

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/api/archive/health", get(handlers::health))
        .route("/api/archive/games", get(handlers::list_games))
        .route("/api/archive/game/:gameId", get(handlers::get_game))
        .route(
            "/api/archive/game/:gameId/history",
            get(handlers::get_history_tick),
        )
        .route(
            "/api/archive/game/:gameId/history/ticks",
            get(handlers::list_ticks),
        )
        .route(
            "/api/archive/game/:gameId/events",
            get(handlers::get_events),
        )
        .layer(CorsLayer::permissive())
        .with_state(state)
}
