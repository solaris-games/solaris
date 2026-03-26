use bson::Document;
use chrono::Utc;

use crate::db::models::NotificationEvent;

/// Transform a raw MongoDB event document into a NotificationEvent.
pub fn transform(doc: &Document) -> Option<NotificationEvent> {
    let game_id = doc.get_object_id("gameId").ok()?.to_hex();
    let event_type = doc.get_str("type").ok()?.to_string();
    let player_id = doc.get_object_id("playerId").ok().map(|id| id.to_hex());
    let tick = doc.get_i32("tick").ok();

    // Convert the data field to serde_json::Value
    let data = doc
        .get("data")
        .map(|v| bson::to_bson(v).ok())
        .flatten()
        .map(|b| {
            serde_json::to_value(&b).unwrap_or(serde_json::Value::Null)
        })
        .unwrap_or(serde_json::Value::Null);

    Some(NotificationEvent {
        game_id,
        player_id,
        event_type,
        tick,
        data,
        timestamp: Utc::now(),
    })
}
