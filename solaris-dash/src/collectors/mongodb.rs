use bson::doc;
use mongodb::Database;

use crate::store::{CollectionStats, GameMetrics, GameTypeCount, MongoDbMetrics, NotificationMetrics};

pub async fn collect_server(db: &Database) -> MongoDbMetrics {
    let mut metrics = MongoDbMetrics::default();

    // serverStatus
    if let Ok(status) = db.run_command(doc! { "serverStatus": 1 }).await {
        if let Ok(conn) = status.get_document("connections") {
            metrics.connections_current = conn.get_i32("current").unwrap_or(0) as u64;
            metrics.connections_available = conn.get_i32("available").unwrap_or(0) as u64;
        }
        if let Ok(ops) = status.get_document("opcounters") {
            metrics.opcounters_query = ops.get_i64("query").or(ops.get_i32("query").map(|v| v as i64)).unwrap_or(0) as u64;
            metrics.opcounters_insert = ops.get_i64("insert").or(ops.get_i32("insert").map(|v| v as i64)).unwrap_or(0) as u64;
            metrics.opcounters_update = ops.get_i64("update").or(ops.get_i32("update").map(|v| v as i64)).unwrap_or(0) as u64;
            metrics.opcounters_delete = ops.get_i64("delete").or(ops.get_i32("delete").map(|v| v as i64)).unwrap_or(0) as u64;
        }
        if let Ok(mem) = status.get_document("mem") {
            metrics.mem_resident_mb = mem.get_i32("resident").unwrap_or(0) as u64;
        }
        metrics.uptime_secs = status.get_f64("uptime").unwrap_or(0.0) as u64;
    }

    // dbStats
    if let Ok(db_stats) = db.run_command(doc! { "dbStats": 1 }).await {
        metrics.data_size_bytes = get_u64(&db_stats, "dataSize");
        metrics.storage_size_bytes = get_u64(&db_stats, "storageSize");
        metrics.collections_count = get_u64(&db_stats, "collections");
    }

    // Top collection sizes
    let collections = ["games", "users", "gamehistories", "gameevents", "sessions", "notifications"];
    for name in &collections {
        if let Ok(stats) = db.run_command(doc! { "collStats": *name }).await {
            metrics.top_collections.push(CollectionStats {
                name: name.to_string(),
                count: get_u64(&stats, "count"),
                size_bytes: get_u64(&stats, "size"),
            });
        }
    }

    metrics
}

pub async fn collect_games(db: &Database) -> GameMetrics {
    let mut metrics = GameMetrics::default();
    let games = db.collection::<bson::Document>("games");
    let users = db.collection::<bson::Document>("users");

    metrics.active_games = games
        .count_documents(doc! { "state.endDate": null, "settings.general.type": { "$ne": "tutorial" } })
        .await
        .unwrap_or(0);

    metrics.finished_games = games
        .count_documents(doc! { "state.endDate": { "$ne": null } })
        .await
        .unwrap_or(0);

    metrics.total_users = users.count_documents(doc! {}).await.unwrap_or(0);

    let day_ago = chrono::Utc::now() - chrono::Duration::days(1);
    let week_ago = chrono::Utc::now() - chrono::Duration::days(7);

    metrics.players_online_24h = users
        .count_documents(doc! { "lastSeen": { "$gt": bson::DateTime::from_chrono(day_ago) } })
        .await
        .unwrap_or(0);

    // Registrations: count users with _id > threshold ObjectId
    let day_oid = bson::oid::ObjectId::from_bytes(timestamp_to_oid_bytes(day_ago));
    let week_oid = bson::oid::ObjectId::from_bytes(timestamp_to_oid_bytes(week_ago));

    metrics.registrations_1d = users
        .count_documents(doc! { "_id": { "$gt": day_oid } })
        .await
        .unwrap_or(0);

    metrics.registrations_7d = users
        .count_documents(doc! { "_id": { "$gt": week_oid } })
        .await
        .unwrap_or(0);

    // Game type distribution (top types)
    if let Ok(mut cursor) = games
        .aggregate(vec![
            doc! { "$match": { "settings.general.type": { "$ne": "tutorial" } } },
            doc! { "$group": { "_id": "$settings.general.type", "count": { "$sum": 1 } } },
            doc! { "$sort": { "count": -1 } },
            doc! { "$limit": 10 },
        ])
        .await
    {
        use futures::StreamExt;
        while let Some(Ok(doc)) = cursor.next().await {
            let game_type = doc.get_str("_id").unwrap_or("unknown").to_string();
            let count = get_u64(&doc, "count");
            metrics.game_types.push(GameTypeCount { game_type, count });
        }
    }

    metrics
}

pub async fn collect_notifications(db: &Database) -> NotificationMetrics {
    let mut metrics = NotificationMetrics::default();
    let notifications = db.collection::<bson::Document>("notifications");
    let webhooks = db.collection::<bson::Document>("webhook_configs");

    metrics.total_notifications = notifications.count_documents(doc! {}).await.unwrap_or(0);
    metrics.unread_notifications = notifications
        .count_documents(doc! { "read": false })
        .await
        .unwrap_or(0);
    metrics.webhook_configs_active = webhooks
        .count_documents(doc! { "active": true })
        .await
        .unwrap_or(0);
    metrics.webhook_last_failures = webhooks
        .count_documents(doc! { "active": true, "lastDeliveryStatus": { "$ne": 200 }, "lastDeliveryStatus": { "$ne": null } })
        .await
        .unwrap_or(0);

    metrics
}

fn get_u64(doc: &bson::Document, key: &str) -> u64 {
    doc.get_i64(key)
        .map(|v| v as u64)
        .or_else(|_| doc.get_i32(key).map(|v| v as u64))
        .or_else(|_| doc.get_f64(key).map(|v| v as u64))
        .unwrap_or(0)
}

fn timestamp_to_oid_bytes(dt: chrono::DateTime<chrono::Utc>) -> [u8; 12] {
    let ts = dt.timestamp() as u32;
    let mut bytes = [0u8; 12];
    bytes[0..4].copy_from_slice(&ts.to_be_bytes());
    bytes
}
