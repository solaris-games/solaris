#[derive(Debug, Clone)]
pub struct Config {
    pub mongo_uri: String,
    pub nats_monitor_url: String,
    pub archive_url: String,
    pub notify_url: String,
    pub solaris_api_url: String,
    pub solaris_client_url: String,
    pub collect_interval_secs: u64,
    pub port: u16,
    pub max_history_entries: usize,
    pub security_scan_interval_secs: u64,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            mongo_uri: env("MONGO_URI", "mongodb://localhost:27017/solaris?replicaSet=rs0"),
            nats_monitor_url: env("NATS_MONITOR_URL", "http://localhost:8222"),
            archive_url: env("ARCHIVE_URL", "http://localhost:3001"),
            notify_url: env("NOTIFY_URL", "http://localhost:3002"),
            solaris_api_url: env("SOLARIS_API_URL", "http://localhost:3000"),
            solaris_client_url: env("SOLARIS_CLIENT_URL", "http://localhost:8080"),
            collect_interval_secs: env("COLLECT_INTERVAL_SECS", "10").parse().unwrap_or(10),
            port: env("PORT", "3003").parse().unwrap_or(3003),
            max_history_entries: env("MAX_HISTORY_ENTRIES", "360").parse().unwrap_or(360),
            security_scan_interval_secs: env("SECURITY_SCAN_INTERVAL_SECS", "604800")
                .parse()
                .unwrap_or(604800),
        }
    }
}

fn env(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.into())
}
