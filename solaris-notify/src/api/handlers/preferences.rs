use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use bson::doc;

use crate::auth::session::AuthUser;
use crate::db::models::UserPreferencesDoc;

use super::AppState;

pub async fn get(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
) -> impl IntoResponse {
    let prefs = match state
        .db
        .user_preferences
        .find_one(doc! { "_id": &user_id })
        .await
    {
        Ok(Some(p)) => p,
        Ok(None) => UserPreferencesDoc::defaults(user_id),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    Json(prefs).into_response()
}

pub async fn update(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Json(mut prefs): Json<UserPreferencesDoc>,
) -> impl IntoResponse {
    prefs.user_id = user_id.clone();

    let result = state
        .db
        .user_preferences
        .replace_one(doc! { "_id": &user_id }, &prefs)
        .upsert(true)
        .await;

    match result {
        Ok(_) => Json(prefs).into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}
