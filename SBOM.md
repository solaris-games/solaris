# Software Bill of Materials (SBOM)

**Project:** Solaris Game + Companion Services
**Generated:** 2026-03-25
**Format:** Markdown (CycloneDX-style inventory)

---

## Table of Contents

1. [Infrastructure & Runtime](#1-infrastructure--runtime)
2. [Solaris Game (Beta) — Server](#2-solaris-game-beta--server)
3. [Solaris Game (Beta) — Client](#3-solaris-game-beta--client)
4. [Solaris Archive Service (Rust)](#4-solaris-archive-service-rust)
5. [Solaris Notify Service (Rust)](#5-solaris-notify-service-rust)
6. [Solaris Dashboard Service (Rust)](#6-solaris-dashboard-service-rust)
7. [Shared Rust Dependency Matrix](#7-shared-rust-dependency-matrix)
8. [Transitive Dependency Summary](#8-transitive-dependency-summary)
9. [License Overview](#9-license-overview)

---

## 1. Infrastructure & Runtime

### Container Base Images

| Image                       | Used By                        | Purpose        |
|-----------------------------|--------------------------------|----------------|
| node:22-slim                | Solaris API, Jobs, Client (dev)| Dev runtime    |
| node:24-slim                | Solaris API, Jobs (prod)       | Prod runtime   |
| nginx:1.29-alpine           | Solaris Client (prod)          | Static serving |
| rust:1.94-slim-bookworm     | Archive, Notify, Dashboard     | Build stage    |
| debian:bookworm-slim        | Archive, Notify, Dashboard     | Runtime stage  |
| mongo:7                     | All services                   | Database       |
| nats:2-alpine               | Notify service                 | Message bus    |

### System-Level Dependencies (Rust service runtime images)

| Package          | Used By           |
|------------------|-------------------|
| ca-certificates  | All Rust services |
| pkg-config       | Notify, Dashboard (build only) |
| libssl-dev       | Notify, Dashboard (build only) |

### Shared Infrastructure

| Component        | Version | Protocol/Port | Consumers                          |
|------------------|---------|---------------|------------------------------------|
| MongoDB          | 7.x     | 27017         | All services                       |
| NATS JetStream   | 2.x     | 4222 / 8222   | Notify (client), Dashboard (monitor) |
| Docker Engine    | —       | unix socket   | Dashboard (read-only)              |

---

## 2. Solaris Game (Beta) — Server

**Runtime:** Node.js 22 (dev) / 24 (prod)
**Language:** TypeScript 5.9.3
**Source:** `solaris-beta/server/`

### Production Dependencies

| Package                   | Version   | Purpose                        |
|---------------------------|-----------|--------------------------------|
| axios                     | 1.13.5    | HTTP client                    |
| bcrypt                    | ^5.1.1    | Password hashing               |
| body-parser               | 2.2.2     | Request body parsing           |
| compression               | 1.8.1     | Response compression           |
| connect-mongodb-session   | ^2.4.1    | Session store                  |
| cookie                    | 1.1.1     | Cookie parsing                 |
| cookie-parser             | 1.4.7     | Express cookie middleware      |
| discord.js                | ^12.5.3   | Discord bot integration        |
| dotenv                    | ^8.2.0    | Environment config             |
| elo-rating                | ^1.0.1    | Player rating system           |
| express                   | ^4.22.1   | Web framework                  |
| express-joi-validation    | ^5.0.1    | Request validation             |
| express-rate-limit        | ^5.2.6    | Rate limiting                  |
| express-session           | ^1.19.0   | Session management             |
| joi                       | ^17.6.2   | Schema validation              |
| memory-cache              | ^0.2.0    | In-memory caching              |
| moment                    | 2.30.1    | Date/time handling             |
| mongoose                  | 7.8.9     | MongoDB ODM                    |
| mongoose-lean-defaults    | 2.3.1     | Lean query defaults            |
| nodemailer                | ^8.0.1    | Email sending                  |
| pino                      | ^10.3.1   | Logging                        |
| pino-pretty               | ^13.1.3   | Log formatting                 |
| qheap                     | ^1.4.0    | Priority queue                 |
| random-seed               | ^0.3.0    | Deterministic RNG              |
| simplex-noise             | ^4.0.1    | Noise generation               |
| socket.io                 | ^4.8.3    | WebSocket server               |

### Dev Dependencies

| Package                         | Version   | Purpose              |
|---------------------------------|-----------|----------------------|
| @types/connect-mongodb-session  | 2.4.1     | Type definitions     |
| @types/cookie-parser            | ^1.4.8    | Type definitions     |
| @types/express                  | ^4.17.21  | Type definitions     |
| @types/express-session          | 1.17.10   | Type definitions     |
| @types/jasmine                  | ^5.1.5    | Type definitions     |
| @types/node                     | ^17.0.17  | Type definitions     |
| jasmine                         | ^5.5.0    | Test framework       |
| ts-node                         | 10.9.2    | TS execution         |
| ts-node-dev                     | 2.0.0     | TS dev server        |

---

## 3. Solaris Game (Beta) — Client

**Runtime:** Browser (served via Vite 7.3.1 dev / nginx prod)
**Language:** TypeScript (Vue 3)
**Source:** `solaris-beta/client/`

### Production Dependencies

| Package                 | Version   | Purpose                    |
|-------------------------|-----------|----------------------------|
| @popperjs/core          | ^2.11.5   | Tooltip/popover positioning|
| axios                   | ^1.13.5   | HTTP client                |
| bootstrap               | ^5.1.3    | CSS framework              |
| chart.js                | ^4.4.3    | Data visualization         |
| date-fns                | 4.1.0     | Date utilities             |
| jquery                  | ^3.6.0    | DOM manipulation           |
| js-cookie               | ^3.0.5    | Cookie management          |
| marked                  | ^13.0.2   | Markdown rendering         |
| mitt                    | ^3.0.1    | Event emitter              |
| moment                  | ^2.29.1   | Date/time handling         |
| pixi-viewport           | 6.0.3     | 2D camera/viewport         |
| pixi.js                 | 8.16.0    | 2D WebGL renderer          |
| random-seed             | ^0.3.0    | Deterministic RNG          |
| socket.io-client        | 4.8.1     | WebSocket client           |
| uuid                    | ^10.0.0   | UUID generation            |
| voronoi                 | ^1.0.0    | Voronoi diagram generation |
| vue                     | 3.5.28    | UI framework               |
| vue-chartjs             | 5.3.1     | Chart.js Vue bindings      |
| vue-router              | ^4.4.0    | Client-side routing        |
| vue-toast-notification  | ^3.1.3    | Toast notifications        |
| vuex                    | ^4.1.0    | State management           |

### Dev Dependencies

| Package                 | Version   | Purpose               |
|-------------------------|-----------|---------------------- |
| @vitejs/plugin-vue      | ^6.0.4    | Vite Vue plugin        |
| @vue/tsconfig           | ^0.8.1    | TS config for Vue      |
| less                    | ^4.5.1    | CSS preprocessor       |
| vite                    | 7.3.1     | Build tool / dev server|
| vue-tsc                 | ^3.2.5    | Vue type checking      |

### Optional Dependencies

| Package                         | Version   | Purpose             |
|---------------------------------|-----------|---------------------|
| @rollup/rollup-win32-x64-msvc  | ^4.29.1   | Windows build shim  |
| @esbuild/darwin-arm64           | ^0.24.2   | macOS ARM build shim|

---

## 4. Solaris Archive Service (Rust)

**Source:** `solaris-archive/`
**Rust Toolchain:** 1.94 (stable)
**Binary:** `solaris-archive`

### Direct Dependencies

| Crate               | Declared | Resolved  | Purpose                     |
|----------------------|----------|-----------|-----------------------------|
| tokio                | 1        | 1.50.0    | Async runtime (full)        |
| axum                 | 0.7      | 0.7.9     | HTTP framework              |
| mongodb              | 3        | 3.5.2     | Database driver             |
| serde                | 1        | 1.0.228   | Serialization (derive)      |
| serde_json           | 1        | 1.0.149   | JSON support                |
| bson                 | 2        | 2.15.0    | BSON support (chrono-0_4)   |
| zstd                 | 0.13     | 0.13.3    | Zstandard compression       |
| tracing              | 0.1      | 0.1.44    | Structured logging          |
| tracing-subscriber   | 0.3      | 0.3.23    | Log output (env-filter)     |
| tower-http           | 0.6      | 0.6.8     | CORS middleware             |
| chrono               | 0.4      | 0.4.44    | Date/time (serde)           |
| futures              | 0.3      | 0.3.32    | Async utilities             |

---

## 5. Solaris Notify Service (Rust)

**Source:** `solaris-notify/`
**Rust Toolchain:** 1.94 (stable)
**Binary:** `solaris-notify`

### Direct Dependencies

| Crate               | Declared | Resolved  | Purpose                     |
|----------------------|----------|-----------|-----------------------------|
| tokio                | 1        | 1.50.0    | Async runtime (full)        |
| axum                 | 0.7      | 0.7.9     | HTTP framework (ws)         |
| axum-extra           | 0.9      | 0.9.6     | Cookie support              |
| mongodb              | 3        | 3.5.2     | Database driver             |
| async-nats           | 0.38     | 0.38.0    | NATS JetStream client       |
| serde                | 1        | 1.0.228   | Serialization (derive)      |
| serde_json           | 1        | 1.0.149   | JSON support                |
| bson                 | 2        | 2.15.0    | BSON support (chrono-0_4)   |
| uuid                 | 1        | 1.22.0    | UUID v4 generation          |
| chrono               | 0.4      | 0.4.44    | Date/time (serde)           |
| tracing              | 0.1      | 0.1.44    | Structured logging          |
| tracing-subscriber   | 0.3      | 0.3.23    | Log output (env-filter)     |
| tower-http           | 0.6      | 0.6.8     | CORS middleware             |
| reqwest              | 0.12     | 0.12.28   | HTTP client (json)          |
| futures              | 0.3      | 0.3.32    | Async utilities             |
| hmac                 | 0.12     | 0.12.1    | HMAC authentication         |
| sha2                 | 0.10     | 0.10.9    | SHA-256 hashing             |
| hex                  | 0.4      | 0.4.3     | Hex encoding                |
| dashmap              | 6        | 6.1.0     | Concurrent hash map         |
| tokio-stream         | 0.1      | 0.1.18    | Async stream utilities      |
| base64               | 0.22     | 0.22.1    | Base64 encoding             |
| async-trait          | 0.1      | 0.1.89    | Async trait support         |

---

## 6. Solaris Dashboard Service (Rust)

**Source:** `solaris-dash/`
**Rust Toolchain:** 1.94 (stable)
**Binary:** `solaris-dash`

### Direct Dependencies

| Crate               | Declared | Resolved  | Purpose                     |
|----------------------|----------|-----------|-----------------------------|
| tokio                | 1        | 1.50.0    | Async runtime (full)        |
| axum                 | 0.7      | 0.7.9     | HTTP framework (ws)         |
| mongodb              | 3        | 3.5.2     | Database driver             |
| serde                | 1        | 1.0.228   | Serialization (derive)      |
| serde_json           | 1        | 1.0.149   | JSON support                |
| bson                 | 2        | 2.15.0    | BSON support (chrono-0_4)   |
| chrono               | 0.4      | 0.4.44    | Date/time (serde)           |
| tracing              | 0.1      | 0.1.44    | Structured logging          |
| tracing-subscriber   | 0.3      | 0.3.23    | Log output (env-filter)     |
| tower-http           | 0.6      | 0.6.8     | CORS middleware             |
| reqwest              | 0.12     | 0.12.28   | HTTP client (json)          |
| bollard              | 0.18     | 0.18.1    | Docker Engine API           |
| tokio-stream         | 0.1      | 0.1.18    | Async stream (sync)         |
| futures              | 0.3      | 0.3.32    | Async utilities             |
| async-trait          | 0.1      | 0.1.89    | Async trait support         |

---

## 7. Shared Rust Dependency Matrix

Which direct dependencies appear in which Rust services:

| Crate              | Archive | Notify | Dashboard |
|--------------------|:-------:|:------:|:---------:|
| tokio              |    ✓    |   ✓    |     ✓     |
| axum               |    ✓    |   ✓    |     ✓     |
| axum-extra         |         |   ✓    |           |
| mongodb            |    ✓    |   ✓    |     ✓     |
| serde              |    ✓    |   ✓    |     ✓     |
| serde_json         |    ✓    |   ✓    |     ✓     |
| bson               |    ✓    |   ✓    |     ✓     |
| chrono             |    ✓    |   ✓    |     ✓     |
| tracing            |    ✓    |   ✓    |     ✓     |
| tracing-subscriber |    ✓    |   ✓    |     ✓     |
| tower-http         |    ✓    |   ✓    |     ✓     |
| futures            |    ✓    |   ✓    |     ✓     |
| reqwest            |         |   ✓    |     ✓     |
| tokio-stream       |         |   ✓    |     ✓     |
| async-trait        |         |   ✓    |     ✓     |
| async-nats         |         |   ✓    |           |
| zstd               |    ✓    |        |           |
| bollard            |         |        |     ✓     |
| hmac / sha2 / hex  |         |   ✓    |           |
| dashmap            |         |   ✓    |           |
| uuid               |         |   ✓    |           |
| base64             |         |   ✓    |           |

---

## 8. Transitive Dependency Summary

Total unique resolved crates across all three Rust services: **~268**

Key transitive dependencies shared by all services:

| Crate         | Version | Pulled In By                  |
|---------------|---------|-------------------------------|
| hyper         | 1.8.1   | axum, reqwest                 |
| http          | 1.4.0   | axum, hyper, tower-http       |
| tower         | 0.5.3   | axum, tower-http              |
| rustls        | 0.23.37 | mongodb, reqwest              |
| regex         | 1.12.3  | tracing-subscriber            |
| parking_lot   | 0.12.5  | mongodb, dashmap              |
| indexmap       | 2.13.0  | serde_json, mongodb          |
| rand          | 0.9.2   | uuid, mongodb                 |
| crossbeam-*   | various | tokio internals               |

---

## 9. License Overview

### Solaris Game

| Component       | License      |
|-----------------|------------- |
| Solaris itself  | AGPL-3.0     |
| Express         | MIT          |
| Mongoose        | MIT          |
| Socket.IO       | MIT          |
| Vue.js          | MIT          |
| Pixi.js         | MIT          |
| Bootstrap       | MIT          |
| Chart.js        | MIT          |
| discord.js      | Apache-2.0   |

### Rust Companion Services

| Crate Category           | Predominant License |
|--------------------------|---------------------|
| Tokio ecosystem          | MIT                 |
| Axum / Tower / Hyper     | MIT                 |
| Serde ecosystem          | MIT OR Apache-2.0   |
| MongoDB driver           | Apache-2.0          |
| NATS client (async-nats) | Apache-2.0          |
| Bollard (Docker)         | Apache-2.0          |
| Cryptography (hmac/sha2) | MIT OR Apache-2.0   |
| Zstd (binding)           | MIT                 |
| Reqwest / Rustls         | MIT OR Apache-2.0   |

### Infrastructure

| Component   | License                 |
|-------------|-------------------------|
| MongoDB 7   | SSPL                    |
| NATS        | Apache-2.0              |
| Docker      | Apache-2.0              |
| Node.js     | MIT                     |
| nginx       | BSD-2-Clause            |
| Debian      | Various (DFSG-free)     |

---

## Counts

| Category                          | Count |
|-----------------------------------|-------|
| Solaris server direct deps        | 26    |
| Solaris server dev deps           | 9     |
| Solaris client direct deps        | 21    |
| Solaris client dev deps           | 5     |
| Archive service direct Rust deps  | 12    |
| Notify service direct Rust deps   | 22    |
| Dashboard service direct Rust deps| 15    |
| Total unique resolved Rust crates | ~268  |
| Container base images             | 7     |
| Infrastructure services           | 3     |
| **Total direct dependencies**     | **110**|
