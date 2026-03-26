use std::sync::Arc;

use axum::{
    extract::{State, WebSocketUpgrade},
    response::IntoResponse,
};
use axum::extract::ws::{Message, WebSocket};
use bson::doc;
use chrono::DateTime;
use futures::{SinkExt, StreamExt};
use tokio::sync::mpsc;
use tracing::{info, warn};

use crate::auth::session::AuthUser;
use crate::channels::websocket::ConnectionManager;

use super::handlers::AppState;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state, user_id))
}

async fn handle_socket(socket: WebSocket, state: AppState, user_id: String) {
    info!(user_id = %user_id, "WebSocket connected");

    let (mut ws_sender, mut ws_receiver) = socket.split();
    let (tx, mut rx) = mpsc::channel::<String>(32);

    // Register connection
    state.ws_connections.add(user_id.clone(), tx.clone());

    // Task: forward channel messages to WebSocket
    let send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // Listen for client messages
    while let Some(msg) = ws_receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                // Handle catch-up: client sends {"lastSeen": "ISO timestamp"}
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&text) {
                    if let Some(last_seen_str) = parsed.get("lastSeen").and_then(|v| v.as_str()) {
                        if let Ok(last_seen) = DateTime::parse_from_rfc3339(last_seen_str) {
                            send_missed_notifications(
                                &state,
                                &user_id,
                                last_seen.with_timezone(&chrono::Utc),
                                &tx,
                            )
                            .await;
                        }
                    }
                }
            }
            Ok(Message::Close(_)) | Err(_) => break,
            _ => {}
        }
    }

    // Cleanup
    state.ws_connections.remove(&user_id, &tx);
    send_task.abort();
    info!(user_id = %user_id, "WebSocket disconnected");
}

async fn send_missed_notifications(
    state: &AppState,
    user_id: &str,
    since: chrono::DateTime<chrono::Utc>,
    tx: &mpsc::Sender<String>,
) {
    let filter = doc! {
        "userId": user_id,
        "createdAt": { "$gt": bson::DateTime::from_chrono(since) }
    };

    let mut cursor = match state
        .db
        .notifications
        .find(filter)
        .sort(doc! { "createdAt": 1 })
        .limit(100)
        .await
    {
        Ok(c) => c,
        Err(e) => {
            warn!(error = %e, "failed to query missed notifications");
            return;
        }
    };

    while let Some(Ok(notification)) = cursor.next().await {
        if let Ok(json) = serde_json::to_string(&notification) {
            if tx.send(json).await.is_err() {
                break;
            }
        }
    }
}
