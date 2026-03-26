use std::sync::Arc;
use std::time::Duration;

use bson::doc;
use dashmap::DashMap;
use futures::StreamExt;
use tracing::{error, info, warn};

use crate::bus::nats::NatsBus;
use crate::channels;
use crate::db::models::{NotificationEvent, UserPreferencesDoc};
use crate::db::mongo::Db;
use crate::templates;

/// Cache of gameId -> Vec<(playerId, userId)> with expiry.
struct GamePlayerCache {
    cache: DashMap<String, (Vec<(String, String)>, std::time::Instant)>,
    ttl: Duration,
}

impl GamePlayerCache {
    fn new(ttl: Duration) -> Self {
        Self {
            cache: DashMap::new(),
            ttl,
        }
    }

    fn get(&self, game_id: &str) -> Option<Vec<(String, String)>> {
        self.cache.get(game_id).and_then(|entry| {
            if entry.1.elapsed() < self.ttl {
                Some(entry.0.clone())
            } else {
                None
            }
        })
    }

    fn set(&self, game_id: String, players: Vec<(String, String)>) {
        self.cache
            .insert(game_id, (players, std::time::Instant::now()));
    }
}

/// Run the dispatcher: consume from NATS, route to channels.
pub async fn run(
    db: Db,
    nats: NatsBus,
    ws_manager: Arc<channels::websocket::ConnectionManager>,
) {
    let cache = Arc::new(GamePlayerCache::new(Duration::from_secs(300)));

    loop {
        info!("starting dispatcher");
        if let Err(e) = dispatch_loop(&db, &nats, &ws_manager, &cache).await {
            error!(error = %e, "dispatcher error, restarting in 5s");
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    }
}

async fn dispatch_loop(
    db: &Db,
    nats: &NatsBus,
    ws_manager: &Arc<channels::websocket::ConnectionManager>,
    cache: &Arc<GamePlayerCache>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let consumer = nats.create_consumer().await?;
    let mut messages = consumer.messages().await?;

    while let Some(msg) = messages.next().await {
        let msg = msg?;

        let event: NotificationEvent = match serde_json::from_slice(&msg.payload) {
            Ok(e) => e,
            Err(e) => {
                warn!(error = %e, "failed to parse NATS message");
                msg.ack().await.ok();
                continue;
            }
        };

        // Determine recipient userIds
        let recipients = match resolve_recipients(db, &event, cache).await {
            Ok(r) => r,
            Err(e) => {
                warn!(error = %e, game_id = %event.game_id, "failed to resolve recipients");
                msg.ack().await.ok();
                continue;
            }
        };

        // Generate notification text
        let (title, body) = templates::render(&event.event_type, &event.data);

        // Route to each recipient
        for user_id in &recipients {
            let prefs = get_or_create_prefs(db, user_id).await;

            let should_inbox = prefs.inbox.enabled
                && (prefs.inbox.event_types.is_empty()
                    || prefs.inbox.event_types.contains(&event.event_type));

            // Store in inbox
            if should_inbox {
                let mut notification = crate::db::models::NotificationDoc::new(
                    user_id.clone(),
                    event.game_id.clone(),
                    event.event_type.clone(),
                    title.clone(),
                    body.clone(),
                    event.data.clone(),
                );

                notification.delivered_via.push("inbox".to_string());

                // Push via WebSocket if connected
                if prefs.websocket.enabled && ws_manager.is_connected(user_id) {
                    let ws_payload = serde_json::to_string(&notification).unwrap_or_default();
                    ws_manager.send(user_id, &ws_payload).await;
                    notification.delivered_via.push("websocket".to_string());
                }

                if let Err(e) = db.notifications.insert_one(&notification).await {
                    warn!(error = %e, user_id = %user_id, "failed to store notification");
                }
            }

            // Deliver via webhooks
            if prefs.webhook.enabled {
                channels::webhook::deliver_for_user(db, user_id, &event, &title, &body).await;
            }
        }

        msg.ack().await.ok();
    }

    Ok(())
}

/// Resolve which userIds should receive this event.
async fn resolve_recipients(
    db: &Db,
    event: &NotificationEvent,
    cache: &Arc<GamePlayerCache>,
) -> Result<Vec<String>, Box<dyn std::error::Error + Send + Sync>> {
    // Get game's player->user mapping
    let players = if let Some(cached) = cache.get(&event.game_id) {
        cached
    } else {
        let mapping = fetch_game_players(db, &event.game_id).await?;
        cache.set(event.game_id.clone(), mapping.clone());
        mapping
    };

    if let Some(ref player_id) = event.player_id {
        // Player-specific event: find the user for this player
        Ok(players
            .iter()
            .filter(|(pid, _)| pid == player_id)
            .map(|(_, uid)| uid.clone())
            .collect())
    } else {
        // Game-level event: notify all players
        Ok(players.iter().map(|(_, uid)| uid.clone()).collect())
    }
}

/// Fetch player->user mapping for a game from MongoDB.
async fn fetch_game_players(
    db: &Db,
    game_id: &str,
) -> Result<Vec<(String, String)>, Box<dyn std::error::Error + Send + Sync>> {
    let oid = bson::oid::ObjectId::parse_str(game_id)?;
    let game = db
        .games
        .find_one(doc! { "_id": oid })
        .await?;

    let mut players = Vec::new();
    if let Some(game) = game {
        if let Some(galaxy) = game.get_document("galaxy").ok() {
            if let Some(player_arr) = galaxy.get_array("players").ok() {
                for p in player_arr {
                    if let Some(pdoc) = p.as_document() {
                        let pid = pdoc
                            .get_object_id("_id")
                            .ok()
                            .map(|id| id.to_hex());
                        let uid = pdoc
                            .get_object_id("userId")
                            .ok()
                            .map(|id| id.to_hex());
                        if let (Some(pid), Some(uid)) = (pid, uid) {
                            players.push((pid, uid));
                        }
                    }
                }
            }
        }
    }

    Ok(players)
}

async fn get_or_create_prefs(db: &Db, user_id: &str) -> UserPreferencesDoc {
    match db
        .user_preferences
        .find_one(doc! { "_id": user_id })
        .await
    {
        Ok(Some(prefs)) => prefs,
        _ => UserPreferencesDoc::defaults(user_id.to_string()),
    }
}
