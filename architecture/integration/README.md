# Integrare — cum se leagă modulele

Acest folder descrie **punctele de contact** între cele patru module proiectate și **sistemele externe**. Definițiile de API per modul rămân în `module1-web/`, `module2-cloud/`, `module3-mobile/`, `module4-esp32/`.

## Fișiere

| Fișier | Conținut |
|--------|----------|
| [`integration-points.puml`](integration-points.puml) | Diagramă — toate granițele de integrare cu protocoale și direcții |
| [`data-flow.puml`](data-flow.puml) | Transformări de date: `SensorFrame` → `SensorSample` → `UplinkBatch` → `MeasurementBatch` |
| [`sequences.puml`](sequences.puml) | Secvențe end-to-end: onboarding, măsurători, alarmă, HL7 inbound, FHIR outbound |
| [`ble-esp32-android.md`](ble-esp32-android.md) | Specificație BLE GATT (UUID-uri, caracteristici, format payload) |

---

## Puncte de integrare — sumar

| # | Perimetru | Protocol | Direcție | Conținut | Frecvență |
|---|-----------|----------|----------|----------|-----------|
| 1 | ESP32 ↔ Android | **BLE GATT** | ESP32 → Android (notify) | `SensorFrame` (puls/SpO2, ECG, umid/temp) | ~10 s |
| 2 | Android ↔ Cloud (ingestie batch) | **HTTPS REST** | Android → Cloud | `UplinkBatch` (agregat 30 s + burst accel) | ~30 s |
| 3 | Android ↔ Cloud (alarmă) | **HTTPS REST** | Android → Cloud | `AlertEvent` (+ text) | asincron, la prag |
| 4 | Android ↔ Cloud (downlink) | **HTTPS REST** | Cloud → Android | `Recommendation[]`, `AlarmRule[]` | la login + periodic |
| 5 | Web ↔ Cloud | **HTTPS REST** | bidirecțional | CRUD fișă, consultații, grafice, rapoarte | sincron, UI |
| 6 | Cloud ↔ MF (intrare) | **HL7 v2** | MF → Cloud | trimitere la specialist | asincron |
| 7 | Cloud ↔ MF (ieșire) | **HL7 FHIR** | Cloud → MF | scrisoare medicală (Bundle R4) | asincron, la finalul consultației |

---

## Autentificare și autorizare

| Perimetru | Schemă |
|-----------|--------|
| Browser / Android → Cloud | **JWT Bearer** obținut prin `POST /auth/login`, reînnoit prin `/auth/refresh` |
| ESP32 ↔ Android | Pairing BLE + `sensorKitId` validat contra `DeviceBinding` stocat în cloud |
| Cloud ↔ MF (HL7 inbound) | mTLS sau API key dedicat pentru endpoint-ul `/integrations/hl7/inbound` |
| Cloud ↔ MF (FHIR outbound) | Bearer token emis de serverul MF (OAuth2 client credentials) |

---

## Idempotență și offline

- `UplinkBatch.batchId` este **cheie de idempotență**: cloud respinge batch-urile deja stocate (`409 Conflict`).
- Dacă telefonul este offline, batch-urile și alarmele sunt salvate local și retrimise la reconectare — funcția `flushOfflineQueueOnConnectivity` din `CloudSyncService`.
- `AlertEvent` are `id` generat client-side (UUID) pentru a evita dublarea.

---

## Observabilitate

- **Application Insights** (Azure) — log + corelare pe `batchId` / `alertId`.
- Audit separat pentru mesaje HL7/FHIR (trace-ul fiecărui mesaj primit/trimis).
- Metrici recomandate: rata de succes ingestie, latență `/ingestion/*`, mărimea cozii offline per `deviceId`.

---

## Compatibilitate cu proiectul echipei celeilalte

Proiectul MF folosește **HL7 v2** pentru trimiterea la specialist și așteaptă **FHIR R4** ca răspuns (scrisoare medicală). Endpoint-urile din `module2-cloud` respectă aceste formate:

- `POST /integrations/hl7/inbound` — acceptă `text/plain` cu mesaj HL7 (segmente `MSH`, `PID`, `PV1`, `RF1`, etc.).
- `POST /integrations/fhir/outbound` — construiește un `Bundle` cu `Composition` + `Patient` + `Practitioner` + `Encounter` + `Observation` + `DocumentReference`.

Detaliile de mapping per câmp sunt în `sequences.puml` (secvențele HL7/FHIR).
