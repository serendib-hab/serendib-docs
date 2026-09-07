# End-to-End System Architecture

## 1. High-Level Architecture

The Serendib HAB platform operates across two distinct domains: the **Local Field Tier** (autonomous ground stations) and the **Cloud Tier** (centralized telemetry distribution).

```mermaid
flowchart TB
    subgraph BalloonDomain ["High-Altitude Balloon (Stratosphere)"]
        PAYLOAD["Payload Sensors & Microcontroller"]
        TX["LoRa / UHF Transceiver"]
        PAYLOAD --> TX
    end

    subgraph LocalDomain ["Local Ground Station (Offline Field Node)"]
        RX["LoRa Transceiver"]
        ING["Ingest Service (Go)"]
        DB[("Append-Only SQLite (WAL)")]
        PROC["Python Telemetry & Trajectory Predictor"]
        REC["Local Reconciliation Engine"]
        UI["Operator UI (Terminal & Offline Map)"]
        CMD["Command Safety Engine"]

        RX -->|Serial Stream| ING
        ING -->|Raw Append| DB
        DB -->|Notify| PROC
        PROC -->|Decoded Metrics| DB
        DB --> REC --> UI
        UI -->|Uplink Auth| CMD -->|Serial Frame| RX
        DB -.->|Audit Log| CMD
    end

    subgraph CloudDomain ["Cloud Distribution Tier (Internet)"]
        GATEWAY["Ingress API Gateway (Go)"]
        BROKER["Message Broker (Pub/Sub)"]
        C_STORE["Central Storage Subscriber"]
        C_REC["Global Consensus Engine"]
        DIST["WebSockets & Broadcast Feed"]
        ALERTS["Telegram Recovery Bot"]

        GATEWAY --> BROKER
        BROKER --> C_STORE
        BROKER --> C_REC
        BROKER --> DIST
        BROKER --> ALERTS
        C_REC -.->|Consensus Update| BROKER
    end

    TX -.->|"RF Downlink"| RX
    RX -.->|"RF Uplink Command"| TX
    DB <-->|"Opportunistic HTTPS Batch Sync"| GATEWAY
```

---

## 2. Network Boundaries & Protocols

| Network Domain | Protocol | Reliability & Characteristics | Glossary Reference |
|---|---|---|---|
| **Payload to Ground (Downlink)** | [LoRa](/guide/glossary#lora) RF / FSK | Long-range radio broadcast reaching 200+ km line-of-sight. | [LoRa Technology](/guide/glossary#lora) |
| **Ground to Payload (Uplink)** | Authenticated [LoRa](/guide/glossary#lora) Frame | Deliberate, [HMAC-signed](/guide/glossary#hmac) command pulses with [CRC verification](/guide/glossary#crc). | [HMAC Signatures](/guide/glossary#hmac) |
| **Local Internal IPC** | [SQLite WAL File I/O](/guide/glossary#wal-mode) | Fast local inter-process communication protected against field power loss. | [SQLite WAL Mode](/guide/glossary#wal-mode) |
| **Station to Cloud Sync** | [Idempotent](/guide/glossary#idempotency) HTTPS Batch | Opportunistic cellular/satellite backhaul with [high-water mark](/guide/glossary#high-water-mark) tracking. | [Idempotency](/guide/glossary#idempotency) |
| **Cloud Internal Services** | [Message Broker](/guide/glossary#message-broker) (Pub/Sub) | Low-latency, durable intra-cloud message distribution. | [Message Broker](/guide/glossary#message-broker) |

---

## 3. Failure Domain Analysis

```mermaid
flowchart TD
    subgraph Failures ["Possible Failure Modes"]
        F1["Cellular Connectivity Lost"]
        F2["Local Process Crash"]
        F3["Cloud Infrastructure Outage"]
        F4["Corrupted RF Frame Received"]
    end

    subgraph Mitigations ["Architectural Mitigation"]
        M1["Zero impact on field operations; data buffers in SQLite until connection restores."]
        M2["SQLite WAL mode guarantees no data loss; supervisor restarts process from last read offset."]
        M3["Ground stations continue tracking, prediction, and payload commanding autonomously."]
        M4["Raw frame preserved for post-flight forensic analysis; corrupted fields isolated from display."]
    end

    F1 ==> M1
    F2 ==> M2
    F3 ==> M3
    F4 ==> M4
```
