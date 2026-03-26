use std::path::{Path, PathBuf};

/// Path construction for the archive on-disk layout:
/// /archive/{gameId}/
///   metadata.json
///   game.json.zst
///   events.json.zst
///   history/{tick}.json.zst

pub fn game_dir(base: &Path, game_id: &str) -> PathBuf {
    base.join(game_id)
}

pub fn metadata_path(base: &Path, game_id: &str) -> PathBuf {
    game_dir(base, game_id).join("metadata.json")
}

pub fn game_data_path(base: &Path, game_id: &str) -> PathBuf {
    game_dir(base, game_id).join("game.json.zst")
}

pub fn events_path(base: &Path, game_id: &str) -> PathBuf {
    game_dir(base, game_id).join("events.json.zst")
}

pub fn history_dir(base: &Path, game_id: &str) -> PathBuf {
    game_dir(base, game_id).join("history")
}

pub fn history_tick_path(base: &Path, game_id: &str, tick: i32) -> PathBuf {
    history_dir(base, game_id).join(format!("{tick}.json.zst"))
}

pub fn is_archived(base: &Path, game_id: &str) -> bool {
    metadata_path(base, game_id).exists()
}
