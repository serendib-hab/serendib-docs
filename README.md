# Serendib HAB Documentation Portal (`serendib-docs`)

Standalone engineering documentation web application for the High-Altitude Balloon (HAB) Ground Station & Multi-Station Cloud Synchronization Platform.

---

## Interactive Documentation Web App

Built with [VitePress](https://vitepress.dev/) with interactive zoomable Mermaid diagrams, search, and dark/light themes.

### Quick Start

```bash
cd serendib-docs
pnpm install
pnpm dev
```

Open `http://localhost:5173` to access the live portal.

---

## Documentation Structure

```text
docs/
├── guide/                              # System Architecture & Fundamentals
│   ├── overview.md                     # Mission context, operational constraints, philosophy
│   ├── architecture-overview.md        # End-to-end data paths & failure domain analysis
│   └── glossary.md                     # Engineering terms, protocols, and tool justifications
├── local-station/                      # Autonomous Field Station Pipeline (Offline-First)
│   ├── index.md                        # Subsystem breakdown & state machine
│   ├── radio-ingest.md                 # LoRa/Serial ingest, framing, & memory ring buffer
│   ├── storage-engine.md               # SQLite WAL append-only engine & crash resilience
│   ├── processing-prediction.md        # Python telemetry decoding & atmospheric wind models
│   ├── command-safety.md               # Uplink validation, HMAC auth, & cutdown safeguards
│   └── user-interfaces.md              # Terminal TUI & offline interactive Leaflet map
├── cloud-platform/                     # Cloud Telemetry Aggregation & Distribution
│   ├── index.md                        # Decoupled cloud subscriber architecture
│   ├── station-sync.md                 # Stateless HTTP batch sync & delta query protocol
│   ├── message-broker.md               # Durable pub/sub topic routing & consumer groups
│   ├── reconciliation.md               # Multi-station consensus scoring algorithm
│   └── downstream-services.md          # WebSockets, OBS live overlay, & Telegram bot
└── specs/                              # Formal Engineering Specifications
    ├── telemetry-packet-format.md      # Binary 32-byte LoRa packet bitfield specification
    └── database-schema.md              # Complete SQL DDL tables, indices, & constraints
```

---

## Planned Microservices Monorepo Layout

```text
serendib-v3/
├── docs/                               # Standalone VitePress documentation site
├── services/                           # Microservices (Local Station & Cloud)
│   ├── local-ingest/                   # Serial/LoRa hardware radio ingest (Go)
│   ├── local-storage/                  # SQLite WAL append-only storage engine (Go)
│   ├── local-processing/               # Telemetry decoding & trajectory prediction (Python)
│   ├── local-command/                  # Validated balloon command transmitter (Go)
│   ├── local-tui/                      # Terminal monitoring interface (Go/Bubbletea)
│   ├── local-web/                      # Offline map & web operator dashboard
│   ├── cloud-ingress/                  # Cloud ingestion gateway (Go)
│   ├── cloud-reconciliation/           # Multi-station global telemetry consensus
│   ├── cloud-distribution/             # Public dashboard & live stream overlay subscriber
│   └── cloud-telegram-bot/             # Telegram bot for field recovery alerts & navigation
└── packages/                           # Shared schemas & libraries
    ├── telemetry-proto/                # Protocol definitions & schemas
    └── common/                         # Shared utilities
```
