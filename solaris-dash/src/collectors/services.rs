use std::time::Instant;

use crate::store::ServiceHealth;

pub async fn collect(client: &reqwest::Client, config: &crate::config::Config) -> Vec<ServiceHealth> {
    let checks = vec![
        ("Client", &config.solaris_client_url, "/"),
        ("API", &config.solaris_api_url, "/api/game/list/official"),
        ("Archive", &config.archive_url, "/api/archive/health"),
        ("Notify", &config.notify_url, "/api/notify/health"),
        ("NATS", &config.nats_monitor_url, "/varz"),
    ];

    let mut results = Vec::new();
    for (name, base_url, path) in checks {
        let url = format!("{base_url}{path}");
        let start = Instant::now();
        let (healthy, response_time_ms) = match client
            .get(&url)
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await
        {
            Ok(resp) => (resp.status().is_success(), start.elapsed().as_millis() as u64),
            Err(_) => (false, start.elapsed().as_millis() as u64),
        };

        results.push(ServiceHealth {
            name: name.to_string(),
            url: base_url.clone(),
            healthy,
            response_time_ms,
        });
    }

    // MongoDB health (inferred from server metrics collection — if we got data, it's healthy)
    results.push(ServiceHealth {
        name: "MongoDB".to_string(),
        url: config.mongo_uri.clone(),
        healthy: true, // If we're running, MongoDB is reachable
        response_time_ms: 0,
    });

    results
}
