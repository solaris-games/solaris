use crate::store::ArchiveMetrics;

pub async fn collect(client: &reqwest::Client, base_url: &str) -> ArchiveMetrics {
    let mut metrics = ArchiveMetrics::default();

    // Health check
    metrics.healthy = client
        .get(format!("{base_url}/api/archive/health"))
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .map(|r| r.status().is_success())
        .unwrap_or(false);

    // Games list with metadata
    if let Ok(resp) = client
        .get(format!("{base_url}/api/archive/games"))
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
    {
        if let Ok(json) = resp.json::<serde_json::Value>().await {
            if let Some(games) = json.get("games").and_then(|g| g.as_array()) {
                metrics.games_archived = games.len() as u64;
                metrics.total_size_bytes = games
                    .iter()
                    .filter_map(|g| g.get("totalSizeBytes").and_then(|v| v.as_u64()))
                    .sum();
            }
        }
    }

    metrics
}
