---
layout: home

hero:
  name: "Serendib HAB"
  text: "Ground Station & Cloud Platform"
  tagline: Autonomous, offline-first ground station pipeline and multi-station synchronization platform for high-altitude balloon missions.
  actions:
    - theme: brand
      text: Architecture Guide →
      link: /guide/architecture-overview
    - theme: alt
      text: Local Station Specs
      link: /local-station/

features:
  - title: Offline-First Autonomy
    details: Complete local pipeline capable of LoRa reception, telemetry decoding, trajectory prediction, and command transmission with zero internet.
  - title: Non-Destructive Storage
    details: Append-only SQLite WAL persistence permanently preserving every raw frame alongside multi-station consensus metrics.
  - title: Decoupled Cloud Platform
    details: Asynchronous message broker feeding public web tracking, broadcast live stream overlays, and recovery team alert dispatchers.
---

## System Architecture

```mermaid
flowchart TB
    subgraph LocalStation ["Local Ground Station (Offline-First)"]
        RF["Radio (LoRa / Serial)"]
        ING["Ingest Service (Go)"]
        STO[("SQLite DB (WAL Mode)")]
        PROC["Python Processing & Prediction"]
        REC["Reconciliation Engine"]
        TUI["Terminal UI"]
        WEB["Web UI & Offline Map"]
        CMD["Command & Validation Engine"]

        RF --> ING
        ING --> STO
        STO --> PROC
        PROC --> REC
        REC --> TUI
        REC --> WEB
        WEB -->|Operator Command| CMD
        TUI -->|Operator Command| CMD
        CMD --> RF
        STO -.->|Audit Log| CMD
    end

    subgraph CloudLayer ["Cloud Layer (Optional Distribution)"]
        C_ING["Cloud Ingress Service"]
        BROKER["Message Broker"]
        C_STO["Central DB"]
        C_REC["Global Reconciliation"]
        C_DIST["Public Live Stream / Dashboard"]
        C_PRED["Fleet Prediction"]
        C_NOTIF["Recovery Team Alerts"]

        C_ING --> BROKER
        BROKER --> C_STO
        BROKER --> C_REC
        BROKER --> C_DIST
        BROKER --> C_PRED
        BROKER --> C_NOTIF
        C_REC -.->|Updated Consensus| BROKER
    end

    STO <-->|Intermittent Sync| C_ING
```

## Documentation Outline

| Part | Engineering Tier | Chapter Highlights |
|---|---|---|
| [**Part I: Architecture & Foundations**](/guide/overview) | High-Level Design | [1. Mission Overview & Flight Profile](/guide/overview)<br>[2. End-to-End System Architecture](/guide/architecture-overview)<br>[3. System Vocabulary & Glossary](/guide/glossary) |
| [**Part II: Local Ground Station**](/local-station/) | Edge & Field Pipeline | [4. Pipeline Overview & State Machine](/local-station/)<br>[5. Radio Ingestion & Framing](/local-station/radio-ingest)<br>[6. SQLite WAL Storage Engine](/local-station/storage-engine)<br>[7. Trajectory Prediction & Wind Models](/local-station/processing-prediction)<br>[8. Command Safety & Interlocks](/local-station/command-safety)<br>[9. Operator Interfaces (TUI & Web)](/local-station/user-interfaces) |
| [**Part III: Cloud Platform**](/cloud-platform/) | Aggregation & Messaging | [10. Cloud Subsystem Architecture](/cloud-platform/)<br>[11. Station Sync Protocol](/cloud-platform/station-sync)<br>[12. NATS JetStream Broker](/cloud-platform/message-broker)<br>[13. Consensus & Reconciliation](/cloud-platform/reconciliation)<br>[14. Downstream Gateways & Telegram Bot](/cloud-platform/downstream-services) |
| [**Part IV: Specifications**](/specs/telemetry-packet-format) | Hardware & DB Contracts | [15. Binary Telemetry Packet Format (32-Byte)](/specs/telemetry-packet-format)<br>[16. Relational Database Schema & DDL](/specs/database-schema) |
