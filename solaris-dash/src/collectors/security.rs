use std::sync::Arc;
use std::time::Duration;

use chrono::Utc;
use mongodb::Database;
use tokio::sync::RwLock;
use tracing::{error, info, warn};

use crate::store::{SecurityReport, SecuritySummary};

const SEED_JSON: &str = include_str!("../../data/security_seed.json");
const COLLECTION_NAME: &str = "security_reports";

pub struct SecurityCollector {
    db: Database,
    scan_interval: Duration,
    current_summary: Arc<RwLock<SecuritySummary>>,
}

impl SecurityCollector {
    pub fn new(db: Database, scan_interval_secs: u64) -> Self {
        Self {
            db,
            scan_interval: Duration::from_secs(scan_interval_secs),
            current_summary: Arc::new(RwLock::new(SecuritySummary::default())),
        }
    }

    /// Load initial data from MongoDB or seed.
    pub async fn init(&self) {
        let collection = self.db.collection::<SecurityReport>(COLLECTION_NAME);

        // Check if we already have a report in MongoDB
        match collection.find_one(mongodb::bson::doc! {}).await {
            Ok(Some(report)) => {
                info!(scan_id = %report.scan_id, "loaded existing security report from MongoDB");
                self.update_summary_from_report(&report).await;
            }
            Ok(None) => {
                info!("no existing security report, loading seed data");
                match serde_json::from_str::<SecurityReport>(SEED_JSON) {
                    Ok(seed_report) => {
                        if let Err(e) = collection.insert_one(&seed_report).await {
                            error!(error = %e, "failed to insert seed security report");
                        } else {
                            info!("inserted seed security report into MongoDB");
                        }
                        self.update_summary_from_report(&seed_report).await;
                    }
                    Err(e) => {
                        error!(error = %e, "failed to parse seed security data");
                    }
                }
            }
            Err(e) => {
                warn!(error = %e, "failed to query MongoDB for security report, loading from seed");
                if let Ok(seed_report) = serde_json::from_str::<SecurityReport>(SEED_JSON) {
                    self.update_summary_from_report(&seed_report).await;
                }
            }
        }
    }

    /// Fast read for the 10-second collector loop.
    pub async fn get_summary(&self) -> SecuritySummary {
        self.current_summary.read().await.clone()
    }

    /// Long-running background loop on its own interval.
    pub async fn run_scan_loop(&self) {
        info!(
            interval_secs = self.scan_interval.as_secs(),
            "security scan loop started (next scan in {}h)",
            self.scan_interval.as_secs() / 3600
        );

        loop {
            tokio::time::sleep(self.scan_interval).await;

            info!("starting security scan");
            {
                let mut summary = self.current_summary.write().await;
                summary.scan_status = "scanning".into();
            }

            match self.execute_scan().await {
                Ok(report) => {
                    info!(scan_id = %report.scan_id, "security scan completed");
                    self.update_summary_from_report(&report).await;
                }
                Err(e) => {
                    error!(error = %e, "security scan failed");
                    let mut summary = self.current_summary.write().await;
                    summary.scan_status = "error".into();
                }
            }
        }
    }

    /// Execute a scan pass. Currently reloads from MongoDB/seed.
    /// Future: query OSV.dev API, parse Cargo.lock/package-lock.json, etc.
    async fn execute_scan(&self) -> Result<SecurityReport, Box<dyn std::error::Error + Send + Sync>> {
        let start = std::time::Instant::now();
        let collection = self.db.collection::<SecurityReport>(COLLECTION_NAME);

        // For now, reload the current report from MongoDB
        // Future enhancement: run live vulnerability scans here
        let report = match collection.find_one(mongodb::bson::doc! {}).await? {
            Some(mut report) => {
                // Update timestamps
                report.scanned_at = Utc::now().to_rfc3339();
                let next = Utc::now() + chrono::Duration::seconds(self.scan_interval.as_secs() as i64);
                report.next_scan_at = next.to_rfc3339();
                report.scan_duration_secs = start.elapsed().as_secs();
                report.scan_id = format!("scan-{}", Utc::now().format("%Y%m%d-%H%M%S"));

                // Upsert back into MongoDB (replace the single document)
                collection.delete_many(mongodb::bson::doc! {}).await?;
                collection.insert_one(&report).await?;

                report
            }
            None => {
                // Fall back to seed data
                let mut report: SecurityReport = serde_json::from_str(SEED_JSON)?;
                report.scanned_at = Utc::now().to_rfc3339();
                let next = Utc::now() + chrono::Duration::seconds(self.scan_interval.as_secs() as i64);
                report.next_scan_at = next.to_rfc3339();
                report.scan_duration_secs = start.elapsed().as_secs();
                report.scan_id = format!("scan-{}", Utc::now().format("%Y%m%d-%H%M%S"));

                collection.insert_one(&report).await?;
                report
            }
        };

        Ok(report)
    }

    async fn update_summary_from_report(&self, report: &SecurityReport) {
        let p0_count = report
            .remediation
            .iter()
            .filter(|r| r.priority == "P0" && r.status != "completed")
            .count() as u64;

        let summary = SecuritySummary {
            last_scan: report.scanned_at.clone(),
            next_scan: report.next_scan_at.clone(),
            total_vulns: report.summary.total_vulnerabilities,
            critical: report.summary.critical,
            high: report.summary.high,
            medium: report.summary.medium,
            low: report.summary.low,
            p0_items: p0_count,
            scan_status: "idle".into(),
        };

        let mut current = self.current_summary.write().await;
        *current = summary;
    }
}
