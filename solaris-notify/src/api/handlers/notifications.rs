use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use bson::doc;
use futures::StreamExt;
use serde::Deserialize;

use crate::auth::session::AuthUser;
use crate::db::models::NotificationDoc;

use super::AppState;

#[derive(Deserialize)]
pub struct ListQuery {
    pub page: Option<u32>,
    #[serde(rename = "pageSize")]
    pub page_size: Option<u32>,
}

pub async fn list(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Query(query): Query<ListQuery>,
) -> impl IntoResponse {
    let page = query.page.unwrap_or(1).max(1);
    let page_size = query.page_size.unwrap_or(20).min(100);
    let skip = ((page - 1) * page_size) as u64;

    let filter = doc! { "userId": &user_id };

    let total = state
        .db
        .notifications
        .count_documents(filter.clone())
        .await
        .unwrap_or(0);

    let mut cursor = match state
        .db
        .notifications
        .find(filter)
        .sort(doc! { "createdAt": -1 })
        .skip(skip)
        .limit(page_size as i64)
        .await
    {
        Ok(c) => c,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error": "db error"}))).into_response(),
    };

    let mut notifications: Vec<NotificationDoc> = Vec::new();
    while let Some(Ok(doc)) = cursor.next().await {
        notifications.push(doc);
    }

    Json(serde_json::json!({
        "notifications": notifications,
        "total": total,
        "page": page,
        "pageSize": page_size,
    }))
    .into_response()
}

pub async fn unread_count(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    let count = state
        .db
        .notifications
        .count_documents(doc! { "userId": &user_id, "read": false })
        .await
        .unwrap_or(0);

    Json(serde_json::json!({ "unreadCount": count }))
}

pub async fn mark_read(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = state
        .db
        .notifications
        .update_one(
            doc! { "_id": &id, "userId": &user_id },
            doc! { "$set": { "read": true } },
        )
        .await;

    match result {
        Ok(r) if r.matched_count > 0 => StatusCode::OK,
        Ok(_) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

pub async fn mark_all_read(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    let result = state
        .db
        .notifications
        .update_many(
            doc! { "userId": &user_id, "read": false },
            doc! { "$set": { "read": true } },
        )
        .await;

    match result {
        Ok(r) => Json(serde_json::json!({ "modified": r.modified_count })),
        Err(_) => Json(serde_json::json!({ "error": "db error" })),
    }
}

pub async fn delete(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = state
        .db
        .notifications
        .delete_one(doc! { "_id": &id, "userId": &user_id })
        .await;

    match result {
        Ok(r) if r.deleted_count > 0 => StatusCode::OK,
        Ok(_) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}
