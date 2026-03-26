use std::sync::Arc;

use axum::{extract::{Query, State}, http::StatusCode, response::IntoResponse, Json};
use bollard::Docker;
use mongodb::Database;
use serde::Deserialize;
use tokio::sync::broadcast;

use crate::store::{MetricsSnapshot, MetricsStore, SecurityReport};

#[derive(Clone)]
pub struct AppState {
    pub store: Arc<MetricsStore>,
    pub docker: Docker,
    pub sse_tx: broadcast::Sender<MetricsSnapshot>,
    pub db: Database,
}

pub async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

pub async fn snapshot(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s).into_response(),
        None => (StatusCode::SERVICE_UNAVAILABLE, "no data yet").into_response(),
    }
}

#[derive(Deserialize)]
pub struct HistoryQuery {
    pub minutes: Option<usize>,
}

pub async fn history(
    State(state): State<AppState>,
    Query(query): Query<HistoryQuery>,
) -> impl IntoResponse {
    let minutes = query.minutes.unwrap_or(60);
    let entries_per_minute = 6; // 10s intervals
    let max = minutes * entries_per_minute;
    let data = state.store.get_history(max).await;
    Json(data)
}

pub async fn containers(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.containers).into_response(),
        None => Json(Vec::<()>::new()).into_response(),
    }
}

pub async fn mongo_stats(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.mongodb).into_response(),
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

pub async fn nats_stats(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.nats).into_response(),
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

pub async fn games_stats(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.games).into_response(),
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

pub async fn notifications_stats(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.notifications).into_response(),
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

// ── Security endpoints ──

pub async fn security_summary(State(state): State<AppState>) -> impl IntoResponse {
    match state.store.get_current().await {
        Some(s) => Json(s.security).into_response(),
        None => StatusCode::SERVICE_UNAVAILABLE.into_response(),
    }
}

pub async fn security_report(State(state): State<AppState>) -> impl IntoResponse {
    let collection = state.db.collection::<SecurityReport>("security_reports");
    match collection.find_one(mongodb::bson::doc! {}).await {
        Ok(Some(report)) => Json(report).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, "no security report available").into_response(),
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, format!("database error: {e}")).into_response()
        }
    }
}

#[derive(Deserialize)]
pub struct SbomQuery {
    pub component: Option<String>,
}

pub async fn security_sbom(
    State(state): State<AppState>,
    Query(query): Query<SbomQuery>,
) -> impl IntoResponse {
    let collection = state.db.collection::<SecurityReport>("security_reports");
    match collection.find_one(mongodb::bson::doc! {}).await {
        Ok(Some(report)) => {
            let components = if let Some(ref name) = query.component {
                let lower = name.to_lowercase();
                report
                    .components
                    .into_iter()
                    .filter(|c| c.name.to_lowercase().contains(&lower))
                    .collect()
            } else {
                report.components
            };
            Json(components).into_response()
        }
        Ok(None) => Json(Vec::<()>::new()).into_response(),
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, format!("database error: {e}")).into_response()
        }
    }
}

#[derive(Deserialize)]
pub struct VulnQuery {
    pub severity: Option<String>,
    pub component: Option<String>,
    pub priority: Option<String>,
}

pub async fn security_vulns(
    State(state): State<AppState>,
    Query(query): Query<VulnQuery>,
) -> impl IntoResponse {
    let collection = state.db.collection::<SecurityReport>("security_reports");
    match collection.find_one(mongodb::bson::doc! {}).await {
        Ok(Some(report)) => {
            let mut vulns = report.vulnerabilities;

            if let Some(ref sev) = query.severity {
                let lower = sev.to_lowercase();
                vulns.retain(|v| v.severity.to_lowercase() == lower);
            }
            if let Some(ref comp) = query.component {
                let lower = comp.to_lowercase();
                vulns.retain(|v| v.component.to_lowercase().contains(&lower));
            }
            if let Some(ref pri) = query.priority {
                let upper = pri.to_uppercase();
                vulns.retain(|v| v.remediation_priority.to_uppercase() == upper);
            }

            Json(vulns).into_response()
        }
        Ok(None) => Json(Vec::<()>::new()).into_response(),
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, format!("database error: {e}")).into_response()
        }
    }
}

pub async fn security_remediation(State(state): State<AppState>) -> impl IntoResponse {
    let collection = state.db.collection::<SecurityReport>("security_reports");
    match collection.find_one(mongodb::bson::doc! {}).await {
        Ok(Some(report)) => Json(report.remediation).into_response(),
        Ok(None) => Json(Vec::<()>::new()).into_response(),
        Err(e) => {
            (StatusCode::INTERNAL_SERVER_ERROR, format!("database error: {e}")).into_response()
        }
    }
}
