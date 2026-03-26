use bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

/// Game document — only `state` is strongly typed for query purposes.
/// All other nested data is opaque JSON for pass-through storage.
#[derive(Debug, Serialize, Deserialize)]
pub struct GameDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(default)]
    pub settings: serde_json::Value,
    #[serde(default)]
    pub galaxy: serde_json::Value,
    #[serde(default)]
    pub conversations: serde_json::Value,
    pub state: GameState,
    #[serde(default)]
    pub constants: serde_json::Value,
    #[serde(default)]
    pub quitters: Vec<ObjectId>,
    #[serde(default)]
    pub afkers: Vec<ObjectId>,
    #[serde(default)]
    pub spectators: Vec<ObjectId>,
    /// Catch-all for any other fields
    #[serde(flatten)]
    pub extra: serde_json::Map<String, serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GameState {
    #[serde(default)]
    pub tick: i32,
    #[serde(rename = "productionTick", default)]
    pub production_tick: i32,
    #[serde(rename = "startDate", default)]
    pub start_date: Option<bson::DateTime>,
    #[serde(rename = "endDate", default)]
    pub end_date: Option<bson::DateTime>,
    #[serde(default)]
    pub cleaned: Option<bool>,
    #[serde(default)]
    pub winner: Option<ObjectId>,
    #[serde(default)]
    pub paused: bool,
    /// Catch-all for other state fields
    #[serde(flatten)]
    pub extra: serde_json::Map<String, serde_json::Value>,
}

/// History tick document — mostly opaque for pass-through.
#[derive(Debug, Serialize, Deserialize)]
pub struct GameHistoryDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(rename = "gameId")]
    pub game_id: ObjectId,
    pub tick: i32,
    #[serde(rename = "productionTick", default)]
    pub production_tick: i32,
    #[serde(default)]
    pub players: serde_json::Value,
    #[serde(default)]
    pub stars: serde_json::Value,
    #[serde(default)]
    pub carriers: serde_json::Value,
    #[serde(flatten)]
    pub extra: serde_json::Map<String, serde_json::Value>,
}

/// Game event document — fully opaque except for gameId and tick.
#[derive(Debug, Serialize, Deserialize)]
pub struct GameEventDocument {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(rename = "gameId")]
    pub game_id: ObjectId,
    #[serde(default)]
    pub tick: Option<i32>,
    #[serde(flatten)]
    pub extra: serde_json::Map<String, serde_json::Value>,
}
