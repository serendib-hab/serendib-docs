# Database Schema Specification

The Serendib HAB architecture utilizes a dual-tier persistence strategy:
- **Edge Ground Station**: Uses embedded [SQLite in WAL Mode](/guide/glossary#wal-mode) for lightweight, zero-dependency offline operation.
- **Central Cloud Platform**: Uses [PostgreSQL](/guide/glossary#postgresql) for multi-station telemetry aggregation, high-concurrency ingestion, and analytical time-series querying.

---

## 1. Relational Schema Architecture

Both the local SQLite database and central PostgreSQL database adhere to the same logical table structure:

1. **`packets_raw`**: Immutable ledger of every RF frame captured by any ground station receiver.
2. **`packets_decoded`**: Parsed engineering telemetry fields (coordinates, altitude, temperature, power metrics).
3. **`commands_log`**: Cryptographically signed audit trail of operator uplink commands.
4. **`reconciliation_ledger`**: Consensus record linking the canonical best packet to each unique flight sequence number.

---

## 2. PostgreSQL DDL (Central Cloud Tier)

```sql
-- 1. Immutable Raw Ingest Table
CREATE TABLE IF NOT EXISTS packets_raw (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(64) NOT NULL,
    timestamp_ns BIGINT NOT NULL,
    raw_payload BYTEA NOT NULL,
    rssi_dbm INT NOT NULL,
    snr_db NUMERIC(5, 2) NOT NULL,
    crc_valid BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packets_raw_station_time 
ON packets_raw (station_id, timestamp_ns);

CREATE INDEX IF NOT EXISTS idx_packets_raw_created_at 
ON packets_raw (created_at);

-- 2. Decoded Engineering Telemetry Table
CREATE TABLE IF NOT EXISTS packets_decoded (
    id BIGSERIAL PRIMARY KEY,
    raw_packet_id BIGINT NOT NULL REFERENCES packets_raw(id) ON DELETE CASCADE,
    sequence_num BIGINT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude_m REAL NOT NULL,
    ascent_rate_mps REAL,
    pressure_hpa REAL,
    temp_internal_c REAL,
    temp_external_c REAL,
    battery_v REAL,
    door_intake_open BOOLEAN NOT NULL DEFAULT FALSE,
    air_sampling_active BOOLEAN NOT NULL DEFAULT FALSE,
    gps_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packets_decoded_seq 
ON packets_decoded (sequence_num);

CREATE INDEX IF NOT EXISTS idx_packets_decoded_alt 
ON packets_decoded (altitude_m);

-- 3. Command Audit Log Table
CREATE TABLE IF NOT EXISTS commands_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp_ns BIGINT NOT NULL,
    command_type VARCHAR(64) NOT NULL,
    parameters_json JSONB,
    operator_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL, -- PENDING, TRANSMITTED, ACKNOWLEDGED, FAILED
    signature_hmac VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_commands_log_operator 
ON commands_log (operator_id, timestamp_ns);

-- 4. Multi-Station Reconciliation Consensus Ledger
CREATE TABLE IF NOT EXISTS reconciliation_ledger (
    id BIGSERIAL PRIMARY KEY,
    sequence_num BIGINT NOT NULL UNIQUE,
    best_raw_packet_id BIGINT NOT NULL REFERENCES packets_raw(id),
    selection_score NUMERIC(6, 3) NOT NULL,
    station_count INT NOT NULL,
    reconciled_at_ns BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. SQLite DDL (Edge Ground Station Tier)

```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 1. Immutable Raw Ingest Table
CREATE TABLE IF NOT EXISTS packets_raw (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id TEXT NOT NULL,
    timestamp_ns INTEGER NOT NULL,
    raw_payload BLOB NOT NULL,
    rssi_dbm INTEGER NOT NULL,
    snr_db REAL NOT NULL,
    crc_valid INTEGER NOT NULL CHECK (crc_valid IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packets_raw_station_time 
ON packets_raw (station_id, timestamp_ns);

-- 2. Decoded Engineering Telemetry Table
CREATE TABLE IF NOT EXISTS packets_decoded (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_packet_id INTEGER NOT NULL REFERENCES packets_raw(id),
    sequence_num INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    altitude_m REAL NOT NULL,
    ascent_rate_mps REAL,
    pressure_hpa REAL,
    temp_internal_c REAL,
    temp_external_c REAL,
    battery_v REAL,
    door_intake_open INTEGER NOT NULL DEFAULT 0 CHECK (door_intake_open IN (0, 1)),
    air_sampling_active INTEGER NOT NULL DEFAULT 0 CHECK (air_sampling_active IN (0, 1)),
    gps_locked INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packets_decoded_seq 
ON packets_decoded (sequence_num);

CREATE INDEX IF NOT EXISTS idx_packets_decoded_alt 
ON packets_decoded (altitude_m);

-- 3. Command Audit Log Table
CREATE TABLE IF NOT EXISTS commands_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp_ns INTEGER NOT NULL,
    command_type TEXT NOT NULL,
    parameters_json TEXT,
    operator_id TEXT NOT NULL,
    status TEXT NOT NULL,
    signature_hmac TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Multi-Station Reconciliation Consensus Ledger
CREATE TABLE IF NOT EXISTS reconciliation_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sequence_num INTEGER NOT NULL UNIQUE,
    best_raw_packet_id INTEGER NOT NULL REFERENCES packets_raw(id),
    selection_score REAL NOT NULL,
    station_count INTEGER NOT NULL,
    reconciled_at_ns INTEGER NOT NULL
);
```
