pub mod notifications;
pub mod preferences;
pub mod webhooks;

use std::sync::Arc;

use crate::channels::websocket::ConnectionManager;
use crate::config::Config;
use crate::db::mongo::Db;

#[derive(Clone)]
pub struct AppState {
    pub db: Db,
    pub ws_connections: Arc<ConnectionManager>,
    pub config: Arc<Config>,
}
