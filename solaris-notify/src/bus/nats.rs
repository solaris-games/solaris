use async_nats::jetstream::{self, consumer::PullConsumer, stream::Stream as JsStream};
use tracing::info;

use crate::db::models::NotificationEvent;

#[derive(Clone)]
pub struct NatsBus {
    jetstream: jetstream::Context,
    stream_name: String,
}

impl NatsBus {
    pub async fn connect(url: &str) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let client = async_nats::connect(url).await?;
        let jetstream = jetstream::new(client);

        let stream_name = "SOLARIS_EVENTS".to_string();

        // Create or get the stream
        let _stream = jetstream
            .get_or_create_stream(jetstream::stream::Config {
                name: stream_name.clone(),
                subjects: vec!["solaris.events.>".to_string()],
                retention: jetstream::stream::RetentionPolicy::WorkQueue,
                max_age: std::time::Duration::from_secs(86400), // 24h
                ..Default::default()
            })
            .await?;

        info!("NATS JetStream connected, stream: {}", stream_name);

        Ok(Self {
            jetstream,
            stream_name,
        })
    }

    /// Publish a notification event to NATS.
    pub async fn publish_event(
        &self,
        event: &NotificationEvent,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let subject = format!("solaris.events.{}.{}", event.game_id, event.event_type);
        let payload = serde_json::to_vec(event)?;
        self.jetstream
            .publish(subject, payload.into())
            .await?
            .await?;
        Ok(())
    }

    /// Create a durable pull consumer for all events.
    pub async fn create_consumer(
        &self,
    ) -> Result<PullConsumer, Box<dyn std::error::Error + Send + Sync>> {
        let stream: JsStream = self.jetstream.get_stream(&self.stream_name).await?;
        let consumer = stream
            .get_or_create_consumer(
                "notify-dispatcher",
                jetstream::consumer::pull::Config {
                    durable_name: Some("notify-dispatcher".to_string()),
                    filter_subject: "solaris.events.>".to_string(),
                    ..Default::default()
                },
            )
            .await?;

        info!("NATS consumer created: notify-dispatcher");
        Ok(consumer)
    }
}
