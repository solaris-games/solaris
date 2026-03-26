# Vulnerability Report — Solaris Game + Companion Services

**Generated:** 2026-03-25
**Companion SBOM:** [SBOM.md](SBOM.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical & High — Infrastructure](#2-critical--high--infrastructure)
3. [Solaris Server (Node.js) — npm audit](#3-solaris-server-nodejs--npm-audit)
4. [Solaris Client (Vue.js) — npm audit](#4-solaris-client-vuejs--npm-audit)
5. [Solaris Archive Service (Rust) — cargo audit](#5-solaris-archive-service-rust--cargo-audit)
6. [Solaris Notify Service (Rust) — cargo audit](#6-solaris-notify-service-rust--cargo-audit)
7. [Solaris Dashboard Service (Rust) — cargo audit](#7-solaris-dashboard-service-rust--cargo-audit)
8. [MongoDB 7](#8-mongodb-7)
9. [NATS 2.x](#9-nats-2x)
10. [Node.js 22 / 24](#10-nodejs-22--24)
11. [nginx 1.29](#11-nginx-129)
12. [Debian bookworm-slim](#12-debian-bookworm-slim)
13. [Remediation Priority Matrix](#13-remediation-priority-matrix)

---

## 1. Executive Summary

| Layer                    | Critical | High | Medium | Low | Info | Total |
|--------------------------|:--------:|:----:|:------:|:---:|:----:|:-----:|
| Solaris Server (npm)     |    0     |  10  |   2    |  3  |  0   |  15   |
| Solaris Client (npm)     |    0     |   2  |   0    |  0  |  0   |   2   |
| Archive Service (cargo)  |    0     |   0  |   0    |  0  |  0   |   0   |
| Notify Service (cargo)   |    0     |   0  |   0    |  0  |  1   |   1   |
| Dashboard Service (cargo)|    0     |   0  |   0    |  0  |  0   |   0   |
| MongoDB 7                |    1     |   2  |   1    |  0  |  0   |   4   |
| NATS 2.x                 |    0     |   4  |   4    |  2  |  0   |  10   |
| Node.js 22/24            |    0     |   4  |   4    |  1  |  0   |   9   |
| nginx 1.29               |    0     |   1  |   1    |  0  |  0   |   2   |
| Debian bookworm-slim     |    3     |   8  |  14    | 60  |  1   |  86   |
| **Totals**               |  **4**   |**31**| **26** |**66**| **2**|**129**|

**Immediate action items:**
- Upgrade MongoDB to ≥ 7.0.31 (MongoBleed — active exploitation)
- Upgrade NATS to ≥ 2.11.15 or 2.12.6 (10 CVEs including pre-auth panics)
- Run `npm audit fix` on Solaris server (10 high vulns, most auto-fixable)
- Rebuild Debian base images with latest bookworm-slim

---

## 2. Critical & High — Infrastructure

These require immediate attention as they affect shared services.

### MongoBleed — CVE-2025-14847 (CRITICAL)

| Field         | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| CVSS          | 8.7 (CVSSv4)                                                         |
| Affected      | MongoDB 7.0.0 – 7.0.26                                               |
| Fixed         | 7.0.28+                                                              |
| Exploited     | **Yes** — CISA KEV catalog, public exploit on GitHub                  |
| Description   | Unauthenticated heap memory disclosure via zlib decompression         |
| Workaround    | Disable zlib compression: `--networkMessageCompressors snappy,zstd`   |
| Reference     | https://nvd.nist.gov/vuln/detail/CVE-2025-14847                      |

### MongoDB Use-After-Free — CVE-2026-4148 (HIGH)

| Field         | Value                                              |
|---------------|----------------------------------------------------|
| CVSS          | 8.7                                                |
| Affected      | MongoDB < 7.0.31                                   |
| Fixed         | 7.0.31+                                            |
| Description   | Use-after-free in sharded clusters by authenticated user |
| Reference     | https://www.mongodb.com/resources/products/alerts  |

---

## 3. Solaris Server (Node.js) — npm audit

**Total: 15 vulnerabilities (10 high, 2 moderate, 3 low)**

### HIGH severity

| Package              | Advisory                                           | CVSS | Fix Available        |
|----------------------|----------------------------------------------------|------|----------------------|
| tar ≤ 7.5.10         | Hardlink Path Traversal (GHSA-34x7-hfp2-rc4v)     | —    | bcrypt@6.0.0 (major) |
| tar ≤ 7.5.10         | Symlink Overwrite (GHSA-8qq5-rm4j-mr97)            | —    | bcrypt@6.0.0 (major) |
| tar ≤ 7.5.10         | Hardlink Target Escape (GHSA-83g3-92jg-28cx)       | —    | bcrypt@6.0.0 (major) |
| tar ≤ 7.5.10         | Drive-Relative Hardlink (GHSA-qffp-2rhf-9h96)      | —    | bcrypt@6.0.0 (major) |
| tar ≤ 7.5.10         | Drive-Relative Symlink (GHSA-9ppj-qmqm-q256)       | —    | bcrypt@6.0.0 (major) |
| tar ≤ 7.5.10         | Race Condition APFS (GHSA-r6q2-hw4h-h46w)          | —    | bcrypt@6.0.0 (major) |
| lodash.set *         | Prototype Pollution (GHSA-p6mc-m468-83gw)          | —    | connect-mongodb-session@5.0.0 (major) |
| glob 10.2.0–10.4.5   | Command injection via --cmd (GHSA-5j98-mcp5-4vw2)  | 7.5  | `npm audit fix`      |
| socket.io-parser     | Unbounded binary attachments (GHSA-677m-j7p3-52f9) | —    | `npm audit fix`      |
| minimatch ≤ 3.1.3    | ReDoS via wildcards (GHSA-3ppc-4f35-3m26)          | —    | `npm audit fix`      |
| minimatch            | ReDoS GLOBSTAR segments (GHSA-7r86-cg39-jmmj)      | —    | `npm audit fix`      |
| minimatch            | ReDoS extglobs (GHSA-23c5-xmqv-rm74)               | —    | `npm audit fix`      |
| picomatch ≤ 2.3.1    | ReDoS extglob quantifiers (GHSA-c2c7-rcm5-vvqj)   | —    | `npm audit fix`      |
| picomatch ≤ 2.3.1    | Method Injection POSIX (GHSA-3v7f-55p6-f55p)       | —    | `npm audit fix`      |

### MODERATE severity

| Package              | Advisory                                           | CVSS | Fix Available        |
|----------------------|----------------------------------------------------|------|----------------------|
| mpath < 0.8.4        | Type confusion (GHSA-p92x-r36w-9395)               | —    | connect-mongodb-session@5.0.0 (major) |
| qs ≤ 6.14.1          | arrayLimit bypass DoS (GHSA-w7fw-mjwx-w883)        | —    | `npm audit fix`      |
| qs ≤ 6.14.1          | bracket notation DoS (GHSA-6rw7-vpxm-498p)         | —    | `npm audit fix`      |

### LOW severity

| Package              | Advisory                                           | CVSS | Fix Available        |
|----------------------|----------------------------------------------------|------|----------------------|
| brace-expansion      | ReDoS (GHSA-v6h2-p8h4-qcjw)                       | 3.1  | `npm audit fix`      |
| diff 4.0.0–4.0.3     | DoS in parsePatch (GHSA-73rr-hh4g-fpgx)            | —    | `npm audit fix`      |

**Dependency chains:**
- `bcrypt` → `@mapbox/node-pre-gyp` → `tar` (6 high CVEs; fix requires bcrypt@6.0.0 major bump)
- `connect-mongodb-session` → `archetype` → `lodash.set` + `mpath` (fix requires v5.0.0 major bump)

---

## 4. Solaris Client (Vue.js) — npm audit

**Total: 2 vulnerabilities (2 high)**

| Package              | Advisory                                           | Fix Available   |
|----------------------|----------------------------------------------------|-----------------|
| picomatch 4.0.0–4.0.3| ReDoS via extglob quantifiers (GHSA-c2c7-rcm5-vvqj)| `npm audit fix` |
| picomatch            | Method Injection POSIX classes (GHSA-3v7f-55p6-f55p)| `npm audit fix` |
| socket.io-parser     | Unbounded binary attachments (GHSA-677m-j7p3-52f9) | `npm audit fix` |

---

## 5. Solaris Archive Service (Rust) — cargo audit

**✅ No vulnerabilities found.**

Scanned 271 crate dependencies — 0 advisories.

---

## 6. Solaris Notify Service (Rust) — cargo audit

**1 vulnerability + 1 warning** (343 crate dependencies scanned)

| Crate            | Version | Advisory         | Severity | Description                              | Fix            |
|------------------|---------|------------------|----------|------------------------------------------|----------------|
| rustls-webpki    | 0.102.8 | RUSTSEC-2026-0049| Medium   | CRL Distribution Point matching logic flaw — CRLs not considered authoritative | Upgrade to ≥ 0.103.10 |
| rustls-pemfile   | 2.2.0   | RUSTSEC-2025-0134| Info     | Crate is unmaintained                    | Migrate away   |

**Dependency chain:** Both pulled in via `async-nats 0.38.0` → `rustls-native-certs` / `rustls-webpki`.

**Fix:** Awaiting `async-nats` upstream to update its `rustls` dependency tree, or pin override in `Cargo.toml`.

---

## 7. Solaris Dashboard Service (Rust) — cargo audit

**✅ No vulnerabilities found.**

Scanned 323 crate dependencies — 0 advisories.

---

## 8. MongoDB 7

| CVE              | CVSS | Severity | Affected           | Fixed     | Description                                    |
|------------------|------|----------|--------------------|-----------|------------------------------------------------|
| CVE-2025-14847   | 8.7  | Critical | 7.0.0 – 7.0.26    | 7.0.28    | MongoBleed: unauthenticated heap memory leak via zlib (actively exploited) |
| CVE-2026-4148    | 8.7  | High     | < 7.0.31          | 7.0.31    | Use-after-free in sharded clusters             |
| (Unnamed)        | —    | High     | < 7.0.31          | 7.0.31    | Authenticated read of uninitialized stack memory|
| FIPS Mode        | —    | Medium   | 7.0.0 – 7.0.22    | 7.0.23    | Non-FIPS algorithms used when FIPS mode enabled |

**References:**
- [NVD — CVE-2025-14847](https://nvd.nist.gov/vuln/detail/CVE-2025-14847)
- [MongoDB Alerts](https://www.mongodb.com/resources/products/alerts)
- [Akamai — MongoBleed Analysis](https://www.akamai.com/blog/security-research/cve-2025-14847-all-you-need-to-know-about-mongobleed)
- [MongoDB December 2025 Security Update](https://www.mongodb.com/company/blog/news/mongodb-server-security-update-december-2025)

---

## 9. NATS 2.x

Our `docker-compose.notify.yml` uses `nats:2-alpine` which pulls the latest 2.x. The following CVEs affect versions before 2.11.15 / 2.12.6:

| CVE              | Severity | Description                                              | Pre-Auth? |
|------------------|----------|----------------------------------------------------------|:---------:|
| CVE-2026-29785   | High     | Server panic via malicious compression on leafnode port  |    Yes    |
| CVE-2026-27889   | High     | WebSockets pre-auth remote server crash                  |    Yes    |
| CVE-2026-27571   | High     | WebSockets pre-auth memory DoS (compression bomb)        |    Yes    |
| CVE-2026-33219   | High     | WebSockets pre-auth memory DoS (unbounded allocation)    |    Yes    |
| CVE-2026-33223   | Medium   | Identity spoofing via Nats-Request-Info header            |    No     |
| CVE-2026-33246   | Medium   | Leafnode Nats-Request-Info spoofing                       |    No     |
| CVE-2026-33218   | Medium   | Pre-auth server panic via leafnode malformed message      |    Yes    |
| CVE-2026-33222   | Medium   | JetStream authorization bypass (stream restore)           |    No     |
| CVE-2026-33215   | Low      | MQTT session hijacking via Client ID                      |    No     |
| CVE-2026-33216   | Low      | MQTT plaintext password disclosure via monitoring         |    No     |
| CVE-2026-33247   | Low      | Credentials exposed via monitoring /debug/vars argv       |    No     |

**Fix:** Ensure `nats:2-alpine` resolves to ≥ 2.11.15. Pin explicitly if needed.

**References:**
- [NATS Advisories](https://advisories.nats.io/)
- [CVE-2026-29785](https://advisories.gitlab.com/pkg/golang/github.com/nats-io/nats-server/v2/CVE-2026-29785/)
- [CVE-2026-33222](https://advisories.gitlab.com/pkg/golang/github.com/nats-io/nats-server/v2/CVE-2026-33222/)

---

## 10. Node.js 22 / 24

Our Solaris dev images use Node 22, prod uses Node 24. Recent security releases:

### March 2026 Release

| CVE              | Severity | Affected        | Description                               |
|------------------|----------|-----------------|-------------------------------------------|
| (HTTP/2 memleak) | High     | 20, 22, 24, 25  | WINDOW_UPDATE on stream 0 leaks Http2Session |
| (TLS SNICallback)| High     | 20, 22, 24, 25  | Synchronous throw in SNICallback crashes process |
| (Permission bypass)| Medium | 20, 22, 24, 25  | FileHandle.chmod/chown bypass --permission |
| (V8 HashDoS)    | Medium   | 20, 22, 24, 25  | Integer-like strings trivially collide     |

### January 2026 Release

| CVE              | Severity | Description                                          |
|------------------|----------|------------------------------------------------------|
| CVE-2025-55131   | High     | Race condition in buffer allocation leaks memory      |
| CVE-2025-55130   | High     | Symlink chain escapes --allow-fs-read/write sandbox   |
| CVE-2025-59465   | High     | HTTP/2 crash on malformed HEADERS frame               |
| CVE-2025-59466   | Medium   | async_hooks stack exhaustion DoS                      |
| CVE-2025-59464   | Medium   | TLS client cert memory leak DoS                       |
| CVE-2026-21636   | Medium   | Unix Domain Socket bypasses --permission              |
| CVE-2026-21637   | Medium   | TLS PSK/ALPN callback crash + FD leak                 |
| CVE-2025-55132   | Low      | fs.futimes() bypasses read-only permission model      |

**Patched:** Node.js 22.22.0, 24.13.0

**References:**
- [Node.js March 2026 Security Release](https://nodejs.org/en/blog/vulnerability/march-2026-security-releases)
- [Node.js January 2026 Security Release](https://nodejs.org/en/blog/vulnerability/december-2025-security-releases)
- [Node.js July 2025 Security Release](https://nodejs.org/en/blog/vulnerability/july-2025-security-releases)

---

## 11. nginx 1.29

| CVE              | CVSS | Severity | Affected           | Fixed      | Description                               |
|------------------|------|----------|--------------------|------------|-------------------------------------------|
| CVE-2026-1642    | 8.2  | High     | 1.3.0 – 1.29.4    | 1.29.5     | SSL upstream injection via MitM            |
| CVE-2025-53859   | Low  | Low      | 0.7.22 – 1.29.0   | 1.29.1     | Buffer overread in ngx_mail_smtp_module    |

**References:**
- [nginx Security Advisories](https://nginx.org/en/security_advisories.html)
- [CVE-2025-53859 — nginx 1.29.1 fix](https://www.x-cmd.com/blog/250818/)
- [nginx 2026 Vulnerabilities](https://stack.watch/product/nginx/nginx/)

---

## 12. Debian bookworm-slim

The runtime base image for all three Rust services. A typical Trivy scan of bookworm-slim reports:

| Severity | Count | Notes                                            |
|----------|:-----:|--------------------------------------------------|
| Critical |   3   | Mostly in system libraries (zlib, libxml2, etc.) |
| High     |   8   | Kernel and library-level issues                  |
| Medium   |  14   | Various system packages                          |
| Low      |  60   | Minor/informational                              |
| Unknown  |   1   | Unscored                                         |
| **Total**| **86**| Some may be false positives (e.g., CVE-2023-45853 zlib/minizip not built) |

**Note:** Many scanner-reported CVEs in bookworm-slim are false positives — Debian's security team marks many as `not-affected` when the vulnerable code path isn't built. Always cross-reference with [Debian Security Tracker](https://security-tracker.debian.org).

**Fix:** Rebuild images regularly with `docker build --no-cache` to pull latest bookworm-slim with patches.

---

## 13. Remediation Priority Matrix

### 🔴 P0 — Patch Immediately (actively exploited or pre-auth RCE/disclosure)

| Component    | Action                                        | Effort |
|--------------|-----------------------------------------------|--------|
| MongoDB 7    | Upgrade to ≥ 7.0.31                           | Low    |
| NATS 2       | Pin `nats:2.12.6-alpine` in docker-compose    | Low    |
| nginx        | Upgrade to ≥ 1.29.5 in prod Dockerfile        | Low    |

### 🟠 P1 — Patch This Sprint (high severity, not yet exploited)

| Component        | Action                                        | Effort  |
|------------------|-----------------------------------------------|---------|
| Node.js          | Upgrade to 22.22.0 (dev) / 24.13.0 (prod)    | Low     |
| Solaris Server   | `npm audit fix` (fixes glob, minimatch, picomatch, socket.io-parser, qs, brace-expansion, diff) | Low |
| Solaris Server   | Upgrade bcrypt to 6.0.0 (fixes 6 tar CVEs)   | Medium  |
| Solaris Server   | Upgrade connect-mongodb-session to 5.0.0 (fixes lodash.set, mpath) | Medium |
| Solaris Client   | `npm audit fix` (fixes picomatch, socket.io-parser) | Low |

### 🟡 P2 — Patch Next Cycle (medium/low, limited exposure)

| Component        | Action                                        | Effort |
|------------------|-----------------------------------------------|--------|
| Notify Service   | Wait for async-nats update or pin rustls-webpki override | Low |
| Debian images    | Rebuild with `--no-cache` weekly              | Low    |
| MongoDB          | Disable zlib compression as defense-in-depth  | Low    |

### ✅ P3 — Monitor Only

| Component        | Notes                                         |
|------------------|-----------------------------------------------|
| Archive Service  | Clean audit — no action needed                |
| Dashboard Service| Clean audit — no action needed                |
| Notify rustls-pemfile | Unmaintained warning — no security impact yet |
