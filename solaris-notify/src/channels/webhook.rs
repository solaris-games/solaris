use bson::doc;
use chrono::Utc;
use futures::StreamExt;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use tracing::warn;

use crate::db::models::NotificationEvent;
use crate::db::mongo::Db;

/// Deliver webhook notifications for a user, checking their webhook configs.
pub async fn deliver_for_user(
    db: &Db,
    user_id: &str,
    event: &NotificationEvent,
    title: &str,
    body: &str,
) {
    let configs: Vec<_> = match db
        .webhook_configs
        .find(doc! { "userId": user_id, "active": true })
        .await
    {
        Ok(mut cursor) => {
            let mut configs = Vec::new();
            while let Some(Ok(config)) = cursor.next().await {
                configs.push(config);
            }
            configs
        }
        Err(_) => return,
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .unwrap_or_default();

    for config in configs {
        // Check event type filter
        if !config.event_types.is_empty() && !config.event_types.contains(&event.event_type) {
            continue;
        }

        let payload = serde_json::json!({
            "eventType": event.event_type,
            "gameId": event.game_id,
            "title": title,
            "body": body,
            "data": event.data,
            "timestamp": event.timestamp,
        });

        let body_str = serde_json::to_string(&payload).unwrap_or_default();
        let signature = sign_payload(&config.secret, &body_str);

        let result = client
            .post(&config.url)
            .header("Content-Type", "application/json")
            .header("X-Solaris-Signature", &signature)
            .body(body_str)
            .send()
            .await;

        let (status, now) = match result {
            Ok(resp) => (resp.status().as_u16(), Utc::now()),
            Err(e) => {
                warn!(error = %e, webhook_id = %config.id, "webhook delivery failed");
                (0u16, Utc::now())
            }
        };

        // Update delivery status
        let _ = db
            .webhook_configs
            .update_one(
                doc! { "_id": &config.id },
                doc! { "$set": {
                    "lastDeliveryAt": bson::DateTime::from_chrono(now),
                    "lastDeliveryStatus": status as i32,
                }},
            )
            .await;
    }
}

fn sign_payload(secret: &str, payload: &str) -> String {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).expect("HMAC key");
    mac.update(payload.as_bytes());
    let result = mac.finalize().into_bytes();
    hex::encode(result)
}
