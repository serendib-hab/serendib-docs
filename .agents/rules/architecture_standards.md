---
description: Core architectural constraints for microservices and ground station software
globs: ["services/**/*", "packages/**/*", "docs/**/*"]
---

# Architecture Standards for Serendib HAB

## 1. Offline-First Autonomy
- Ground station services (`services/local-*`) must never depend on external internet, cloud servers, or third-party APIs during core flight operations.
- Map viewing must use pre-cached local map tiles.
- Telemetry processing, prediction, and payload commanding must execute 100% locally.

## 2. Non-Destructive Storage
- Raw packet bytes received from the radio must be written sequentially to `packets_raw` without alteration.
- Resolving duplicates or picking the best SNR copy must be recorded in `reconciliation_ledger` via foreign key reference, never by overwriting the raw table.

## 3. Database Resilience
- SQLite must always be initialized with:
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
  ```

## 4. Cloud Messaging via NATS JetStream
- All cloud event routing must use **NATS JetStream** subjects:
  - Raw telemetry: `telemetry.raw.<station_id>`
  - Reconciled telemetry: `telemetry.reconciled`
  - Command audit: `events.command.<action>`
  - Recovery alerts: `alerts.recovery`
- Stream retention policy must be configured for 72 hours with message deduplication windows.
