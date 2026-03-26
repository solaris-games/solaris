use axum::{
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
};
use base64::{engine::general_purpose::STANDARD, Engine};
use bson::doc;
use hmac::{Hmac, Mac};
use sha2::Sha256;

use crate::api::handlers::AppState;

/// Extractor that validates a Solaris session cookie and returns the userId.
pub struct AuthUser(pub String);

#[async_trait::async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let cookie_header = parts
            .headers
            .get("cookie")
            .and_then(|v| v.to_str().ok())
            .ok_or(StatusCode::UNAUTHORIZED)?;

        let sid = parse_cookie(cookie_header, "connect.sid")
            .ok_or(StatusCode::UNAUTHORIZED)?;

        let session_id =
            unsign_cookie(&sid, &state.config.session_secret).ok_or(StatusCode::UNAUTHORIZED)?;

        let user_id = lookup_session(&state.db, &session_id)
            .await
            .map_err(|_| StatusCode::UNAUTHORIZED)?
            .ok_or(StatusCode::UNAUTHORIZED)?;

        Ok(AuthUser(user_id))
    }
}

/// Parse a specific cookie value from a cookie header string.
fn parse_cookie(header: &str, name: &str) -> Option<String> {
    for part in header.split(';') {
        let part = part.trim();
        if let Some(value) = part.strip_prefix(&format!("{name}=")) {
            // URL-decode the value
            let decoded = urldecode(value);
            return Some(decoded);
        }
    }
    None
}

fn urldecode(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                result.push(byte as char);
            }
        } else {
            result.push(c);
        }
    }
    result
}

/// Unsign an Express cookie-signature signed cookie.
/// Format: "s:<session_id>.<base64_hmac_signature>"
fn unsign_cookie(signed: &str, secret: &str) -> Option<String> {
    let val = signed.strip_prefix("s:")?;
    let dot_pos = val.rfind('.')?;
    let session_id = &val[..dot_pos];
    let provided_sig = &val[dot_pos + 1..];

    // Compute HMAC-SHA256 with base64 encoding (matching Express cookie-signature)
    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes()).ok()?;
    mac.update(session_id.as_bytes());
    let result = mac.finalize().into_bytes();
    let expected_sig = STANDARD.encode(result);
    // Strip trailing '=' to match Express behavior
    let expected_sig = expected_sig.trim_end_matches('=');

    if constant_time_eq(provided_sig.as_bytes(), expected_sig.as_bytes()) {
        Some(session_id.to_string())
    } else {
        None
    }
}

fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b.iter()).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

/// Look up a session in the MongoDB sessions collection.
async fn lookup_session(
    db: &crate::db::mongo::Db,
    session_id: &str,
) -> Result<Option<String>, mongodb::error::Error> {
    let doc = db
        .sessions
        .find_one(doc! { "_id": session_id })
        .await?;

    if let Some(doc) = doc {
        // connect-mongodb-session stores session as a JSON string in the "session" field
        if let Some(session_str) = doc.get_str("session").ok() {
            if let Ok(session_obj) = serde_json::from_str::<serde_json::Value>(session_str) {
                if let Some(user_id) = session_obj.get("userId").and_then(|v| v.as_str()) {
                    return Ok(Some(user_id.to_string()));
                }
            }
        }
    }

    Ok(None)
}
