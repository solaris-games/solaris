// ── Charts ──
let opcountersChart, gameTypesChart;
const opcountersData = { labels: [], queries: [], inserts: [] };
const MAX_CHART_POINTS = 60;

function initCharts() {
    const opcCtx = document.getElementById('opcounters-chart');
    if (opcCtx) {
        opcountersChart = new Chart(opcCtx, {
            type: 'line',
            data: {
                labels: opcountersData.labels,
                datasets: [
                    { label: 'Queries', data: opcountersData.queries, borderColor: '#58a6ff', borderWidth: 1.5, pointRadius: 0, fill: false },
                    { label: 'Inserts', data: opcountersData.inserts, borderColor: '#2ea043', borderWidth: 1.5, pointRadius: 0, fill: false },
                ]
            },
            options: {
                responsive: true,
                animation: false,
                scales: {
                    x: { display: false },
                    y: { beginAtZero: true, ticks: { color: '#8b949e' }, grid: { color: '#30363d' } }
                },
                plugins: { legend: { labels: { color: '#c9d1d9', boxWidth: 12, font: { size: 11 } } } }
            }
        });
    }

    const gtCtx = document.getElementById('game-types-chart');
    if (gtCtx) {
        gameTypesChart = new Chart(gtCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#58a6ff','#2ea043','#bc8cff','#d29922','#f85149','#79c0ff','#56d364','#e3b341'] }] },
            options: {
                responsive: true,
                animation: false,
                plugins: { legend: { position: 'right', labels: { color: '#c9d1d9', font: { size: 11 }, boxWidth: 10 } } }
            }
        });
    }
}

// ── Rendering ──
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderServices(services) {
    const el = document.getElementById('services');
    el.innerHTML = services.map(s => `
        <div class="svc">
            <div class="dot ${s.healthy ? 'up' : 'down'}"></div>
            <span>${s.name}</span>
            ${s.responseTimeMs > 0 ? `<span class="ms">${s.responseTimeMs}ms</span>` : ''}
        </div>
    `).join('');
}

function renderContainers(containers) {
    const el = document.getElementById('container-bars');
    el.innerHTML = containers.map(c => {
        const memPct = c.memoryLimitBytes > 0 ? (c.memoryUsageBytes / c.memoryLimitBytes * 100) : 0;
        const cpuClass = c.cpuPercent > 90 ? 'crit' : c.cpuPercent > 80 ? 'warn' : '';
        const memClass = memPct > 85 ? 'crit' : memPct > 70 ? 'warn' : '';
        return `
        <div class="bar-group" onclick="openLogs('${c.id}', '${c.name}')" style="cursor:pointer" title="Click for logs">
            <div class="bar-label"><span>${c.name}</span><span>CPU: ${c.cpuPercent.toFixed(1)}% | Mem: ${formatBytes(c.memoryUsageBytes)}</span></div>
            <div class="bar-track"><div class="bar-fill ${cpuClass}" style="width: ${Math.min(c.cpuPercent, 100)}%"></div></div>
            <div class="bar-track" style="margin-top:2px"><div class="bar-fill ${memClass}" style="width: ${Math.min(memPct, 100)}%"></div></div>
        </div>`;
    }).join('');
}

function renderGameStats(games) {
    document.getElementById('game-stats').innerHTML = `
        <div class="stat"><div class="value">${games.activeGames}</div><div class="label">Active Games</div></div>
        <div class="stat"><div class="value">${games.finishedGames}</div><div class="label">Finished</div></div>
        <div class="stat"><div class="value">${games.totalUsers}</div><div class="label">Total Users</div></div>
        <div class="stat"><div class="value">${games.playersOnline24h}</div><div class="label">Online 24h</div></div>
        <div class="stat"><div class="value">${games.registrations1d}</div><div class="label">New Today</div></div>
        <div class="stat"><div class="value">${games.registrations7d}</div><div class="label">New 7d</div></div>
    `;

    if (gameTypesChart && games.gameTypes) {
        gameTypesChart.data.labels = games.gameTypes.map(t => t.gameType);
        gameTypesChart.data.datasets[0].data = games.gameTypes.map(t => t.count);
        gameTypesChart.update();
    }
}

function renderMongoStats(mongo) {
    document.getElementById('mongo-stats').innerHTML = `
        <div class="stat"><div class="value">${mongo.connectionsCurrent}</div><div class="label">Connections</div></div>
        <div class="stat"><div class="value">${mongo.memResidentMb} MB</div><div class="label">Memory</div></div>
        <div class="stat"><div class="value">${formatBytes(mongo.storageSizeBytes)}</div><div class="label">Storage</div></div>
    `;

    // Update opcounters chart
    const time = new Date().toLocaleTimeString();
    opcountersData.labels.push(time);
    opcountersData.queries.push(mongo.opcountersQuery);
    opcountersData.inserts.push(mongo.opcountersInsert);
    while (opcountersData.labels.length > MAX_CHART_POINTS) {
        opcountersData.labels.shift();
        opcountersData.queries.shift();
        opcountersData.inserts.shift();
    }
    if (opcountersChart) opcountersChart.update();

    // Collection table
    const tbody = document.querySelector('#coll-table tbody');
    if (tbody && mongo.topCollections) {
        tbody.innerHTML = mongo.topCollections.map(c =>
            `<tr><td>${c.name}</td><td>${c.count.toLocaleString()}</td><td>${formatBytes(c.sizeBytes)}</td></tr>`
        ).join('');
    }
}

function renderNotifyStats(notifications, nats) {
    document.getElementById('notify-stats').innerHTML = `
        <div class="stat"><div class="value">${notifications.totalNotifications}</div><div class="label">Total Notifs</div></div>
        <div class="stat"><div class="value">${notifications.unreadNotifications}</div><div class="label">Unread</div></div>
        <div class="stat"><div class="value">${notifications.webhookConfigsActive}</div><div class="label">Webhooks</div></div>
    `;

    document.getElementById('nats-stats').innerHTML = `
        <div class="stat"><div class="value">${nats.connections}</div><div class="label">NATS Conns</div></div>
        <div class="stat"><div class="value">${nats.inMsgs}</div><div class="label">Msgs In</div></div>
        <div class="stat"><div class="value">${nats.outMsgs}</div><div class="label">Msgs Out</div></div>
        <div class="stat"><div class="value">${nats.consumerPending}</div><div class="label">Pending</div></div>
    `;
}

function renderArchiveStats(archive) {
    document.getElementById('archive-stats').innerHTML = `
        <div class="stat"><div class="value">${archive.gamesArchived}</div><div class="label">Archived</div></div>
        <div class="stat"><div class="value">${formatBytes(archive.totalSizeBytes)}</div><div class="label">Total Size</div></div>
        <div class="stat"><div class="value dot-inline">
            <span class="dot ${archive.healthy ? 'up' : 'down'}" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${archive.healthy ? 'var(--green)' : 'var(--red)'}"></span>
        </div><div class="label">Health</div></div>
    `;
}

function renderAlerts(alerts) {
    const el = document.getElementById('alerts');
    if (!alerts || alerts.length === 0) {
        el.innerHTML = '<span style="color: var(--text-dim)">No alerts</span>';
        return;
    }
    el.innerHTML = alerts.map(a => `
        <div class="alert ${a.severity}">
            <span class="src">${a.source}</span>
            <span>${a.message}</span>
        </div>
    `).join('');
}

// ── Security ──

function renderSecuritySummary(security) {
    if (!security || security.lastScan === 'never') {
        document.getElementById('security-stats').innerHTML = '<span style="color:var(--text-dim)">No scan data yet</span>';
        return;
    }

    const scanInfo = document.getElementById('security-scan-info');
    const lastScan = security.lastScan !== 'never' ? new Date(security.lastScan).toLocaleString() : 'Never';
    const nextScan = security.nextScan !== 'unknown' ? new Date(security.nextScan).toLocaleString() : 'Unknown';
    const statusColor = security.scanStatus === 'scanning' ? 'var(--yellow)' : security.scanStatus === 'error' ? 'var(--red)' : 'var(--text-dim)';
    scanInfo.innerHTML = `Last scan: <strong>${lastScan}</strong> &middot; Next: ${nextScan} &middot; Status: <span style="color:${statusColor}">${security.scanStatus}</span>`;

    document.getElementById('security-stats').innerHTML = `
        <div class="stat"><div class="value" style="color:var(--red)">${security.critical}</div><div class="label">Critical</div></div>
        <div class="stat"><div class="value" style="color:var(--yellow)">${security.high}</div><div class="label">High</div></div>
        <div class="stat"><div class="value" style="color:var(--blue)">${security.medium || 0}</div><div class="label">Medium</div></div>
        <div class="stat"><div class="value" style="color:var(--text-dim)">${security.low || 0}</div><div class="label">Low</div></div>
        <div class="stat"><div class="value">${security.totalVulns}</div><div class="label">Total Vulns</div></div>
        <div class="stat"><div class="value" style="color:${security.p0Items > 0 ? 'var(--red)' : 'var(--green)'}">${security.p0Items}</div><div class="label">P0 Actions</div></div>
    `;

    // Severity breakdown bars
    const total = security.totalVulns || 1;
    const bars = document.getElementById('severity-bars');
    bars.innerHTML = `<div class="severity-bars">
        ${severityBar('Critical', security.critical, total, 'var(--red)')}
        ${severityBar('High', security.high, total, 'var(--yellow)')}
        ${severityBar('Medium', security.medium || 0, total, 'var(--blue)')}
        ${severityBar('Low', security.low || 0, total, 'var(--text-dim)')}
    </div>`;
}

function severityBar(label, count, total, color) {
    const pct = Math.max((count / total) * 100, 0);
    return `<div class="severity-bar-row">
        <span class="severity-bar-label">${label}</span>
        <span class="severity-bar-count" style="color:${color}">${count}</span>
        <div class="severity-bar-track"><div class="severity-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
}

// Lazy-load detail data
let securityDetailData = null;

async function loadSecurityDetails() {
    if (securityDetailData) return;
    try {
        const resp = await fetch('/api/dash/security/report');
        if (!resp.ok) return;
        securityDetailData = await resp.json();
        renderVulnTable(securityDetailData.vulnerabilities);
        renderSbomTable(securityDetailData.components);
        renderRemediationList(securityDetailData.remediation);
    } catch (e) {
        console.error('Failed to load security details:', e);
    }
}

function renderVulnTable(vulns) {
    const sevFilter = document.getElementById('filter-severity').value;
    const priFilter = document.getElementById('filter-priority').value;

    let filtered = vulns;
    if (sevFilter) filtered = filtered.filter(v => v.severity === sevFilter);
    if (priFilter) filtered = filtered.filter(v => v.remediationPriority === priFilter);

    // Sort by severity (critical first)
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    filtered.sort((a, b) => (sevOrder[a.severity] || 5) - (sevOrder[b.severity] || 5));

    const tbody = document.querySelector('#vuln-table tbody');
    tbody.innerHTML = filtered.map(v => `<tr>
        <td><a href="${v.referenceUrl}" target="_blank" style="color:var(--blue);text-decoration:none">${v.id}</a></td>
        <td><span class="sev-badge sev-${v.severity}">${v.severity}</span></td>
        <td>${v.cvss != null ? v.cvss.toFixed(1) : '—'}</td>
        <td>${v.packageName}</td>
        <td>${v.component}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${v.fixAvailable}">${v.fixAvailable || '—'}</td>
        <td><span class="pri-badge pri-${v.remediationPriority.toLowerCase()}">${v.remediationPriority}</span></td>
    </tr>`).join('');
}

function renderSbomTable(components) {
    const tbody = document.querySelector('#sbom-table tbody');
    tbody.innerHTML = components.map(c => `<tr>
        <td><strong>${c.name}</strong><br><span style="color:var(--text-dim);font-size:11px">${c.sourcePath}</span></td>
        <td><span class="sev-badge sev-medium">${c.componentType}</span></td>
        <td>${c.dependencies.length} deps</td>
        <td style="color:var(--text-dim)">${c.licenseSummary}</td>
    </tr>`).join('');
}

function renderRemediationList(items) {
    const groups = { P0: [], P1: [], P2: [], P3: [] };
    items.forEach(item => {
        if (groups[item.priority]) groups[item.priority].push(item);
    });

    const labels = {
        P0: { text: 'Patch Immediately', color: 'var(--red)' },
        P1: { text: 'Patch This Sprint', color: 'var(--yellow)' },
        P2: { text: 'Patch Next Cycle', color: 'var(--blue)' },
        P3: { text: 'Monitor Only', color: 'var(--text-dim)' },
    };

    const el = document.getElementById('remediation-list');
    el.innerHTML = Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .map(([pri, items]) => `
            <div class="remediation-group">
                <h3><span class="pri-badge pri-${pri.toLowerCase()}">${pri}</span> ${labels[pri].text}</h3>
                ${items.map(item => `
                    <div class="remediation-item">
                        <span class="component">${item.component}</span>
                        <span class="action">${item.action}</span>
                        <span class="effort">Effort: ${item.effort}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
}

// Tab switching
document.getElementById('security-tabs')?.addEventListener('click', (e) => {
    if (!e.target.classList.contains('tab')) return;
    const tabName = e.target.dataset.tab;

    document.querySelectorAll('#security-tabs .tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.classList.add('active');

    loadSecurityDetails();
});

// Filter change handlers
document.getElementById('filter-severity')?.addEventListener('change', () => {
    if (securityDetailData) renderVulnTable(securityDetailData.vulnerabilities);
});
document.getElementById('filter-priority')?.addEventListener('change', () => {
    if (securityDetailData) renderVulnTable(securityDetailData.vulnerabilities);
});

function updateDashboard(data) {
    renderServices(data.services || []);
    renderContainers(data.containers || []);
    renderGameStats(data.games || {});
    renderMongoStats(data.mongodb || {});
    renderNotifyStats(data.notifications || {}, data.nats || {});
    renderArchiveStats(data.archive || {});
    renderSecuritySummary(data.security || {});
    renderAlerts(data.alerts || []);
}

// ── Changelog ──
let changelogLoaded = false;

async function toggleChangelog() {
    const content = document.getElementById('changelog-content');
    const btn = document.getElementById('changelog-toggle');
    const isHidden = content.style.display === 'none';

    content.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? 'Hide' : 'Show';

    if (isHidden && !changelogLoaded) {
        try {
            const resp = await fetch('/api/dash/changelog');
            if (resp.ok) {
                const text = await resp.text();
                document.getElementById('changelog-text').innerHTML = marked.parse(text);
                changelogLoaded = true;
            }
        } catch (e) {
            document.getElementById('changelog-text').textContent = 'Failed to load changelog: ' + e.message;
        }
    }
}

// ── Logs Modal ──
async function openLogs(containerId, containerName) {
    document.getElementById('logs-modal').classList.add('show');
    document.getElementById('logs-title').textContent = `Logs: ${containerName}`;
    document.getElementById('logs-body').textContent = 'Loading...';

    try {
        const resp = await fetch(`/api/dash/containers/${containerId}/logs?tail=100`);
        const data = await resp.json();
        document.getElementById('logs-body').textContent = (data.lines || []).join('');
    } catch (e) {
        document.getElementById('logs-body').textContent = 'Failed to load logs: ' + e.message;
    }
}

function closeLogs() {
    document.getElementById('logs-modal').classList.remove('show');
}

document.getElementById('logs-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeLogs();
});

// ── SSE Connection ──
function connectSSE() {
    const statusEl = document.getElementById('conn-status');
    const es = new EventSource('/api/dash/events');

    es.onopen = () => {
        statusEl.textContent = 'Live';
        statusEl.className = 'status live';
    };

    es.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            updateDashboard(data);
        } catch (e) {
            console.error('Failed to parse SSE:', e);
        }
    };

    es.onerror = () => {
        statusEl.textContent = 'Reconnecting...';
        statusEl.className = 'status';
        es.close();
        setTimeout(connectSSE, 3000);
    };
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
    initCharts();

    // Initial data fetch
    try {
        const resp = await fetch('/api/dash/snapshot');
        if (resp.ok) {
            const data = await resp.json();
            updateDashboard(data);
        }
    } catch (e) {
        console.log('Initial fetch failed, waiting for SSE');
    }

    // Load security detail data so the default Vulnerabilities tab is populated
    loadSecurityDetails();

    connectSSE();
});
