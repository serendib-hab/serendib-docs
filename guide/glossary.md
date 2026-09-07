# System Vocabulary & Concepts Glossary

This page provides plain-language explanations, real-world analogies, and technical definitions for every key term used throughout the documentation. Whenever a technical term is mentioned in the architecture guides, it links back to this reference.

---

## 1. Storage & Database Concepts

### Append-Only Storage {#append-only-storage}
- **Plain Explanation**: A way of saving data where new records are only ever added to the end of a list. Old records are never edited or erased.
- **Analogy**: A physical paper logbook written in permanent ink. If you make an error or get new information, you write a new entry below it rather than tearing out or erasing old pages.
- **Why We Use It**: If a ground station receives two different copies of the same packet, it keeps both and writes a separate note about which one is best. You never lose historical data.

### SQLite in WAL Mode {#wal-mode}
- **Plain Explanation**: SQLite is a self-contained database stored inside a single file on disk (requiring no separate database server). **WAL (Write-Ahead Logging)** is a safety mode where changes are written to a temporary log file first before being committed to the main database.
- **Analogy**: Writing your notes on a scratch pad first before neatly copying them into your permanent binder.
- **Why We Use It**: In field environments where a laptop or Raspberry Pi might lose battery power suddenly, WAL mode ensures the database never gets corrupted. It also allows the map UI to read telemetry at the exact same millisecond the radio is writing new data.

### PostgreSQL {#postgresql}
- **Plain Explanation**: A robust, open-source relational database management system designed for multi-client concurrent transactions, complex analytical queries, and large-scale data persistence.
- **Analogy**: A centralized university library with a master catalogue and multiple librarians serving hundreds of researchers at the same time, compared to a single field pocket notebook.
- **Why We Use It**: In the Serendib Cloud Platform, PostgreSQL serves as the central data store. While field ground stations use embedded SQLite for lightweight offline autonomy, the cloud aggregates telemetry from all stations simultaneously into PostgreSQL for historical analysis, fleet consensus ledgers, and fast querying across millions of data points.

### High-Water Mark (Sync Cursor) {#high-water-mark}
- **Plain Explanation**: A simple integer pointer that records the ID or timestamp of the last message successfully processed or synchronized.
- **Analogy**: A bookmark in a novel that tracks which page you reached so you can resume immediately without re-reading from chapter one.

---

## 2. Radio & Hardware Telemetry Concepts

### LoRa (Long Range Radio) {#lora}
- **Plain Explanation**: A low-power wireless radio frequency technology designed to send small packets of data over very long distances (tens to hundreds of kilometers).
- **Why We Use It**: A balloon payload has strict battery weight limits. LoRa allows a small 100mW transmitter on the balloon to reach ground antennas up to 200+ km away.

### RSSI (Received Signal Strength Indicator) {#rssi}
- **Plain Explanation**: A measurement of the total radio power received by an antenna, expressed in negative decibels relative to one milliwatt (dBm).
- **How to Read It**: Numbers closer to zero mean a stronger signal. For example, **-70 dBm** is a strong signal, while **-120 dBm** is near the edge of reception.

### SNR (Signal-to-Noise Ratio) {#snr}
- **Plain Explanation**: The ratio of the desired balloon radio signal compared to background electromagnetic noise, measured in decibels (dB).
- **How to Read It**: Positive numbers (e.g. **+8 dB**) mean the signal is clearly above background noise. LoRa is unique because it can decode signals even with negative SNR (down to **-15 dB** to **-20 dB**), meaning it can decode transmissions that are quieter than background noise.

### CRC (Cyclic Redundancy Check) {#crc}
- **Plain Explanation**: A mathematical checksum calculated from the bytes in a packet and attached to the end. The receiving ground station recalculates the checksum to confirm no bits were corrupted during radio flight.
- **Analogy**: The last check-digit on a credit card or barcode that catches typing mistakes.

### Memory Ring Buffer {#ring-buffer}
- **Plain Explanation**: A fixed-size circular queue in RAM that temporarily holds incoming data. When the end is reached, new data wraps around to the beginning.
- **Why We Use It**: When incoming radio bytes arrive rapidly while the computer's hard drive is momentarily busy, the ring buffer stores the packets in memory so zero frames are dropped.

---

## 3. Architecture & Cloud Messaging Patterns

### NATS & NATS JetStream {#nats}
- **Plain Explanation**: **NATS** is an ultra-fast, lightweight open-source messaging system written in Go. **NATS JetStream** is the persistence layer built into NATS that provides message storage, deduplication, and guaranteed delivery (at-least-once).
- **Analogy**: A high-speed postal routing center with lockboxes. Senders drop messages into subjects, and recipients can collect them in real time or pick up backlogged messages later if they were temporarily offline.
- **Why We Use It**: 
  1. It requires under 20MB of RAM and deploys as a single static binary.
  2. Native Go ecosystem alignment with our backend services.
  3. High-throughput subject filtering (e.g. `telemetry.raw.station-alpha` vs `telemetry.reconciled`).

### Offline-First Architecture {#offline-first}
- **Plain Explanation**: A design approach where every ground station can perform 100% of its functions—receiving radio frames, decoding coordinates, calculating balloon trajectories, and sending cutdown commands—with zero internet connectivity.
- **Why We Use It**: Recovery vehicles operate in remote wilderness areas where mobile network coverage drops to zero. Ground teams cannot rely on cloud servers for mission safety.

### Message Broker (Pub/Sub) {#message-broker}
- **Plain Explanation**: A server component that receives messages from one sender (a *Publisher*) and distributes them to any number of interested receivers (the *Subscribers*), without the sender needing to know who or how many receivers exist.
- **Analogy**: A town bulletin board or a newsletter mailing list. The author writes one post, and everyone subscribed receives a copy.
- **Why We Use It**: In our cloud platform, independent developers can build a public website, a YouTube live stream overlay, and a Telegram recovery alert bot simultaneously without touching the core radio ingest code.

### Multi-Receiver Reconciliation (Consensus) {#reconciliation}
- **Plain Explanation**: The automated process of evaluating duplicate copies of the same packet captured by multiple ground stations to identify the cleanest, highest-confidence version.
- **Why We Use It**: Because radio broadcasts are omnidirectional, three different ground stations might capture the same 1-second transmission. The reconciliation engine picks the copy with the highest SNR and lowest error rate.

### Idempotency {#idempotency}
- **Plain Explanation**: An operation that produces the exact same result no matter how many times it is repeated.
- **Analogy**: Pressing an elevator button for floor 4. Pressing it once or pressing it 5 times leaves you on floor 4 without causing errors.
- **Why We Use It**: If a mobile recovery team loses connection mid-sync and re-sends the same batch of packets, the cloud server accepts them without creating duplicate records.

---

## 4. Command & Safety Concepts

### Air Intake Door (Atmospheric Sampling Vent) {#air-intake-door}
- **Plain Explanation**: A motorized door or vent hatch on the payload enclosure that opens and closes upon command or at preset altitudes to intake atmospheric air for scientific sensors and filter sampling.
- **Analogy**: A sunroof or window on a research vehicle that opens to collect air samples while moving and seals shut during extreme conditions to protect internal electronics.
- **Why We Use It**: Allows selective stratospheric air sampling while keeping internal payload electronics protected from extreme sub-zero temperatures and moisture during cloud transit.

### Cryptographic HMAC Signature {#hmac}
- **Plain Explanation**: A security tag calculated using a secret password known only to the ground station and the balloon payload. It proves that a command was transmitted by an authorized operator and was not forged or altered.
- **Why We Use It**: Prevents unauthorized individuals or stray radio noise on the same frequency from triggering the balloon's cutdown wire.

### Monotonic Sequence Index & Replay Protection {#replay-protection}
- **Plain Explanation**: Every command includes a counter that increases with each transmission (1, 2, 3...). The balloon payload ignores any command with a number less than or equal to the last command it processed.
- **Why We Use It**: Prevents an adversary from recording a radio command and replaying it later to trigger an accidental cutdown.

### Dual-Confirmation Handshake {#dual-confirmation}
- **Plain Explanation**: A safety protocol requiring an operator to confirm an irreversible action (like cutting the payload parachute) through two separate deliberate prompts within a strict time limit.
- **Analogy**: Turning two separate keys simultaneously to launch a rocket.
