use std::collections::VecDeque;
use std::sync::Arc;

use chrono::{DateTime, Utc};
use serde::Serialize;
use tokio::sync::RwLock;

// ── Snapshot types ──

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MetricsSnapshot {
    pub timestamp: String,
    pub containers: Vec<ContainerMetrics>,
    pub mongodb: MongoDbMetrics,
    pub nats: NatsMetrics,
    pub games: GameMetrics,
    pub notifications: NotificationMetrics,
    pub archive: ArchiveMetrics,
    pub services: Vec<ServiceHealth>,
    pub security: super::SecuritySummary,
    pub alerts: Vec<Alert>,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContainerMetrics {
    pub id: String,
    pub name: String,
    pub status: String,
    pub health: String,
    pub uptime_secs: u64,
    pub restart_count: u64,
    pub cpu_percent: f64,
    pub memory_usage_bytes: u64,
    pub memory_limit_bytes: u64,
    pub net_rx_bytes: u64,
    pub net_tx_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MongoDbMetrics {
    pub connections_current: u64,
    pub connections_available: u64,
    pub opcounters_query: u64,
    pub opcounters_insert: u64,
    pub opcounters_update: u64,
    pub opcounters_delete: u64,
    pub mem_resident_mb: u64,
    pub uptime_secs: u64,
    pub data_size_bytes: u64,
    pub storage_size_bytes: u64,
    pub collections_count: u64,
    pub top_collections: Vec<CollectionStats>,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct CollectionStats {
    pub name: String,
    pub count: u64,
    pub size_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NatsMetrics {
    pub connections: u64,
    pub subscriptions: u64,
    pub in_msgs: u64,
    pub out_msgs: u64,
    pub in_bytes: u64,
    pub out_bytes: u64,
    pub slow_consumers: u64,
    pub stream_messages: u64,
    pub stream_bytes: u64,
    pub consumer_pending: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GameMetrics {
    pub active_games: u64,
    pub finished_games: u64,
    pub total_users: u64,
    pub players_online_24h: u64,
    pub registrations_1d: u64,
    pub registrations_7d: u64,
    pub game_types: Vec<GameTypeCount>,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GameTypeCount {
    pub game_type: String,
    pub count: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NotificationMetrics {
    pub total_notifications: u64,
    pub unread_notifications: u64,
    pub webhook_configs_active: u64,
    pub webhook_last_failures: u64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveMetrics {
    pub games_archived: u64,
    pub total_size_bytes: u64,
    pub healthy: bool,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ServiceHealth {
    pub name: String,
    pub url: String,
    pub healthy: bool,
    pub response_time_ms: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Alert {
    pub severity: String, // "warning" or "critical"
    pub source: String,
    pub message: String,
}

// ── Ring buffer store ──

pub struct MetricsStore {
    snapshots: RwLock<VecDeque<MetricsSnapshot>>,
    max_entries: usize,
    current: RwLock<Option<MetricsSnapshot>>,
}

impl MetricsStore {
    pub fn new(max_entries: usize) -> Arc<Self> {
        Arc::new(Self {
            snapshots: RwLock::new(VecDeque::with_capacity(max_entries)),
            max_entries,
            current: RwLock::new(None),
        })
    }

    pub async fn push(&self, snapshot: MetricsSnapshot) {
        let mut current = self.current.write().await;
        *current = Some(snapshot.clone());
        drop(current);

        let mut history = self.snapshots.write().await;
        if history.len() >= self.max_entries {
            history.pop_front();
        }
        history.push_back(snapshot);
    }

    pub async fn get_current(&self) -> Option<MetricsSnapshot> {
        self.current.read().await.clone()
    }

    pub async fn get_history(&self, max_entries: usize) -> Vec<MetricsSnapshot> {
        let history = self.snapshots.read().await;
        let start = if history.len() > max_entries {
            history.len() - max_entries
        } else {
            0
        };
        history.iter().skip(start).cloned().collect()
    }
}
