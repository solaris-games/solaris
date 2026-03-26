use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use bson::doc;
use futures::StreamExt;
use tokio::sync::RwLock;
use tracing::{error, info};

use crate::db::models::GameDocument;
use crate::db::mongo::Db;
use crate::storage::layout;

use super::writer::archive_game;

/// Cached list of archive metadata, shared with the API layer.
pub type MetadataCache = Arc<RwLock<Vec<serde_json::Value>>>;

/// Refresh the in-memory metadata cache by scanning the archive directory.
pub async fn refresh_cache(cache: &MetadataCache, base: &PathBuf) {
    match crate::storage::reader::list_archived_games(base) {
        Ok(games) => {
            let count = games.len();
            *cache.write().await = games;
            info!(count, "metadata cache refreshed");
        }
        Err(e) => {
            error!(error = %e, "failed to refresh metadata cache");
        }
    }
}

/// Background loop: poll MongoDB for finished games and archive them.
pub async fn run(db: Db, base: PathBuf, poll_interval: Duration, cache: MetadataCache) {
    // Initial cache load
    refresh_cache(&cache, &base).await;

    loop {
        if let Err(e) = poll_once(&db, &base, &cache).await {
            error!(error = %e, "archive poll error");
        }
        tokio::time::sleep(poll_interval).await;
    }
}

async fn poll_once(
    db: &Db,
    base: &PathBuf,
    cache: &MetadataCache,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Find finished games that haven't been cleaned yet
    let filter = doc! {
        "state.endDate": { "$ne": null },
    };

    let mut cursor = db.games.find(filter).await?;
    let mut archived_count = 0u32;

    while let Some(result) = cursor.next().await {
        let game: GameDocument = result?;
        let game_id = game.id.to_hex();

        // Skip if already archived
        if layout::is_archived(base, &game_id) {
            continue;
        }

        // Skip cleaned games that have no history to archive
        // (but still archive the game document itself)
        let is_cleaned = game.state.cleaned.unwrap_or(false);
        if is_cleaned {
            info!(game_id = %game_id, "archiving cleaned game (history may be missing)");
        }

        info!(game_id = %game_id, "archiving game");
        match archive_game(&game, &db.history, &db.events, base).await {
            Ok(()) => {
                archived_count += 1;
            }
            Err(e) => {
                error!(game_id = %game_id, error = %e, "failed to archive game");
            }
        }
    }

    if archived_count > 0 {
        info!(count = archived_count, "archived new games");
        refresh_cache(cache, base).await;
    }

    Ok(())
}
