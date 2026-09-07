# Telemetry Packet Format Specification

## 1. Frame Structure

Downlink telemetry frames transmitted by the balloon payload use a compact 32-byte binary format to maximize LoRa range and link budget margin.

```text
+--------+--------+--------+--------+--------+--------+--------+--------+
| Offset | Byte 0 | Byte 1 | Byte 2 | Byte 3 | Byte 4 | Byte 5 | Byte 6 |
+--------+--------+--------+--------+--------+--------+--------+--------+
| 0x00   | Preamble (0xAA 0x55)     | Call ID (4 Bytes)                 |
| 0x06   | Sequence Number (uint16) | UTC Epoch Seconds (uint32)        |
| 0x0C   | Latitude (int32, *1e7)   | Longitude (int32, *1e7)           |
| 0x14   | Altitude (uint16, meters)| Ascent Speed (int16, cm/s)        |
| 0x18   | Pressure (uint16, 0.1hPa)| Ext Temp (int16, 0.1°C)           |
| 0x1C   | Battery (uint8, 0.02V)   | Status Bits (uint8) | CRC-16      |
+--------+--------+--------+--------+--------+--------+--------+--------+
```

---

## 2. Field Definitions

| Offset | Field | Type | Unit / Encoding | Range / Description |
|---|---|---|---|---|
| `0x00` | Preamble | `uint16` | Magic Bytes `0xAA55` | Frame synchronization word. |
| `0x02` | Call ID | `char[4]` | ASCII String | Mission callsign (e.g. `HAB1`). |
| `0x06` | Sequence Index | `uint16_t` | Integer | Monotonically increasing packet counter (0 to 65,535). |
| `0x08` | Timestamp | `uint32_t` | Unix Epoch | UTC timestamp in seconds. |
| `0x0C` | Latitude | `int32_t` | Degrees × 10⁷ | Signed coordinates (-90.0000000 to +90.0000000). |
| `0x10` | Longitude | `int32_t` | Degrees × 10⁷ | Signed coordinates (-180.0000000 to +180.0000000). |
| `0x14` | Altitude | `uint16_t` | Meters | Geometric altitude above MSL (0 to 65,535 m). |
| `0x16` | Ascent Rate | `int16_t` | cm/s | Vertical velocity (-327.68 m/s to +327.67 m/s). |
| `0x18` | Pressure | `uint16_t` | 0.1 hPa | Barometric atmospheric pressure (0 to 6,553.5 hPa). |
| `0x1A` | External Temp | `int16_t` | 0.1 °C | Thermistor reading (-100.0 °C to +100.0 °C). |
| `0x1C` | Battery Voltage | `uint8_t` | 0.02 V | Payload battery level (0.0 V to 5.1 V). |
| `0x1D` | Status Flags | `uint8_t` | Bitfield | Bit 0: GPS Lock, Bit 1: Cutdown Armed, Bit 2: Descent Detected, Bit 3: [Air Intake Door](/guide/glossary#air-intake-door) Open, Bit 4: Air Sampling Active. |
| `0x1E` | Checksum | `uint16_t` | CRC16-CCITT | Polynomial 0x1021 with initial value 0xFFFF. |
