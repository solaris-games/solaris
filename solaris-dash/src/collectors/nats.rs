use crate::store::NatsMetrics;

pub async fn collect(client: &reqwest::Client, base_url: &str) -> NatsMetrics {
    let mut metrics = NatsMetrics::default();

    // /varz - server variables
    if let Ok(resp) = client.get(format!("{base_url}/varz")).send().await {
        if let Ok(json) = resp.json::<serde_json::Value>().await {
            metrics.connections = json_u64(&json, "connections");
            metrics.subscriptions = json_u64(&json, "subscriptions");
            metrics.in_msgs = json_u64(&json, "in_msgs");
            metrics.out_msgs = json_u64(&json, "out_msgs");
            metrics.in_bytes = json_u64(&json, "in_bytes");
            metrics.out_bytes = json_u64(&json, "out_bytes");
            metrics.slow_consumers = json_u64(&json, "slow_consumers");
        }
    }

    // /jsz - JetStream stats
    if let Ok(resp) = client.get(format!("{base_url}/jsz")).send().await {
        if let Ok(json) = resp.json::<serde_json::Value>().await {
            if let Some(streams) = json.get("account_details").and_then(|a| a.as_array()).or_else(|| json.get("streams").and_then(|s| s.as_array())) {
                for stream in streams {
                    metrics.stream_messages += json_u64(stream, "messages");
                    metrics.stream_bytes += json_u64(stream, "bytes");
                    if let Some(consumers) = stream.get("consumer_detail").and_then(|c| c.as_array()) {
                        for consumer in consumers {
                            metrics.consumer_pending += json_u64(consumer, "num_pending");
                        }
                    }
                }
            }
        }
    }

    metrics
}

fn json_u64(val: &serde_json::Value, key: &str) -> u64 {
    val.get(key)
        .and_then(|v| v.as_u64().or_else(|| v.as_f64().map(|f| f as u64)))
        .unwrap_or(0)
}
