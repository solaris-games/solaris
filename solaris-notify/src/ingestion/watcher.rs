use bson::doc;
use futures::StreamExt;
use mongodb::options::ChangeStreamOptions;
use tracing::{error, info, warn};

use crate::bus::nats::NatsBus;
use crate::db::mongo::Db;
use crate::ingestion::transformer;

/// Watch the gameevents collection via change stream and publish to NATS.
pub async fn run(db: Db, nats: NatsBus) {
    loop {
        info!("starting change stream watcher");
        if let Err(e) = watch_loop(&db, &nats).await {
            error!(error = %e, "change stream error, restarting in 5s");
            tokio::time::sleep(std::time::Duration::from_secs(5)).await;
        }
    }
}

async fn watch_loop(
    db: &Db,
    nats: &NatsBus,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let pipeline = vec![doc! { "$match": { "operationType": "insert" } }];
    let options = ChangeStreamOptions::builder().build();

    let mut stream = db.game_events.watch().pipeline(pipeline).with_options(options).await?;

    info!("change stream watching gameevents collection");

    while let Some(event) = stream.next().await {
        match event {
            Ok(change_event) => {
                if let Some(doc) = change_event.full_document {
                    if let Some(notification_event) = transformer::transform(&doc) {
                        if let Err(e) = nats.publish_event(&notification_event).await {
                            warn!(error = %e, "failed to publish to NATS");
                        }
                    }
                }
            }
            Err(e) => {
                return Err(e.into());
            }
        }
    }

    Ok(())
}
