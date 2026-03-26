use std::io::Read;
use std::path::Path;

/// Read and decompress a .json.zst file, returning the parsed JSON value.
pub fn read_zstd_json(path: &Path) -> Result<serde_json::Value, Box<dyn std::error::Error + Send + Sync>> {
    let file = std::fs::File::open(path)?;
    let mut decoder = zstd::Decoder::new(file)?;
    let mut json_bytes = Vec::new();
    decoder.read_to_end(&mut json_bytes)?;
    let value = serde_json::from_slice(&json_bytes)?;
    Ok(value)
}

/// Read a plain JSON file (for metadata).
pub fn read_json(path: &Path) -> Result<serde_json::Value, Box<dyn std::error::Error + Send + Sync>> {
    let data = std::fs::read(path)?;
    let value = serde_json::from_slice(&data)?;
    Ok(value)
}

/// List available tick numbers for a game by scanning the history directory.
pub fn list_ticks(base: &Path, game_id: &str) -> Result<Vec<i32>, Box<dyn std::error::Error + Send + Sync>> {
    let hist_dir = super::layout::history_dir(base, game_id);
    if !hist_dir.exists() {
        return Ok(vec![]);
    }

    let mut ticks: Vec<i32> = std::fs::read_dir(&hist_dir)?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let name = entry.file_name().to_string_lossy().to_string();
            // Files are named {tick}.json.zst
            name.strip_suffix(".json.zst")?.parse::<i32>().ok()
        })
        .collect();
    ticks.sort();
    Ok(ticks)
}

/// List all archived game IDs by scanning the archive base directory.
pub fn list_archived_games(
    base: &Path,
) -> Result<Vec<serde_json::Value>, Box<dyn std::error::Error + Send + Sync>> {
    if !base.exists() {
        return Ok(vec![]);
    }

    let mut games = Vec::new();
    for entry in std::fs::read_dir(base)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }
        let game_id = entry.file_name().to_string_lossy().to_string();
        let meta_path = super::layout::metadata_path(base, &game_id);
        if meta_path.exists() {
            if let Ok(meta) = read_json(&meta_path) {
                games.push(meta);
            }
        }
    }
    Ok(games)
}
