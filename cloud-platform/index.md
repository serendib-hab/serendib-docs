# Cloud Platform Architecture

## 1. Role of the Cloud Tier

The Cloud Platform aggregates telemetry from multiple field ground stations, resolves duplicate packet diversity, and distributes live flight feeds to external consumers (public live trackers, broadcast video overlays, scientific data dumps, and Telegram recovery alert bots).

```mermaid
flowchart TB
    subgraph Stations ["Field Ground Stations"]
        S1["Fixed Launch Station"]
        S2["Mobile Unit Alpha"]
        S3["Mobile Unit Beta"]
    end

    subgraph IngressTier ["Cloud Edge Layer"]
        ING["Ingress API Gateway (Go)"]
    end

    subgraph BrokerTier ["Message Distribution Core"]
        BROKER["Durable Message Broker (Pub/Sub)"]
    end

    subgraph ServiceTier ["Subscriber Microservices"]
        DB_SUB["PostgreSQL Storage Worker"]
        REC_SUB["Global Consensus Engine"]
        WS_SUB["Public WebSocket Gateway"]
        BOT_SUB["Telegram Recovery Bot"]
        ARCH_SUB["Post-Flight Analytics Archive"]
    end

    S1 -->|"Batch Sync (HTTPS)"| ING
    S2 -->|"Batch Sync (HTTPS)"| ING
    S3 -->|"Batch Sync (HTTPS)"| ING
    ING -->|Publish telemetry.raw| BROKER
    BROKER --> DB_SUB
    BROKER --> REC_SUB
    BROKER --> WS_SUB
    BROKER --> BOT_SUB
    BROKER --> ARCH_SUB
    REC_SUB -.->|Publish telemetry.reconciled| BROKER
```

---

## 2. Decoupled Microservice Architecture

Every downstream consumer runs as an independent subscriber process connected to the message broker:

| Component | Subsystem | Responsibility |
|---|---|---|
| **Ingress Gateway** | [Station Sync Protocol](./station-sync.md) | Authenticates field stations, receives batched packet payloads, rate-limits requests, and publishes to the message broker. |
| **Message Broker** | [NATS JetStream Message Broker](./message-broker.md) | High-performance NATS pub/sub topic routing with 72-hour stream persistence. |
| **Global Reconciliation** | [Consensus Algorithm](./reconciliation.md) | Compares simultaneous multi-station packet copies to select the highest-SNR consensus frame. |
| **Central Persistence** | [Database Schema & DDL](/specs/database-schema) | Writes incoming raw packets and reconciled consensus telemetry into a central [PostgreSQL](/guide/glossary#postgresql) database. |
| **Downstream Services** | [Consumer Services](./downstream-services.md) | Public tracking map, OBS broadcast overlay, Telegram recovery bot, and scientific archiving. |
