# BLE GATT — ESP32 ↔ Android

Specificația canalului Bluetooth Low Energy între modulul purtabil (ESP32) și aplicația mobilă Android.

**Rol ESP32:** Peripheral (advertiser + GATT server).
**Rol Android:** Central (scanner + GATT client).

---

## Nume advertising

- Prefix: `WH-` (Wearable Health) urmat de ultimele 4 octeți din `sensorKitId` (BLE MAC).
  - Exemplu: `WH-A1B2`.
- Android filtrează scanul după **service UUID** (nu doar nume).

---

## GATT Service și caracteristici

### Service UUID

```
SERVICE_WEARABLE_HEALTH = 0000FF01-0000-1000-8000-00805F9B34FB
```

### Caracteristici

| Caracteristică | UUID | Properties | Direcție | Descriere |
|----------------|------|-----------|----------|-----------|
| `SENSOR_FRAME` | `0000FF02-...` | `NOTIFY` | ESP32 → Android | Trimite un `SensorFrame` serializat, la ~10 s |
| `DEVICE_INFO`  | `0000FF03-...` | `READ` | ESP32 → Android | sensorKitId, firmware version, battery level |
| `CONTROL`      | `0000FF04-...` | `WRITE` | Android → ESP32 | Comenzi: start/stop streaming, setare LED, ping |
| `LEAD_OFF`     | `0000FF05-...` | `NOTIFY` | ESP32 → Android | Flag: electrozii ECG desprinși (eveniment) |

> UUID-urile de mai sus sunt **de referință**. Pot fi înlocuite cu UUID-uri aleatorii generate în proiect, cu condiția să fie consistente între firmware și aplicația Android.

---

## Format payload `SENSOR_FRAME` (NOTIFY)

Dimensiune maximă recomandată: **180 octeți** (pentru MTU BLE 185).

### Layout binar (little-endian)

| Offset | Câmp | Tip | Dimensiune | Observații |
|--------|------|-----|------------|------------|
| 0  | `version`      | `uint8`  | 1 | format versionat (start: `0x01`) |
| 1  | `seqNumber`    | `uint32` | 4 | crescător, reset la reboot |
| 5  | `timestampMs`  | `uint32` | 4 | ms de la boot ESP32 |
| 9  | `heartRateBpm` | `uint16` | 2 | puls (MAX30100) |
| 11 | `spO2Percent`  | `uint8`  | 1 | saturație O2, 0–100 |
| 12 | `humidityX10`  | `uint16` | 2 | umiditate × 10 (ex. 453 → 45.3 %) |
| 14 | `tempCX10`     | `int16`  | 2 | temperatură × 10 (ex. 367 → 36.7 °C) |
| 16 | `ecgCount`     | `uint8`  | 1 | numărul de eșantioane ECG (max 80) |
| 17 | `ecgSamples`   | `uint16[]` | 2 × ecgCount | ADC 10–12 bit pe 16 bit |
| —  | `flags`        | `uint8`  | 1 | bit 0 = leadOff, bit 1 = lowBattery |

Pe 80 eșantioane ECG: 17 + 160 + 1 = **178 octeți** — încape în MTU-ul standard.

### Serializare pe firmware

```cpp
struct __attribute__((packed)) SensorFrameWire {
  uint8_t  version;
  uint32_t seqNumber;
  uint32_t timestampMs;
  uint16_t heartRateBpm;
  uint8_t  spO2Percent;
  uint16_t humidityX10;
  int16_t  tempCX10;
  uint8_t  ecgCount;
  uint16_t ecgSamples[80];
  uint8_t  flags;
};
```

### Deserializare pe Android (Kotlin)

```kotlin
fun parseSensorFrame(bytes: ByteArray): SensorSample {
    val buf = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
    val version = buf.get().toInt() and 0xFF
    val seq     = buf.int
    val tsMs    = buf.int
    val bpm     = buf.short.toInt() and 0xFFFF
    val spo2    = buf.get().toInt() and 0xFF
    val humid   = (buf.short.toInt() and 0xFFFF) / 10.0
    val tempC   = buf.short.toInt() / 10.0
    val ecgN    = buf.get().toInt() and 0xFF
    val ecg     = ShortArray(ecgN) { buf.short }
    val flags   = buf.get().toInt() and 0xFF
    return SensorSample(
        timestamp   = Instant.now(),
        ecgBytes    = ecg.toByteArray(),
        umiditate   = humid.toBigDecimal(),
        temperatura = tempC.toBigDecimal(),
        puls        = bpm,
    )
}
```

---

## Format payload `CONTROL` (WRITE)

| Cod | Cmd | Parametri |
|-----|-----|-----------|
| `0x01` | START_STREAM | – |
| `0x02` | STOP_STREAM  | – |
| `0x03` | SET_LED      | `uint8 irCurrent`, `uint8 redCurrent` |
| `0x04` | PING         | `uint32 nonce` (ESP răspunde cu NOTIFY pe `SENSOR_FRAME` cu flag ping) |
| `0x05` | SYNC_TIME    | `uint32 epochSec` (corectare clock) |

---

## Pairing și legarea de pacient

1. Medicul creează pacient în aplicația web și setează `DeviceBinding.sensorKitId` (PUT `/patients/{id}/device-binding`).
2. La prima pornire a aplicației Android, pacientul autentificat primește `sensorKitId` asociat de la cloud.
3. `BluetoothService.startBluetoothConnection(sensorKitId)`:
   - scanare BLE,
   - filtrează după `SERVICE_WEARABLE_HEALTH` + corelare cu `sensorKitId` (MAC),
   - `connectGatt` + `discoverServices` + `setCharacteristicNotification(SENSOR_FRAME)`.
4. După `CONNECTED`, Android scrie `START_STREAM` pe `CONTROL`.
5. ESP32 trimite `SensorFrame` ~la 10 s prin NOTIFY.

---

## Reziliență

- La pierdere conexiune: Android retry cu **back-off exponențial** (1 s → 2 s → 4 s → … max 60 s).
- ESP32 revine în advertising automat la `onClientDisconnected`.
- Dacă `leadOff == true` pentru mai mult de un ciclu, aplicația Android arată warning UI și **nu** trimite alarmă la cloud (prag fals).
