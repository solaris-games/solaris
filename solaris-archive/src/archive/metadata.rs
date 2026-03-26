use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveMetadata {
    pub game_id: String,
    pub game_name: String,
    pub game_type: String,
    pub player_count: i32,
    pub total_ticks: i32,
    pub start_date: Option<DateTime<Utc>>,
    pub end_date: Option<DateTime<Utc>>,
    pub winner_id: Option<String>,
    pub archived_at: DateTime<Utc>,
    pub archive_version: u32,
    pub history_tick_range: Option<[i32; 2]>,
    pub total_size_bytes: u64,
}
