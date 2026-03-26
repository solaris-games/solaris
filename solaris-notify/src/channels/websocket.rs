use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::mpsc;
use tracing::warn;

/// Manages WebSocket connections by userId.
/// Each user can have multiple connections (multiple browser tabs).
pub struct ConnectionManager {
    connections: DashMap<String, Vec<mpsc::Sender<String>>>,
}

impl ConnectionManager {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            connections: DashMap::new(),
        })
    }

    pub fn add(&self, user_id: String, sender: mpsc::Sender<String>) {
        self.connections
            .entry(user_id)
            .or_default()
            .push(sender);
    }

    pub fn remove(&self, user_id: &str, sender: &mpsc::Sender<String>) {
        if let Some(mut entry) = self.connections.get_mut(user_id) {
            entry.retain(|s| !s.same_channel(sender));
            if entry.is_empty() {
                drop(entry);
                self.connections.remove(user_id);
            }
        }
    }

    pub fn is_connected(&self, user_id: &str) -> bool {
        self.connections
            .get(user_id)
            .map(|v| !v.is_empty())
            .unwrap_or(false)
    }

    pub async fn send(&self, user_id: &str, message: &str) {
        if let Some(senders) = self.connections.get(user_id) {
            for sender in senders.iter() {
                if let Err(e) = sender.send(message.to_string()).await {
                    warn!(user_id = %user_id, error = %e, "failed to send to WebSocket");
                }
            }
        }
    }
}
