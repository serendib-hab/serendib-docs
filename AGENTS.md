# Agent Guidelines & Engineering Rules for Serendib HAB

These rules govern all autonomous agents and contributors working on the `serendib-v3` codebase and its documentation suite.

---

## 1. Documentation & Vocabulary Standards

1. **Glossary Integration Rule (Mandatory)**:
   - Whenever any new technical term, protocol, hardware standard, or architectural pattern is introduced (e.g. *NATS*, *LoRa*, *WAL Mode*, *HMAC*, *Ring Buffer*, *High-Water Mark*), it **MUST** be added to [`guide/glossary.md`](file:///home/thawshi/code/serendib-v3/serendib-docs/guide/glossary.md).
   - Each glossary entry must include:
     - 💡 **Plain-English Definition** (jargon-free explanation).
     - 📖 **Real-World Analogy** (grounded physical comparison).
     - 🎯 **Why We Use It** in the Serendib project.
   - The term **MUST** be referenced as a markdown link `[Term](/guide/glossary#anchor)` wherever it appears in other documentation files.

2. **No Emojis Policy**:
   - Do **NOT** use decorative emojis in page titles, section headers, navigation bars, system diagrams, or code comments. Maintain a clean, professional aerospace/engineering tone.

3. **Mermaid Diagram Strict Rules**:
   - **Never use unquoted parentheses inside edge labels**: Always quote labels containing parentheses, colons, or commas (e.g. `-->|"Fetch Batch (50 messages)"|` instead of `-->|Fetch Batch (50 messages)|`).
   - **Avoid compound arrow chains**: Never use `A & B --> C & D` or long chains. Use explicit, individual edge statements (`A --> C`, `B --> C`, etc.).
   - **Standard subgraph syntax**: Always use `subgraph Id ["Title"]` with a space between the ID and the bracketed title.
   - **Verify before committing**: Test that diagrams render cleanly without throwing parser syntax errors.

---

## 2. Core Architecture Rules

1. **Offline-First by Design**:
   - Every local ground station service (`services/local-*`) must run 100% autonomously without requiring internet access or cloud dependencies.

2. **Non-Destructive Data Handling**:
   - Received raw RF packets must never be overwritten, modified, or deleted during duplicate packet reconciliation.
   - Reconciliation decisions must be logged separately in a ledger referencing the raw packet IDs.

3. **Database Standards (SQLite WAL)**:
   - Local persistence must use SQLite configured in Write-Ahead Logging (`PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;`).

4. **Cloud Messaging Standards (NATS JetStream)**:
   - All cloud pub/sub communication must use **NATS JetStream** streams and subject hierarchies (`telemetry.raw.<station>`, `telemetry.reconciled`, `events.command`, `alerts.recovery`).
   - Use durable pull consumers for database writers and push consumers for live WebSocket gateways.
