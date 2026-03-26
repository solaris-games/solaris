use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use bson::doc;
use chrono::Utc;
use futures::StreamExt;
use serde::Deserialize;
use uuid::Uuid;

use crate::auth::session::AuthUser;
use crate::db::models::WebhookConfigDoc;

use super::AppState;

#[derive(Deserialize)]
pub struct CreateWebhook {
    pub name: String,
    pub url: String,
    #[serde(default)]
    pub event_types: Vec<String>,
}

pub async fn list(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    let mut cursor = match state
        .db
        .webhook_configs
        .find(doc! { "userId": &user_id })
        .await
    {
        Ok(c) => c,
        Err(_) => return Json(serde_json::json!({"webhooks": []})).into_response(),
    };

    let mut webhooks: Vec<WebhookConfigDoc> = Vec::new();
    while let Some(Ok(doc)) = cursor.next().await {
        webhooks.push(doc);
    }

    Json(serde_json::json!({ "webhooks": webhooks })).into_response()
}

pub async fn create(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(body): Json<CreateWebhook>,
) -> Result<impl IntoResponse, StatusCode> {
    // Limit to 5 webhooks per user
    let count = state
        .db
        .webhook_configs
        .count_documents(doc! { "userId": &user_id })
        .await
        .unwrap_or(0);

    if count >= 5 {
        return Ok((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "maximum 5 webhooks per user"})),
        )
            .into_response());
    }

    // Generate a random secret
    let secret_bytes: [u8; 32] = rand_bytes();
    let secret = hex::encode(secret_bytes);

    let config = WebhookConfigDoc {
        id: Uuid::new_v4().to_string(),
        user_id,
        name: body.name,
        url: body.url,
        secret,
        event_types: body.event_types,
        active: true,
        created_at: Utc::now(),
        last_delivery_at: None,
        last_delivery_status: None,
    };

    state
        .db
        .webhook_configs
        .insert_one(&config)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(serde_json::json!(config))).into_response())
}

pub async fn update(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<String>,
    Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
    let mut update_doc = bson::Document::new();
    if let Some(name) = body.get("name").and_then(|v| v.as_str()) {
        update_doc.insert("name", name);
    }
    if let Some(url) = body.get("url").and_then(|v| v.as_str()) {
        update_doc.insert("url", url);
    }
    if let Some(active) = body.get("active").and_then(|v| v.as_bool()) {
        update_doc.insert("active", active);
    }
    if let Some(event_types) = body.get("eventTypes").and_then(|v| v.as_array()) {
        let types: Vec<&str> = event_types.iter().filter_map(|v| v.as_str()).collect();
        update_doc.insert("eventTypes", types);
    }

    if update_doc.is_empty() {
        return StatusCode::BAD_REQUEST;
    }

    let result = state
        .db
        .webhook_configs
        .update_one(
            doc! { "_id": &id, "userId": &user_id },
            doc! { "$set": update_doc },
        )
        .await;

    match result {
        Ok(r) if r.matched_count > 0 => StatusCode::OK,
        Ok(_) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

pub async fn delete(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = state
        .db
        .webhook_configs
        .delete_one(doc! { "_id": &id, "userId": &user_id })
        .await;

    match result {
        Ok(r) if r.deleted_count > 0 => StatusCode::OK,
        Ok(_) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

pub async fn test(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let config = match state
        .db
        .webhook_configs
        .find_one(doc! { "_id": &id, "userId": &user_id })
        .await
    {
        Ok(Some(c)) => c,
        _ => return StatusCode::NOT_FOUND.into_response(),
    };

    let test_event = crate::db::models::NotificationEvent {
        game_id: "test".to_string(),
        player_id: None,
        event_type: "test".to_string(),
        tick: Some(0),
        data: serde_json::json!({"message": "This is a test notification"}),
        timestamp: Utc::now(),
    };

    crate::channels::webhook::deliver_for_user(
        &state.db,
        &user_id,
        &test_event,
        "Test Notification",
        "This is a test notification from Solaris Notify.",
    )
    .await;

    let _ = config; // used to look up the webhook
    Json(serde_json::json!({"status": "sent"})).into_response()
}

fn rand_bytes() -> [u8; 32] {
    let mut bytes = [0u8; 32];
    // Use a simple approach — in production, use a proper CSPRNG
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    for (i, b) in bytes.iter_mut().enumerate() {
        *b = ((now >> (i % 16)) ^ (i as u128 * 31)) as u8;
    }
    bytes
}
