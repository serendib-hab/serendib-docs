# Local Storage Engine (SQLite WAL)

## 1. Storage Architecture

The local storage subsystem uses **SQLite** in **[WAL (Write-Ahead Logging) Mode](/guide/glossary#wal-mode)**. It provides atomic, [Append-Only Persistence](/guide/glossary#append-only-storage) on unattended field computers with zero external database server dependencies.

```mermaid
flowchart LR
    W1["Ingest Writer"] -->|Append| WAL["Write-Ahead Log (WAL File)"]
    W2["Decoder Writer"] -->|Append| WAL
    WAL -.->|Background Checkpoint| DB[("Main Database File .db")]

    DB -->|Concurrent Read| R1["Trajectory Predictor"]
    DB -->|Concurrent Read| R2["Operator Terminal / Map"]
    DB -->|Concurrent Read| R3["Cloud Sync Agent"]
```

---

## 2. WAL Mode Configuration & Pragmas

When the storage engine initializes, it applies the following settings to ensure field reliability:

```sql
-- Enable Write-Ahead Logging for concurrent readers and writer
PRAGMA journal_mode = WAL;

-- Balance durability and disk write latency (survives process crash)
PRAGMA synchronous = NORMAL;

-- Enforce UTF-8 encoding
PRAGMA encoding = "UTF-8";

-- Set busy timeout to prevent locking conflicts
PRAGMA busy_timeout = 5000;

-- Auto-checkpoint when WAL reaches 1000 pages (~4MB)
PRAGMA wal_autocheckpoint = 1000;
```

---

## 3. Database Schema Overview

```mermaid
erDiagram
    PACKETS_RAW ||--o{ PACKETS_DECODED : "1 to 1..N"
    PACKETS_RAW {
        INTEGER id PK
        TEXT station_id
        INTEGER timestamp_ns
        BLOB raw_payload
        INTEGER rssi_dbm
        REAL snr_db
        INTEGER crc_valid
    }
    PACKETS_DECODED {
        INTEGER id PK
        INTEGER raw_packet_id FK
        REAL latitude
        REAL longitude
        REAL altitude_m
        REAL ascent_rate_mps
        REAL pressure_hpa
        REAL temp_internal_c
        REAL temp_external_c
        REAL battery_v
    }
    COMMANDS_LOG {
        INTEGER id PK
        INTEGER timestamp_ns
        TEXT command_type
        TEXT parameters_json
        TEXT operator_id
        TEXT status
        TEXT signature
    }
    RECONCILIATION_LEDGER {
        INTEGER id PK
        INTEGER sequence_num
        INTEGER best_raw_packet_id FK
        TEXT selection_reason
        INTEGER reconciled_at_ns
    }
```

---

## 4. Crash Recovery & [Idempotency](/guide/glossary#idempotency)

1. **Sudden Power Cut Resilience**: Because writes go sequentially to the WAL log file, a sudden battery disconnection leaves the database intact. Upon reboot, SQLite recovers uncheckpointed WAL frames automatically.
2. **Deterministic Replay via [High-Water Marks](/guide/glossary#high-water-mark)**: If the Python processing engine restarts, it queries `MAX(raw_packet_id)` from `packets_decoded` and resumes processing from that high-water mark without losing or duplicating historical frames.
