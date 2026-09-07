# Multi-Station Reconciliation Algorithm

## 1. Problem: Multi-Receiver Redundancy

When five ground stations receive the identical 1-Hz [LoRa](/guide/glossary#lora) transmission from the balloon, five copies enter the cloud ingress gateway with varying timestamps, [Signal-to-Noise Ratios (SNR)](/guide/glossary#snr), and [Received Signal Strength Indicators (RSSI)](/guide/glossary#rssi).

```mermaid
flowchart TD
    subgraph MultiStationInput ["Inbound Copies for Sequence 1240"]
        C1["Station 1: RSSI -108 dBm, SNR -2.0 dB, CRC OK"]
        C2["Station 2: RSSI -84 dBm, SNR +9.5 dB, CRC OK"]
        C3["Station 3: RSSI -114 dBm, SNR -6.0 dB, CRC FAILED"]
    end

    subgraph ConsensusEngine ["Consensus Engine"]
        FILTER["1. CRC Validation Filter"]
        WINDOW["2. Temporal Window Matching (within 2000ms)"]
        SCORE["3. Quality Metric Scoring"]
        SELECT["4. Best Candidate Selection"]
    end

    MultiStationInput --> FILTER
    FILTER --> WINDOW
    WINDOW --> SCORE
    SCORE --> SELECT
    SELECT --> OUT["Publish to telemetry.reconciled (Selected: Station 2)"]
```

---

## 2. Scoring & Selection Function

For every packet group sharing the same sequence counter:

1. **[CRC Checksum Filter](/guide/glossary#crc)**: Any packet where `crc_valid == false` is filtered out of the consensus pool.
2. **Quality Score (Q) Calculation**:
   ```text
   Q = (0.60 * SNR) + (0.30 * RSSI_norm) + (0.10 * ValidFieldCount)
   ```
   - **SNR Weight (60%)**: Highest priority given to high signal-to-noise ratio.
   - **RSSI Weight (30%)**: Secondary weight given to raw signal strength.
   - **Field Integrity (10%)**: Tiebreaker given to packets with all sensor channels intact.

3. **[Consensus Ledger Update](/guide/glossary#append-only-storage)**: The highest-scoring candidate is written to `reconciliation_ledger` with the `best_packet_id` pointer. All original raw packets remain unmodified in `packets_raw`.
