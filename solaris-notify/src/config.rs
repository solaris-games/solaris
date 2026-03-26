use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct Config {
    pub mongo_uri: String,
    pub nats_url: String,
    pub port: u16,
    pub session_secret: String,
    pub webhook_timeout_secs: u64,
    pub webhook_max_retries: u32,
}

impl Config {
    pub fn from_env() -> Arc<Self> {
        Arc::new(Self {
            mongo_uri: std::env::var("MONGO_URI")
                .unwrap_or_else(|_| "mongodb://localhost:27017/solaris?replicaSet=rs0".into()),
            nats_url: std::env::var("NATS_URL")
                .unwrap_or_else(|_| "nats://localhost:4222".into()),
            port: std::env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3002),
            session_secret: std::env::var("SESSION_SECRET")
                .unwrap_or_else(|_| "top_secret".into()),
            webhook_timeout_secs: std::env::var("WEBHOOK_TIMEOUT_SECS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(10),
            webhook_max_retries: std::env::var("WEBHOOK_MAX_RETRIES")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3),
        })
    }
}
