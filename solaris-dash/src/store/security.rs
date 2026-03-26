use serde::{Deserialize, Serialize};

// ── Top-level report stored in MongoDB ──

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SecurityReport {
    pub scan_id: String,
    pub scanned_at: String,
    pub next_scan_at: String,
    pub scan_duration_secs: u64,
    pub summary: VulnSummary,
    pub components: Vec<SbomComponent>,
    pub vulnerabilities: Vec<Vulnerability>,
    pub remediation: Vec<RemediationItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VulnSummary {
    pub total_dependencies: u64,
    pub total_vulnerabilities: u64,
    pub critical: u64,
    pub high: u64,
    pub medium: u64,
    pub low: u64,
    pub info: u64,
    pub components_scanned: u64,
}

// ── SBOM types ──

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SbomComponent {
    pub name: String,
    pub component_type: String, // "npm", "cargo", "infrastructure", "container"
    pub version: String,
    pub source_path: String,
    pub dependencies: Vec<SbomDependency>,
    pub license_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SbomDependency {
    pub name: String,
    pub version: String,
    pub purpose: String,
    pub license: String,
    pub is_dev: bool,
    pub is_direct: bool,
}

// ── Vulnerability types ──

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Vulnerability {
    pub id: String,
    pub severity: String, // "critical", "high", "medium", "low", "info"
    pub cvss: Option<f64>,
    pub component: String,
    pub package_name: String,
    pub affected_versions: String,
    pub fixed_version: String,
    pub description: String,
    pub fix_available: String,
    pub exploited_in_wild: bool,
    pub reference_url: String,
    pub remediation_priority: String, // "P0", "P1", "P2", "P3"
}

// ── Remediation types ──

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RemediationItem {
    pub priority: String, // "P0", "P1", "P2", "P3"
    pub component: String,
    pub action: String,
    pub effort: String, // "Low", "Medium", "High"
    pub status: String, // "pending", "in_progress", "completed"
}

// ── Lightweight summary for MetricsSnapshot ──

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecuritySummary {
    pub last_scan: String,
    pub next_scan: String,
    pub total_vulns: u64,
    pub critical: u64,
    pub high: u64,
    pub medium: u64,
    pub low: u64,
    pub p0_items: u64,
    pub scan_status: String, // "idle", "scanning", "error"
}

impl Default for SecuritySummary {
    fn default() -> Self {
        Self {
            last_scan: "never".into(),
            next_scan: "unknown".into(),
            total_vulns: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            p0_items: 0,
            scan_status: "idle".into(),
        }
    }
}
