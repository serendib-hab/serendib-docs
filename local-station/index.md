# Local Ground Station Architecture

## 1. Subsystem Overview

The Local Ground Station is an autonomous hardware-software unit designed to operate unattended at fixed tracking sites or inside mobile recovery vehicles.

```mermaid
flowchart TB
    subgraph StationPipeline ["Local Station Pipeline (Go & Python)"]
        RADIO["LoRa / Serial Radio"]
        ING["1. Ingest Service (Go)"]
        STO[("2. Storage Engine (SQLite WAL)")]
        PROC["3. Processing & Prediction (Python)"]
        REC["4. Local Reconciliation (Go)"]
        CMD["5. Command Engine (Go)"]
        UI["6. Operator Interface (TUI & Web)"]

        RADIO -->|Raw Byte Stream| ING
        ING -->|Append Raw Record| STO
        STO -->|Notify Packet Arrival| PROC
        PROC -->|Store Decoded State & Trajectory| STO
        STO -->|Query Telemetry| REC
        REC -->|Best Candidate Stream| UI
        UI -->|Operator Command Request| CMD
        CMD -->|Validated Uplink Frame| RADIO
        STO -.->|Audit Logging| CMD
    end
```

---

## 2. Pipeline Stages

| Stage | Subsystem | Responsibility |
|---|---|---|
| **1. Ingest** | [Radio Ingest Service](./radio-ingest.md) | Reads serial bytes from LoRa/SDR hardware, attaches monotonic nanosecond timestamps, and pushes to storage without blocking. |
| **2. Storage** | [Storage Engine (SQLite)](./storage-engine.md) | Crash-safe append-only persistence using SQLite in WAL mode. Protects against sudden field power cuts. |
| **3. Processing** | [Processing & Trajectory Prediction](./processing-prediction.md) | Parses binary frames into sensor metrics (GPS, altitude, pressure, temp) and computes landing prediction ellipses via Python. |
| **4. Reconciliation** | [Local Reconciliation](./storage-engine.md#reconciliation) | Selects the highest-SNR packet when multiple reception paths exist. |
| **5. Command** | [Command Safety Engine](./command-safety.md) | Enforces authentication, rate limits, operator dual-confirmation, and pre-transmission safety checks for payload uplinks. |
| **6. Display** | [Operator User Interfaces](./user-interfaces.md) | Real-time dual display: High-density Terminal UI (TUI) for quick monitoring and browser-based offline interactive map. |

---

## 3. Operational State Machine

```mermaid
stateDiagram-v2
    [*] --> Standby: Station Power On
    Standby --> Listening: Radio Interface Initialized
    Listening --> Tracking: Valid Telemetry Frame Decoded
    Tracking --> Tracking: Continuous Ingest & Path Prediction
    Tracking --> PayloadCommanding: Operator Initiates Uplink
    PayloadCommanding --> Tracking: Command Transmitted & Logged
    Tracking --> RecoveryMode: Burst Detected & Descent Tracked
    RecoveryMode --> MissionComplete: Payload Landed & Retrieved
    MissionComplete --> [*]
```
