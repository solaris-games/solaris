use std::io::Write;
use std::path::Path;

use bson::doc;
use futures::StreamExt;
use mongodb::Collection;
use tracing::{info, warn};

use crate::archive::metadata::ArchiveMetadata;
use crate::db::models::{GameDocument, GameEventDocument, GameHistoryDocument};
use crate::storage::layout;

/// Write a single value as zstd-compressed JSON to a file.
fn write_zstd_json(path: &Path, value: &impl serde::Serialize) -> Result<u64, Box<dyn std::error::Error + Send + Sync>> {
    let json = serde_json::to_vec(value)?;
    let mut encoder = zstd::Encoder::new(std::fs::File::create(path)?, 3)?;
    encoder.write_all(&json)?;
    encoder.finish()?;
    let size = std::fs::metadata(path)?.len();
    Ok(size)
}

/// Archive a single game: write game doc, all history ticks, and events to disk.
pub async fn archive_game(
    game: &GameDocument,
    history_col: &Collection<GameHistoryDocument>,
    events_col: &Collection<GameEventDocument>,
    base: &Path,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let game_id = game.id.to_hex();
    let game_dir = layout::game_dir(base, &game_id);

    // Clean up any partial archive
    if game_dir.exists() {
        std::fs::remove_dir_all(&game_dir)?;
    }

    std::fs::create_dir_all(layout::history_dir(base, &game_id))?;
    let mut total_size: u64 = 0;

    // 1. Write game document
    info!(game_id = %game_id, "writing game document");
    total_size += write_zstd_json(&layout::game_data_path(base, &game_id), game)?;

    // 2. Stream history ticks and write each one
    let mut min_tick: Option<i32> = None;
    let mut max_tick: Option<i32> = None;
    let mut tick_count = 0u32;

    let mut cursor = history_col
        .find(doc! { "gameId": game.id })
        .sort(doc! { "tick": 1 })
        .await?;

    while let Some(result) = cursor.next().await {
        match result {
            Ok(hist) => {
                let tick = hist.tick;
                total_size += write_zstd_json(
                    &layout::history_tick_path(base, &game_id, tick),
                    &hist,
                )?;
                min_tick = Some(min_tick.unwrap_or(tick).min(tick));
                max_tick = Some(max_tick.unwrap_or(tick).max(tick));
                tick_count += 1;
            }
            Err(e) => {
                warn!(game_id = %game_id, error = %e, "error reading history document");
            }
        }
    }

    info!(game_id = %game_id, ticks = tick_count, "wrote history ticks");

    // 3. Write events
    let events: Vec<GameEventDocument> = {
        let mut cursor = events_col
            .find(doc! { "gameId": game.id })
            .sort(doc! { "tick": 1 })
            .await?;
        let mut events = Vec::new();
        while let Some(result) = cursor.next().await {
            match result {
                Ok(event) => events.push(event),
                Err(e) => warn!(game_id = %game_id, error = %e, "error reading event"),
            }
        }
        events
    };

    total_size += write_zstd_json(&layout::events_path(base, &game_id), &events)?;
    info!(game_id = %game_id, events = events.len(), "wrote events");

    // 4. Extract metadata from game document
    let game_name = game
        .settings
        .get("general")
        .and_then(|g| g.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or("Unknown")
        .to_string();

    let game_type = game
        .settings
        .get("general")
        .and_then(|g| g.get("type"))
        .and_then(|t| t.as_str())
        .unwrap_or("unknown")
        .to_string();

    let player_count = game
        .state
        .extra
        .get("players")
        .and_then(|p| p.as_i64())
        .unwrap_or(0) as i32;

    let metadata = ArchiveMetadata {
        game_id: game_id.clone(),
        game_name,
        game_type,
        player_count,
        total_ticks: game.state.tick,
        start_date: game.state.start_date.map(|d| d.to_chrono()),
        end_date: game.state.end_date.map(|d| d.to_chrono()),
        winner_id: game.state.winner.map(|w| w.to_hex()),
        archived_at: chrono::Utc::now(),
        archive_version: 1,
        history_tick_range: match (min_tick, max_tick) {
            (Some(min), Some(max)) => Some([min, max]),
            _ => None,
        },
        total_size_bytes: total_size,
    };

    // 5. Write metadata LAST (completion marker)
    let meta_json = serde_json::to_string_pretty(&metadata)?;
    std::fs::write(layout::metadata_path(base, &game_id), meta_json)?;

    info!(
        game_id = %game_id,
        total_size_bytes = total_size,
        ticks = tick_count,
        "archive complete"
    );

    Ok(())
}
