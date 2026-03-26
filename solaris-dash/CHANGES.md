# SolarisCompanion — Full Changelog

All changes made to build the Solaris Companion ecosystem alongside the [Solaris](https://github.com/solaris-games/solaris) open-source space strategy game.

---

## Overview

We cloned the Solaris `beta` branch and built four companion services around it — all containerized, all in Rust (except the game itself), and none requiring modifications to the original Solaris source code.

### Final Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          Docker Network                               │
│                       (solaris-beta_default)                          │
│                                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │   Client   │  │    API     │  │    Jobs    │  │  MongoDB 7   │     │
│  │  (Vue.js)  │  │  (Node.js) │  │  (Node.js) │  │ (Replica Set)│     │
│  │   :8080    │  │   :3000    │  │            │  │    :27017    │     │
│  └────────────┘  └────────────┘  └────────────┘  └──────┬───────┘     │
│                                                         │             │
│  ── Solaris Game (unmodified beta branch) ──────────────┼───────────  │
│  ── Companion Services (all new) ───────────────────────┼───────────  │
│                                                         │             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────┴───────┐     │
│  │  Archive   │  │   Notify   │  │    NATS    │  │  Dashboard   │     │
│  │   (Rust)   │  │   (Rust)   │  │  JetStream │  │    (Rust)    │     │
│  │   :3001    │  │   :3002    │  │   :4222    │  │    :3003     │     │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘     │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 1. Solaris Beta (cloned, infrastructure modified)

**Directory:** `solaris-beta/`

Cloned from `solaris-games/solaris` branch `beta` (commit `a8dcf56`).

### Infrastructure changes to `docker-compose.yml`
- **MongoDB replica set**: Added `command: ["--replSet", "rs0", "--bind_ip_all"]` to the `database` service, enabling change streams for the notification service
- **Replica set init**: Added a `mongo-init` service that runs `rs.initiate()` on startup with retry logic
- **Connection strings**: Updated `CONNECTION_STRING` for `api` and `jobs` services to include `?replicaSet=rs0`

**No Solaris application code was modified.** All companion services follow the companion-service pattern — they read from the same MongoDB but never write to Solaris-owned collections.

---

## 2. solaris-archive (Rust Service)

**Directory:** `solaris-archive/`
**Port:** 3001
**Compose:** `docker-compose.archive.yml`

A service that archives finished Solaris games to compressed storage and serves them back for replay.

### What it does
- **Archiver** (background task): Polls MongoDB every 60s for finished games, compresses game documents + all tick history + events as `.json.zst` files on a Docker volume
- **Playback API**: Serves archived game data via REST so clients can replay past games

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/archive/health` | Health check |
| GET | `/api/archive/games` | List all archived games with metadata |
| GET | `/api/archive/game/:gameId` | Full archived game document |
| GET | `/api/archive/game/:gameId/history?tick=N` | Galaxy state at specific tick |
| GET | `/api/archive/game/:gameId/history/ticks` | Available tick numbers |
| GET | `/api/archive/game/:gameId/events` | All game events |

### On-Disk Format
```
/archive/{gameId}/
├── metadata.json       (plain JSON, archive completion marker)
├── game.json.zst       (full game doc, zstd compressed)
├── events.json.zst     (all events, zstd compressed)
└── history/
    └── {tick}.json.zst (one per tick, ~2-3KB each)
```

### Key Design Decisions
- **Opaque JSON types**: Game/history nested data stored as `serde_json::Value` — decoupled from Solaris schema changes
- **Filesystem tracking**: Archive existence checked by presence of `metadata.json` — no writes to MongoDB
- **zstd compression**: ~3-5x compression on JSON (500-tick game ~5MB → ~1.2MB)

### Files (13 source files)
```
src/main.rs, config.rs
src/db/{mod,mongo,models}.rs
src/archive/{mod,scanner,writer,metadata}.rs
src/storage/{mod,layout,reader}.rs
src/api/{mod,router,handlers}.rs
```

---

## 3. solaris-notify (Rust Service + NATS)

**Directory:** `solaris-notify/`
**Port:** 3002
**Compose:** `docker-compose.notify.yml` (also includes NATS container)

A full notification service with persistent inbox, real-time WebSocket push, and configurable webhooks.

### What it does
1. **Event Ingestion**: Watches MongoDB `gameevents` collection via change streams, publishes to NATS JetStream
2. **Dispatcher**: Consumes from NATS, resolves which users should be notified (player→user mapping), routes to channels based on preferences
3. **Inbox**: Persists notifications to MongoDB for later retrieval
4. **WebSocket Push**: Real-time delivery to connected clients with catch-up on reconnect
5. **Webhook Delivery**: HTTP POST to user-configured endpoints with HMAC-SHA256 signing and retries

### Event Pipeline
```
Solaris creates gameevents → MongoDB change stream detects insert →
Watcher publishes to NATS JetStream → Dispatcher routes to users →
Delivers via inbox / WebSocket / webhooks
```

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notify/health` | Health check |
| GET | `/api/notify/notifications` | Paginated notification list |
| GET | `/api/notify/notifications/unread/count` | Unread count |
| PATCH | `/api/notify/notifications/:id/read` | Mark as read |
| POST | `/api/notify/notifications/read-all` | Mark all as read |
| DELETE | `/api/notify/notifications/:id` | Delete |
| GET | `/api/notify/webhooks` | List webhooks |
| POST | `/api/notify/webhooks` | Create webhook (max 5/user) |
| PUT | `/api/notify/webhooks/:id` | Update webhook |
| DELETE | `/api/notify/webhooks/:id` | Delete webhook |
| POST | `/api/notify/webhooks/:id/test` | Send test notification |
| GET | `/api/notify/preferences` | Get notification preferences |
| PUT | `/api/notify/preferences` | Update preferences |
| WS | `/ws/notify` | WebSocket for real-time push |

### Authentication
Reuses Solaris session cookies (`connect.sid`) — validates by reading the MongoDB `sessions` collection. Zero additional login required.

### NATS JetStream
- Stream: `SOLARIS_EVENTS`, subjects: `solaris.events.>`
- Retention: WorkQueue, MaxAge: 24h
- Durable consumer: `notify-dispatcher`

### Notification Templates
30+ event types with human-readable title/body generation (combat, trade, research, diplomacy, game lifecycle, conversations, etc.)

### Data Stored (own MongoDB collections)
- `notifications` — Persistent inbox per user
- `webhook_configs` — User webhook endpoints with HMAC secrets
- `user_preferences` — Per-user channel configuration

### Files (22 source files)
```
src/main.rs, config.rs
src/auth/{mod,session}.rs
src/db/{mod,mongo,models}.rs
src/ingestion/{mod,watcher,transformer}.rs
src/bus/{mod,nats}.rs
src/router/{mod,dispatcher}.rs
src/channels/{mod,inbox,websocket,webhook}.rs
src/api/{mod,router,ws}.rs
src/api/handlers/{mod,notifications,webhooks,preferences}.rs
src/templates/mod.rs
```

---

## 4. solaris-dash (Rust Service — Admin Dashboard)

**Directory:** `solaris-dash/`
**Port:** 3003
**Compose:** `docker-compose.dash.yml`

A real-time admin monitoring dashboard with an embedded web UI.

### What it does
- **Collector** (10s loop): Gathers metrics from Docker, MongoDB, NATS, Archive, and all service health endpoints
- **Metrics Store**: In-memory ring buffer (1 hour of snapshots)
- **SSE Stream**: Pushes live metric updates to the browser every 10 seconds
- **Embedded SPA**: Dark-themed admin dashboard with Chart.js visualizations

### Dashboard Panels
1. **Service Status Bar** — Green/red dots for all services with response times
2. **Container Resources** — CPU% and memory bar charts per container (click for logs)
3. **Game Overview** — Active/finished games, users, registrations, game type distribution
4. **MongoDB** — Connections, opcounters line chart, storage, top collections by size
5. **Notification Pipeline** — Total notifications, NATS connections/messages, pending queue
6. **Archive Status** — Games archived, total size, health
7. **Bottleneck Alerts** — Auto-detected issues (high CPU, memory pressure, service failures, NATS backlog)

### Bottleneck Detection
Auto-alerts triggered when:
- Container CPU >80% (warning) or >90% (critical)
- Container memory >85% of limit
- MongoDB connections >80% of available
- NATS consumer pending messages >100
- Any service health check fails

### Data Sources
| Source | Method | Metrics |
|--------|--------|---------|
| Docker Engine | Unix socket via `bollard` | CPU%, memory, network, restarts, logs |
| MongoDB | `serverStatus`, `dbStats`, `collStats` | Connections, opcounters, storage, collection sizes |
| NATS | HTTP `:8222/varz`, `/jsz` | Connections, messages, JetStream stats |
| Archive API | HTTP `:3001` | Archived games, total size |
| All services | HTTP health checks | Up/down, response latency |

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard SPA |
| GET | `/api/dash/health` | Health check |
| GET | `/api/dash/snapshot` | Current full metrics snapshot |
| GET | `/api/dash/history?minutes=60` | Historical data |
| GET | `/api/dash/containers` | Container stats |
| GET | `/api/dash/containers/:id/logs?tail=100` | Container logs |
| GET | `/api/dash/mongo/stats` | MongoDB metrics |
| GET | `/api/dash/nats/stats` | NATS stats |
| GET | `/api/dash/games/stats` | Game statistics |
| GET | `/api/dash/notifications/stats` | Notification pipeline stats |
| GET | `/api/dash/events` | SSE stream (live updates) |

### Files (16 source files + 3 static assets)
```
src/main.rs, config.rs
src/store/{mod,metrics}.rs
src/collectors/{mod,docker,mongodb,nats,archive,services}.rs
src/api/{mod,router,handlers,sse,logs}.rs
src/dashboard/mod.rs
src/dashboard/static/{index.html,app.js,style.css}
```

---

## 5. SBOM & Vulnerability Reporting (Dashboard Feature)

**Added to:** `solaris-dash/`

A security monitoring subsystem integrated into the admin dashboard, providing real-time visibility into dependency inventory and known vulnerabilities across the entire stack.

### What it does
- **SBOM Display**: Full software bill of materials (110 dependencies across 11 components) viewable in a tabbed interface with component filtering
- **Vulnerability Tracking**: 129 known CVEs with severity badges, CVSS scores, filterable by severity/priority/component
- **Remediation Matrix**: Prioritized action items (P0–P3) with effort estimates and status tracking
- **Security Alerts**: Critical vulnerabilities and P0 items automatically surface in the Bottleneck Alerts panel
- **Weekly Scan Loop**: Configurable scan interval (default: 1 week) running on its own timer, separate from the 10-second metrics loop
- **Persistent Storage**: Scan results stored in MongoDB `security_reports` collection, with seed data compiled into the binary

### New API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dash/security/summary` | Lightweight summary (in every SSE tick) |
| GET | `/api/dash/security/report` | Full security report from MongoDB |
| GET | `/api/dash/security/sbom?component=` | SBOM data, filterable by component |
| GET | `/api/dash/security/vulns?severity=&component=&priority=` | Vulnerabilities, filterable |
| GET | `/api/dash/security/remediation` | Remediation priority matrix |

### New Dashboard Panels
8. **Security Overview** (full-width) — Critical/High/Medium/Low counts, severity breakdown bars, scan status and schedule
9. **Vulnerabilities & SBOM** (full-width, tabbed) — Filterable vulnerability table, SBOM component list, P0–P3 remediation actions

### Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `SECURITY_SCAN_INTERVAL_SECS` | `604800` | Scan frequency (default: 1 week) |

### New Files (3)
```
src/store/security.rs           # 7 data model structs
src/collectors/security.rs      # SecurityCollector with MongoDB persistence + scan loop
data/security_seed.json         # 1,079-line seed data (110 deps, 54 vuln entries, 14 remediation items)
```

### Supporting Reports
| File | Description |
|------|-------------|
| `SBOM.md` | Full software bill of materials for entire stack |
| `SBOM-VULNS.md` | Vulnerability assessment with CVEs, CVSS scores, remediation priorities |

---

## 6. Claude Code Skills

**Directory:** `.claude/skills/`

Two skills for development workflow automation:

### solaris-dev
Manages the full dev environment — start/stop/restart all services, check status/health, view logs, rebuild after code changes.

### solaris-archive-test
Tests and interacts with the archive service — check health, list archived games, query the API, insert test game data, trigger archive scans.

---

## Docker Compose Files

| File | Services | Purpose |
|------|----------|---------|
| `solaris-beta/docker-compose.yml` | client, api, jobs, database, mongo-init | Core Solaris game stack |
| `docker-compose.archive.yml` | archive | Game archival + playback |
| `docker-compose.notify.yml` | nats, notify | Notifications + message bus |
| `docker-compose.dash.yml` | dashboard | Admin monitoring |

### Starting everything
```bash
cd solaris-beta && docker compose up -d && cd ..
docker compose -f docker-compose.archive.yml up -d
docker compose -f docker-compose.notify.yml up -d
docker compose -f docker-compose.dash.yml up -d
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Game (existing) | Node.js, Vue.js, MongoDB, Socket.io |
| Archive service | Rust, axum, mongodb, zstd |
| Notify service | Rust, axum, mongodb, async-nats, NATS JetStream |
| Dashboard | Rust, axum, bollard (Docker API), Chart.js, SSE |
| Message bus | NATS 2 with JetStream |
| Database | MongoDB 7 (single-node replica set) |
| Compression | zstd |
| Containerization | Docker, Docker Compose |

---

## File Count Summary

| Directory | Rust Source | Other | Total New Files |
|-----------|-----------|-------|-----------------|
| `solaris-archive/` | 13 | 3 (Cargo.toml, Dockerfile, .dockerignore) | 16 |
| `solaris-notify/` | 22 | 3 | 25 |
| `solaris-dash/` | 18 + 3 static | 4 (Cargo.toml, Dockerfile, .dockerignore, seed JSON) | 25 |
| Root compose files | — | 3 | 3 |
| Root reports | — | 3 (CHANGES.md, SBOM.md, SBOM-VULNS.md) | 3 |
| `.claude/skills/` | — | 2 | 2 |
| **Total** | **56 Rust files** | **18** | **74 new files** |
