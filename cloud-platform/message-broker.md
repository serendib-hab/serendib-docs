# NATS JetStream Message Broker

## 1. Role of NATS in the Cloud Platform

The cloud distribution layer uses **[NATS JetStream](/guide/glossary#nats)** as its central message broker. Written in Go, NATS provides sub-millisecond pub/sub routing, built-in stream persistence, and horizontal consumer scaling with a tiny memory footprint (<20MB RAM).

```mermaid
flowchart LR
    subgraph Ingress ["Publishers"]
        GW["Cloud Ingress Gateway (Go)"]
        REC["Consensus Engine (Go)"]
    end

    subgraph NATS ["NATS JetStream (TELEMETRY Stream)"]
        T1["telemetry.raw.station-alpha"]
        T2["telemetry.raw.station-beta"]
        T3["telemetry.reconciled"]
        T4["events.command"]
        T5["alerts.recovery"]
    end

    subgraph Consumers ["NATS JetStream Consumer Groups"]
        S_DB["Storage Worker<br>(Durable Pull Consumer)"]
        S_MAP["Public WebSocket Gateway<br>(Push Consumer)"]
        S_OBS["OBS Stream Overlay<br>(Push Consumer)"]
        S_BOT["Telegram Recovery Bot<br>(Durable Pull Consumer)"]
    end

    GW -->|Publish Raw| T1
    GW -->|Publish Raw| T2
    GW -->|Publish Commands| T4
    REC -->|Publish Consensus| T3

    T1 --> S_DB
    T2 --> S_DB
    T1 --> REC
    T2 --> REC
    T3 --> S_MAP
    T3 --> S_OBS
    T4 --> S_BOT
    T5 --> S_BOT
```

---

## 2. NATS JetStream Stream Configuration

The central telemetry stream (`TELEMETRY`) is defined as follows:

```json
{
  "name": "TELEMETRY",
  "subjects": [
    "telemetry.raw.>",
    "telemetry.reconciled",
    "events.>",
    "alerts.>"
  ],
  "retention": "limits",
  "max_age": 259200000000000,
  "storage": "file",
  "replicas": 1,
  "discard": "old",
  "duplicate_window": 120000000000
}
```

### Key Stream Attributes:
- **`max_age: 72 Hours`**: Retains flight telemetry for 3 full days. If any subscriber process restarts during pre-flight or post-flight analysis, it catches up automatically from its last acknowledged sequence.
- **`duplicate_window: 2 Minutes`**: Built-in NATS deduplication using the `Nats-Msg-Id` header. If an intermittent cellular link retransmits a sync payload, NATS discards duplicates at the broker level.

---

## 3. NATS Subject Hierarchy

NATS uses dot-separated wildcard subjects:

| Subject Pattern | Publisher | Example Payload | Description |
|---|---|---|---|
| `telemetry.raw.<station_id>` | Ingress API Gateway | Inbound raw LoRa frame + metadata | Telemetry captured by a specific field station (e.g. `telemetry.raw.mobile-alpha`). |
| `telemetry.reconciled` | Consensus Engine | Cleaned, de-duplicated state | Highest-confidence telemetry frame used for public web trackers. |
| `events.command.<action>` | Command Engine | Command audit record | Authorized uplink commands (e.g. `events.command.cutdown`). |
| `alerts.recovery` | Flight Predictor | JSON coordinate payload | Automated flight events (e.g. burst altitude reached, touchdown coordinates). |

---

## 4. Consumer Architecture: Pull vs. Push

```mermaid
flowchart TD
    subgraph JetStream ["NATS JetStream Engine"]
        STREAM[("TELEMETRY Stream Storage")]
    end

    subgraph PullConsumer ["1. Durable Pull Consumer - Storage Service"]
        P_WORKER["DB Writer Worker"]
        P_WORKER -->|Fetch Batch 50 Messages| STREAM
        STREAM -->|Deliver Batch| P_WORKER
        P_WORKER -->|Acknowledge Message ACK| STREAM
    end

    subgraph PushConsumer ["2. Ephemeral Push Consumer - Live Map"]
        WS_HUB["WebSocket Distribution Hub"]
        STREAM -->|Stream Live Messages| WS_HUB
        WS_HUB -->|Broadcast to Browsers| CLIENTS["Web Visitors"]
    end
```

### Why NATS JetStream Over RabbitMQ or Kafka?
1. **Single Static Binary**: Zero JVM dependencies or Erlang runtimes. Deploys seamlessly in lightweight Docker containers alongside our Go microservices.
2. **Resource Efficiency**: Handles hundreds of thousands of messages per second on modest cloud VMs with sub-millisecond latency.
3. **Native Go Integration**: Uses official `github.com/nats-io/nats.go` client with idiomatic Go concurrency (goroutines and channels).
