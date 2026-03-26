use mongodb::{Client, Collection};

use super::models::{GameDocument, GameEventDocument, GameHistoryDocument};

#[derive(Clone)]
pub struct Db {
    pub games: Collection<GameDocument>,
    pub history: Collection<GameHistoryDocument>,
    pub events: Collection<GameEventDocument>,
}

impl Db {
    pub async fn connect(uri: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(uri).await?;
        let db = client.database("solaris");

        // Ping to verify connection
        db.run_command(bson::doc! { "ping": 1 }).await?;

        Ok(Self {
            games: db.collection("games"),
            history: db.collection("gamehistories"),
            events: db.collection("gameevents"),
        })
    }
}
