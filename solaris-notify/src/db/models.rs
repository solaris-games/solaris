use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationDoc {
    #[serde(rename = "_id")]
    pub id: String, // UUID as string
    pub user_id: String,
    pub game_id: String,
    pub event_type: String,
    pub title: String,
    pub body: String,
    pub data: serde_json::Value,
    pub read: bool,
    pub created_at: DateTime<Utc>,
    pub delivered_via: Vec<String>,
}

impl NotificationDoc {
    pub fn new(
        user_id: String,
        game_id: String,
        event_type: String,
        title: String,
        body: String,
        data: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            user_id,
            game_id,
            event_type,
            title,
            body,
            data,
            read: false,
            created_at: Utc::now(),
            delivered_via: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WebhookConfigDoc {
    #[serde(rename = "_id")]
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub url: String,
    pub secret: String,
    pub event_types: Vec<String>,
    pub active: bool,
    pub created_at: DateTime<Utc>,
    pub last_delivery_at: Option<DateTime<Utc>>,
    pub last_delivery_status: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChannelPrefs {
    pub enabled: bool,
    #[serde(default)]
    pub event_types: Vec<String>, // empty = all
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserPreferencesDoc {
    #[serde(rename = "_id")]
    pub user_id: String,
    pub inbox: ChannelPrefs,
    pub websocket: ChannelPrefs,
    pub webhook: ChannelPrefs,
    pub notify_active_games_only: bool,
}

impl UserPreferencesDoc {
    pub fn defaults(user_id: String) -> Self {
        Self {
            user_id,
            inbox: ChannelPrefs {
                enabled: true,
                event_types: vec![],
            },
            websocket: ChannelPrefs {
                enabled: true,
                event_types: vec![],
            },
            webhook: ChannelPrefs {
                enabled: true,
                event_types: vec![],
            },
            notify_active_games_only: false,
        }
    }
}

/// Event coming from the change stream, transformed for NATS.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationEvent {
    pub game_id: String,
    pub player_id: Option<String>,
    pub event_type: String,
    pub tick: Option<i32>,
    pub data: serde_json::Value,
    pub timestamp: DateTime<Utc>,
}
