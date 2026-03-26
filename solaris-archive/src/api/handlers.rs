use std::path::PathBuf;
use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use tokio::sync::RwLock;

use crate::storage::{layout, reader};

#[derive(Clone)]
pub struct AppState {
    pub archive_path: PathBuf,
    pub cache: Arc<RwLock<Vec<serde_json::Value>>>,
}

pub async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ "status": "ok" }))
}

pub async fn list_games(State(state): State<AppState>) -> impl IntoResponse {
    let cache = state.cache.read().await;
    Json(serde_json::json!({
        "games": *cache,
        "total": cache.len(),
    }))
}

pub async fn get_game(
    State(state): State<AppState>,
    Path(game_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let path = layout::game_data_path(&state.archive_path, &game_id);
    if !path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }

    tokio::task::spawn_blocking(move || {
        reader::read_zstd_json(&path)
            .map(Json)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
}

#[derive(Deserialize)]
pub struct TickQuery {
    pub tick: Option<i32>,
}

pub async fn get_history_tick(
    State(state): State<AppState>,
    Path(game_id): Path<String>,
    Query(query): Query<TickQuery>,
) -> Result<impl IntoResponse, StatusCode> {
    let tick = query.tick.ok_or(StatusCode::BAD_REQUEST)?;
    let path = layout::history_tick_path(&state.archive_path, &game_id, tick);
    if !path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }

    tokio::task::spawn_blocking(move || {
        reader::read_zstd_json(&path)
            .map(Json)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
}

pub async fn list_ticks(
    State(state): State<AppState>,
    Path(game_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let base = state.archive_path.clone();
    let ticks = tokio::task::spawn_blocking(move || reader::list_ticks(&base, &game_id))
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({ "ticks": ticks })))
}

pub async fn get_events(
    State(state): State<AppState>,
    Path(game_id): Path<String>,
) -> Result<impl IntoResponse, StatusCode> {
    let path = layout::events_path(&state.archive_path, &game_id);
    if !path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }

    tokio::task::spawn_blocking(move || {
        reader::read_zstd_json(&path)
            .map(Json)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
}
