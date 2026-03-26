pub mod archive;
pub mod docker;
pub mod mongodb;
pub mod nats;
pub mod security;
pub mod services;

use std::sync::Arc;
use std::time::Duration;

use bollard::Docker;
use ::mongodb::Database;
use tokio::sync::broadcast;
use tracing::{error, info};

use crate::config::Config;
use crate::store::{Alert, MetricsSnapshot, MetricsStore, SecuritySummary};

pub struct CollectorContext {
    pub docker: Docker,
    pub db: Database,
    pub http: reqwest::Client,
    pub config: Config,
    pub security: Arc<security::SecurityCollector>,
}

/// Run the collector loop: gather metrics from all sources every N seconds.
pub async fn run_loop(
    ctx: Arc<CollectorContext>,
    store: Arc<MetricsStore>,
    tx: broadcast::Sender<MetricsSnapshot>,
) {
    let interval = Duration::from_secs(ctx.config.collect_interval_secs);
    info!(interval_secs = ctx.config.collect_interval_secs, "collector loop started");

    loop {
        let snapshot = collect_all(&ctx).await;
        store.push(snapshot.clone()).await;

        // Broadcast to SSE subscribers (ignore errors if no listeners)
        let _ = tx.send(snapshot);

        tokio::time::sleep(interval).await;
    }
}

async fn collect_all(ctx: &CollectorContext) -> MetricsSnapshot {
    // Run all collectors concurrently
    let (containers, mongo_server, games, notifications, nats_metrics, archive_metrics, service_health, security_summary) = tokio::join!(
        docker::collect(&ctx.docker),
        mongodb::collect_server(&ctx.db),
        mongodb::collect_games(&ctx.db),
        mongodb::collect_notifications(&ctx.db),
        nats::collect(&ctx.http, &ctx.config.nats_monitor_url),
        archive::collect(&ctx.http, &ctx.config.archive_url),
        services::collect(&ctx.http, &ctx.config),
        ctx.security.get_summary(),
    );

    // Detect bottlenecks
    let mut alerts = detect_alerts(&containers, &mongo_server, &nats_metrics, &service_health);
    detect_security_alerts(&security_summary, &mut alerts);

    MetricsSnapshot {
        timestamp: chrono::Utc::now().to_rfc3339(),
        containers,
        mongodb: mongo_server,
        nats: nats_metrics,
        games,
        notifications,
        archive: archive_metrics,
        services: service_health,
        security: security_summary,
        alerts,
    }
}

fn detect_alerts(
    containers: &[crate::store::ContainerMetrics],
    mongo: &crate::store::MongoDbMetrics,
    nats: &crate::store::NatsMetrics,
    services: &[crate::store::ServiceHealth],
) -> Vec<Alert> {
    let mut alerts = Vec::new();

    // Container resource alerts
    for c in containers {
        if c.cpu_percent > 90.0 {
            alerts.push(Alert {
                severity: "critical".into(),
                source: c.name.clone(),
                message: format!("CPU usage at {:.1}%", c.cpu_percent),
            });
        } else if c.cpu_percent > 80.0 {
            alerts.push(Alert {
                severity: "warning".into(),
                source: c.name.clone(),
                message: format!("CPU usage at {:.1}%", c.cpu_percent),
            });
        }

        if c.memory_limit_bytes > 0 {
            let mem_pct = (c.memory_usage_bytes as f64 / c.memory_limit_bytes as f64) * 100.0;
            if mem_pct > 85.0 {
                alerts.push(Alert {
                    severity: "critical".into(),
                    source: c.name.clone(),
                    message: format!("Memory usage at {:.1}%", mem_pct),
                });
            }
        }
    }

    // MongoDB connection pressure
    if mongo.connections_available > 0 {
        let conn_pct = (mongo.connections_current as f64
            / (mongo.connections_current + mongo.connections_available) as f64)
            * 100.0;
        if conn_pct > 80.0 {
            alerts.push(Alert {
                severity: "warning".into(),
                source: "MongoDB".into(),
                message: format!("Connection usage at {:.1}%", conn_pct),
            });
        }
    }

    // NATS consumer backlog
    if nats.consumer_pending > 100 {
        alerts.push(Alert {
            severity: "warning".into(),
            source: "NATS".into(),
            message: format!("{} pending messages in consumer queue", nats.consumer_pending),
        });
    }

    // Service health failures
    for svc in services {
        if !svc.healthy {
            alerts.push(Alert {
                severity: "critical".into(),
                source: svc.name.clone(),
                message: format!("{} is not responding", svc.name),
            });
        }
    }

    alerts
}

fn detect_security_alerts(security: &SecuritySummary, alerts: &mut Vec<Alert>) {
    if security.critical > 0 {
        alerts.push(Alert {
            severity: "critical".into(),
            source: "Security".into(),
            message: format!(
                "{} critical vulnerabilities require immediate patching",
                security.critical
            ),
        });
    }
    if security.p0_items > 0 {
        alerts.push(Alert {
            severity: "critical".into(),
            source: "Security".into(),
            message: format!(
                "{} P0 remediation items pending",
                security.p0_items
            ),
        });
    }
    if security.high > 0 {
        alerts.push(Alert {
            severity: "warning".into(),
            source: "Security".into(),
            message: format!(
                "{} high-severity vulnerabilities across the stack",
                security.high
            ),
        });
    }
}
