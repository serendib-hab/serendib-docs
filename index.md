---
layout: home

hero:
  name: "Serendib HAB"
  text: "Ground Station & Cloud Platform"
  tagline: Autonomous, offline-first ground station pipeline and multi-station synchronization platform for high-altitude balloon missions.
  image:
    src: /serendib-logo.png
    alt: Serendib HAB Mission Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/overview
    - theme: alt
      text: System Architecture
      link: /guide/architecture-overview

features:
  - title: Offline-First Autonomy
    details: Complete local pipeline capable of LoRa reception, telemetry decoding, trajectory prediction, and command transmission with zero internet.
  - title: Non-Destructive Storage
    details: Append-only SQLite WAL persistence permanently preserving raw frames alongside multi-station consensus metrics.
  - title: Decoupled Cloud Platform
    details: Asynchronous message broker feeding public web tracking, broadcast live stream overlays, and alert dispatchers.
---

<div class="home-section">

## System Documentation & Roadmap

| Part | Engineering Tier | Chapter Highlights |
| :--- | :--- | :--- |
| [**Part I: Architecture & Foundations**](/guide/overview) | High-Level Design | [1. Mission Overview & Flight Profile](/guide/overview)<br>[2. End-to-End System Architecture](/guide/architecture-overview)<br>[3. System Vocabulary & Glossary](/guide/glossary) |
| [**Part II: Local Ground Station**](/local-station/) | Edge & Field Pipeline | [4. Pipeline Overview & State Machine](/local-station/)<br>[5. Radio Ingestion & Hardware Framing](/local-station/radio-ingest)<br>[6. SQLite WAL Storage Engine](/local-station/storage-engine)<br>[7. Trajectory Prediction & Wind Models](/local-station/processing-prediction)<br>[8. Command Safety & Interlocks](/local-station/command-safety)<br>[9. Operator Interfaces (TUI & Web)](/local-station/user-interfaces) |
| [**Part III: Cloud Platform**](/cloud-platform/) | Aggregation & Messaging | [10. Cloud Subsystem Architecture](/cloud-platform/)<br>[11. Station Sync Protocol](/cloud-platform/station-sync)<br>[12. NATS JetStream Message Broker](/cloud-platform/message-broker)<br>[13. Consensus & Reconciliation](/cloud-platform/reconciliation)<br>[14. Downstream Gateways & Telegram Bot](/cloud-platform/downstream-services) |
| [**Part IV: Specifications**](/specs/telemetry-packet-format) | Hardware & DB Contracts | [15. Binary Telemetry Packet Format](/specs/telemetry-packet-format)<br>[16. Relational Database Schema & DDL](/specs/database-schema) |

</div>
