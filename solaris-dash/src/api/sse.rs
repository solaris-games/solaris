use std::convert::Infallible;
use std::time::Duration;

use axum::{
    extract::State,
    response::{
        sse::{Event, KeepAlive},
        Sse,
    },
};
use futures::Stream;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt;

use super::handlers::AppState;
use crate::store::MetricsSnapshot;

pub async fn events_stream(
    State(state): State<AppState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let rx = state.sse_tx.subscribe();
    let stream = BroadcastStream::new(rx).filter_map(|result| match result {
        Ok(snapshot) => {
            let json = serde_json::to_string(&snapshot).unwrap_or_default();
            Some(Ok(Event::default().data(json)))
        }
        Err(_) => None, // Lagged — skip
    });

    Sse::new(stream).keep_alive(KeepAlive::new().interval(Duration::from_secs(30)))
}
