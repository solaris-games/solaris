use bson::{doc, Document};
use mongodb::{Client, Collection, IndexModel};

use super::models::{NotificationDoc, UserPreferencesDoc, WebhookConfigDoc};

#[derive(Clone)]
pub struct Db {
    pub client: Client,
    // Solaris source collections (read-only)
    pub game_events: Collection<Document>,
    pub games: Collection<Document>,
    pub users: Collection<Document>,
    pub sessions: Collection<Document>,
    // Owned collections
    pub notifications: Collection<NotificationDoc>,
    pub webhook_configs: Collection<WebhookConfigDoc>,
    pub user_preferences: Collection<UserPreferencesDoc>,
}

impl Db {
    pub async fn connect(uri: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(uri).await?;
        let db = client.database("solaris");

        db.run_command(doc! { "ping": 1 }).await?;

        let this = Self {
            client,
            game_events: db.collection("gameevents"),
            games: db.collection("games"),
            users: db.collection("users"),
            sessions: db.collection("sessions"),
            notifications: db.collection("notifications"),
            webhook_configs: db.collection("webhook_configs"),
            user_preferences: db.collection("user_preferences"),
        };

        this.create_indexes().await?;
        Ok(this)
    }

    async fn create_indexes(&self) -> Result<(), mongodb::error::Error> {
        // Notifications: (userId, createdAt DESC) for listing
        self.notifications
            .create_index(
                IndexModel::builder()
                    .keys(doc! { "userId": 1, "createdAt": -1 })
                    .build(),
            )
            .await?;

        // Notifications: (userId, read) for unread count
        self.notifications
            .create_index(
                IndexModel::builder()
                    .keys(doc! { "userId": 1, "read": 1 })
                    .build(),
            )
            .await?;

        // Webhook configs: userId
        self.webhook_configs
            .create_index(
                IndexModel::builder()
                    .keys(doc! { "userId": 1 })
                    .build(),
            )
            .await?;

        // User preferences: unique userId
        self.user_preferences
            .create_index(
                IndexModel::builder()
                    .keys(doc! { "userId": 1 })
                    .options(mongodb::options::IndexOptions::builder().unique(true).build())
                    .build(),
            )
            .await?;

        Ok(())
    }
}
