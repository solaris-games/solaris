use bollard::container::{ListContainersOptions, StatsOptions};
use bollard::Docker;
use futures::StreamExt;
use std::collections::HashMap;

use crate::store::ContainerMetrics;

pub async fn collect(docker: &Docker) -> Vec<ContainerMetrics> {
    let mut results = Vec::new();

    let opts = ListContainersOptions::<String> {
        all: true,
        ..Default::default()
    };

    let containers = match docker.list_containers(Some(opts)).await {
        Ok(c) => c,
        Err(e) => {
            tracing::warn!(error = %e, "failed to list containers");
            return results;
        }
    };

    for container in containers {
        let id = match &container.id {
            Some(id) => id.clone(),
            None => continue,
        };

        let name = container
            .names
            .as_ref()
            .and_then(|n| n.first())
            .map(|n| n.trim_start_matches('/').to_string())
            .unwrap_or_else(|| id[..12].to_string());

        // Filter to solaris-related containers
        if !name.contains("solaris") && !name.contains("nats") && !name.contains("mongo") {
            continue;
        }

        let status = container
            .state
            .as_deref()
            .unwrap_or("unknown")
            .to_string();

        let health = container
            .status
            .as_deref()
            .unwrap_or("")
            .to_string();

        // Get stats
        let stats_opts = StatsOptions {
            stream: false,
            one_shot: true,
        };

        let mut stats_stream = docker.stats(&id, Some(stats_opts));
        let (cpu_percent, mem_usage, mem_limit, net_rx, net_tx) =
            if let Some(Ok(stats)) = stats_stream.next().await {
                let cpu = calculate_cpu_percent(&stats);
                let mem = stats.memory_stats.usage.unwrap_or(0);
                let mem_lim = stats.memory_stats.limit.unwrap_or(0);
                let (rx, tx) = extract_network(&stats);
                (cpu, mem, mem_lim, rx, tx)
            } else {
                (0.0, 0, 0, 0, 0)
            };

        // Get uptime and restart count from inspect
        let (uptime, restarts) = match docker.inspect_container(&id, None).await {
            Ok(info) => {
                let started = info
                    .state
                    .as_ref()
                    .and_then(|s| s.started_at.as_deref())
                    .and_then(|s| chrono::DateTime::parse_from_rfc3339(s).ok())
                    .map(|dt| {
                        (chrono::Utc::now() - dt.with_timezone(&chrono::Utc))
                            .num_seconds()
                            .max(0) as u64
                    })
                    .unwrap_or(0);
                let restarts = info
                    .restart_count
                    .map(|r| r as u64)
                    .unwrap_or(0);
                (started, restarts)
            }
            Err(_) => (0, 0),
        };

        results.push(ContainerMetrics {
            id: id[..12].to_string(),
            name,
            status,
            health,
            uptime_secs: uptime,
            restart_count: restarts,
            cpu_percent,
            memory_usage_bytes: mem_usage,
            memory_limit_bytes: mem_limit,
            net_rx_bytes: net_rx,
            net_tx_bytes: net_tx,
        });
    }

    results
}

fn calculate_cpu_percent(stats: &bollard::container::Stats) -> f64 {
    let cpu_delta = stats.cpu_stats.cpu_usage.total_usage as f64
        - stats.precpu_stats.cpu_usage.total_usage as f64;
    let system_delta = stats.cpu_stats.system_cpu_usage.unwrap_or(0) as f64
        - stats.precpu_stats.system_cpu_usage.unwrap_or(0) as f64;

    if system_delta > 0.0 {
        let num_cpus = stats
            .cpu_stats
            .online_cpus
            .unwrap_or(1) as f64;
        (cpu_delta / system_delta) * num_cpus * 100.0
    } else {
        0.0
    }
}

fn extract_network(stats: &bollard::container::Stats) -> (u64, u64) {
    if let Some(networks) = &stats.networks {
        let mut rx = 0u64;
        let mut tx = 0u64;
        for net in networks.values() {
            rx += net.rx_bytes;
            tx += net.tx_bytes;
        }
        (rx, tx)
    } else {
        (0, 0)
    }
}
