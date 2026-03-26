use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct Config {
    pub mongo_uri: String,
    pub archive_path: PathBuf,
    pub poll_interval_secs: u64,
    pub port: u16,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            mongo_uri: std::env::var("MONGO_URI")
                .unwrap_or_else(|_| "mongodb://localhost:27017/solaris".into()),
            archive_path: PathBuf::from(
                std::env::var("ARCHIVE_PATH").unwrap_or_else(|_| "/archive".into()),
            ),
            poll_interval_secs: std::env::var("POLL_INTERVAL_SECS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(60),
            port: std::env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3001),
        }
    }
}
