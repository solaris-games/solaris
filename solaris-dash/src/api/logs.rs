use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use bollard::container::LogsOptions;
use futures::StreamExt;
use serde::Deserialize;

use super::handlers::AppState;

#[derive(Deserialize)]
pub struct LogsQuery {
    pub tail: Option<String>,
}

pub async fn get_container_logs(
    State(state): State<AppState>,
    Path(container_id): Path<String>,
    Query(query): Query<LogsQuery>,
) -> Result<impl IntoResponse, StatusCode> {
    let tail = query.tail.unwrap_or_else(|| "100".to_string());

    let opts = LogsOptions::<String> {
        stdout: true,
        stderr: true,
        tail: tail.clone(),
        ..Default::default()
    };

    let mut stream = state.docker.logs(&container_id, Some(opts));
    let mut lines = Vec::new();

    while let Some(Ok(output)) = stream.next().await {
        lines.push(output.to_string());
    }

    Ok(Json(serde_json::json!({
        "containerId": container_id,
        "lines": lines,
        "tail": tail,
    })))
}
