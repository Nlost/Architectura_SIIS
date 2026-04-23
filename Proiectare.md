# Documentație de proiectare — SeniorWatch

**Cod proiect:** MPSAM-2026-AAL-01  
**Denumire comercială:** SeniorWatch – Sistem de Teleasistență la Domiciliu a Persoanelor în Vârstă  
**Client:** Fundația „Bătrânii sunt ai noștri", reprezentant Dr. Ionescu Gheorghe  
**Dată demarare:** 26.03.2026  
**Titulari disciplină:** Prof.dr.ing. Lăcărmioara Stoicu-Tivadar, Prof.dr.ing. Vasile Stoicu-Tivadar, Ș.l.dr.ing. Dorin Berian

> **Obiectivul documentului.** Să furnizeze o descriere tehnică completă a soluției astfel încât (a) munca în echipă să poată fi delimitată univoc pe responsabilități și (b) activitatea de codificare să devină o activitate de rutină — fiecare dezvoltator preia o componentă pe baza descrierii sale și a relațiilor cu componentele „din jur".
>
> Documentul păstrează structura și numerotarea Specificațiilor până la schema-bloc inclusiv, conform principiului uniformității, apoi aprofundează conform capitolelor obligatorii din „Partea a 2-a: Proiectare" (pag. 9–10).

---

## 0) Echipa de proiectare și responsabilitățile de codificare

| Rol | Membru | Componentă atribuită |
|---|---|---|
| Programator-șef | Balan Dan | Backend Cloud (module2-cloud), integrare HL7/FHIR, coordonare tehnică |
| Ajutor programator-șef | Ardelean Marius | Infrastructură Azure, deployment, observabilitate |
| Secretar / Manager | Balan Cristina | Documentație, planificare, avizare |
| Programator | Mathe Alexandra | Firmware ESP32 (module4-esp32) |
| Programator | Morgovan Raluca | Interfață web (module1-web) — partea medic |
| Programator | Nicola Larisa | Interfață web (module1-web) — partea pacient & rapoarte |
| Programator | Cotolan Denisa | Aplicație mobilă Android (module3-mobile) |

Matricea de responsabilități respectă principiul „o componentă → un responsabil principal", cu revizuire încrucișată pe granițele de integrare.

---

## 1) Arhitectura programului

### 1.1 Descriere succintă

SeniorWatch este un sistem distribuit pe **patru straturi fizice** interconectate printr-un **Cloud Azure central**:

```
[ ESP32 + senzori ] --BLE-->  [ Android mobile ] --HTTPS/JWT-->  [ Cloud Azure ]  <--HTTPS/JWT--  [ Web medic ]
                                                                      ^   |
                                                                  HL7 |   | FHIR
                                                                      v   v
                                                               [ Sistem MF extern ]
```

Sistemul urmează un model arhitectural hibrid:

- **Three-tier clasic** pentru componenta Cloud + Web + persistență (prezentare → servicii → date).
- **Event-driven / store-and-forward** pentru fluxul de la senzori (ingestie idempotentă, offline-first pe mobil).
- **Edge computing minimal** pe ESP32 (achiziție + fereastră 10 s, fără logică decizională).

### 1.2 Modele arhitecturale și tehnologii

| Strat | Model arhitectural | Tehnologie | Mediu de dezvoltare |
|---|---|---|---|
| ESP32 | Microcontroller + peripheral BLE (GATT server) | C/C++ (Arduino / ESP-IDF) | PlatformIO / VS Code |
| Android | MVVM + Coordinator | Kotlin, Android SDK, Jetpack (Room, WorkManager), BLE API | Android Studio |
| Cloud | Three-tier (Controller → Service → Repository) | Java Spring Boot / ASP.NET Core, REST, JWT | IntelliJ IDEA / VS 2022 |
| Bază de date | Relațional normalizat | **Azure SQL Database** | Azure Data Studio / SSMS |
| Web | SPA + REST client | React/Angular, TypeScript | VS Code |
| Integrare externă | Message-based | HL7 v2.5 (inbound), FHIR R4 (outbound) | HAPI FHIR / test harness |

### 1.3 Sistem de operare și execuție

| Componentă | OS / runtime | Observații |
|---|---|---|
| ESP32 | FreeRTOS (sub ESP-IDF) | două task-uri: achiziție senzori @ 10 Hz, BLE GATT |
| Android | Android 10+ (API 29+) | foreground service pentru BLE; WorkManager pentru upload |
| Cloud | Linux (Azure App Service) | containerizat; scalare verticală/orizontală configurabilă |
| Web | browser-agnostic | Chrome/Edge/Firefox — versiuni din ultimii 2 ani |

### 1.4 Schema-bloc a arhitecturii (uniformitate cu Specificațiile)

Schema-bloc de ansamblu este preluată din Specificații și actualizată:

- referință: `docs/architecture/overview/system-components.puml`
- deployment: `docs/architecture/overview/azure-deployment.puml`
- secvență principală (măsurare + sincronizare): `docs/architecture/overview/sequence-measurement-sync.puml`

### 1.5 Arborescența dialogurilor (aplicații cu UI)

Pentru **aplicația web (medic)** — diagramă logică a formelor:

```
Login
 └── Dashboard medic
     ├── Listă pacienți
     │   ├── Fișă pacient (Demographics + MedicalRecord)
     │   │   ├── Consultații ICD-10 (listă + detaliu + CRUD)
     │   │   ├── Recomandări (CRUD)
     │   │   ├── Reguli alarmă (CRUD pe AlarmRule)
     │   │   ├── Grafice evoluție (TimeRangeQuery → MeasurementSeries)
     │   │   └── Istoric alarme (AlertEvent)
     │   └── Adăugare pacient nou
     ├── Integrare HL7/FHIR
     │   ├── Referrals primite (Hl7InboundReferral)
     │   └── Scrisori emise (FhirOutboundLetter)
     └── Administrare cont (ChangePasswordRequest)
```

Pentru **aplicația Android (pacient)**:

```
Login pacient
 └── Home
     ├── Status dispozitiv (conectat / deconectat / baterie)
     ├── Ultimele măsurători (puls, SpO2, temperatură)
     ├── Jurnal alarme locale
     ├── Recomandări primite (Recommendation)
     └── Setări (permisiuni BLE, sincronizare)
```

---

## 2) Descrierea componentelor (modulelor)

### 2.1 Șablon unitar de descriere

Toate modulele sunt descrise după următorul șablon, pentru uniformitate:

```
Denumire modul        : <nume tehnic>
Responsabilitate      : <o frază sintetică>
Tehnologie / runtime  : <limbaj + framework + OS>
Intrări               : <surse de date, tipuri DTO>
Prelucrări            : <algoritmi / reguli / transformări>
Ieșiri                : <destinații, tipuri DTO>
Interacțiuni externe  : <alte module / sisteme>
Fișier(e) sursă de referință : <puml / cod>
```

### 2.2 Modulul ESP32 (`module4-esp32`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Achiziție semnale fiziologice și ambientale; emitere cadre BLE la 10 s |
| Tehnologie | C/C++ pe ESP32 (FreeRTOS), BLE GATT server |
| Intrări | Semnal analog ECG, date I²C de la MAX30100 (puls/SpO2), date 1-wire/digitale de la DHT11 (temperatură/umiditate), comenzi BLE pe caracteristica `CONTROL` |
| Prelucrări | Buffer circular ECG (80 eșantioane / fereastră 10 s); calibrare offset; compunerea structurii `SensorFrameWire` (178 octeți) |
| Ieșiri | `SensorFrame` prin NOTIFY pe caracteristica `SENSOR_FRAME`; flag `leadOff` pe `LEAD_OFF` |
| Interacțiuni | Android (BLE GATT central) |
| Referință | `docs/architecture/module4-esp32/api-module4-esp32.puml`, `docs/architecture/integration/ble-esp32-android.md` |

**Sub-componente interne:**
- `SensorTask` — achiziție 10 Hz, agregare fereastră.
- `BleGattTask` — advertising + notificări.
- `ControlHandler` — interpretare comenzi: `START_STREAM`, `STOP_STREAM`, `SET_LED`, `PING`, `SYNC_TIME`.

### 2.3 Modulul mobil Android (`module3-mobile`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Client BLE, agregare 30 s, upload batch la Cloud, alerte locale, offline-first |
| Tehnologie | Kotlin, Android SDK, Jetpack (Room, WorkManager), coroutines |
| Intrări | `SensorFrame` via BLE NOTIFY; `Recommendation[]` și `AlarmRule[]` de la Cloud |
| Prelucrări | (a) conversie `SensorFrame` → `SensorSample`; (b) agregare 3 × 10 s → `UplinkBatch`; (c) evaluare reguli `AlarmRule` local pentru alarme rapide; (d) persistență offline (Room) |
| Ieșiri | `POST /ingestion/batch` cu `UplinkBatch`; `POST /ingestion/alert` cu `AlertEvent`; notificări UI |
| Interacțiuni | ESP32 (BLE), Cloud (HTTPS + JWT) |
| Referință | `docs/architecture/module3-mobile/api-module3-mobile.puml` |

**Servicii interne:**
- `BluetoothService` — pairing, reconectare exponențială, parsing binary frame.
- `SampleAggregator` — fereastră 30 s + burst accelerometru 1 Hz.
- `CloudSyncService` — upload + `flushOfflineQueueOnConnectivity`.
- `AlarmEvaluator` — evaluare locală contra `AlarmRule`.
- `PatientCoordinator` — orchestrator de sesiune.

### 2.4 Modulul Cloud (`module2-cloud`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | API REST central, autentificare, persistență, ingestie idempotentă, HL7/FHIR |
| Tehnologie | Spring Boot / ASP.NET Core, Azure App Service, Azure SQL, JWT Bearer |
| Intrări | Apeluri REST din mobil și web; mesaje HL7 v2 inbound; evenimente FHIR |
| Prelucrări | Autorizare pe roluri (ADMIN/DOCTOR/PATIENT); validare DTO; deduplicare pe `batchId`; generare `AlertEvent`; transformare consultație → `Bundle` FHIR |
| Ieșiri | Răspunsuri REST (`IngestionAck`, `PatientDetail`, `MeasurementSeries` etc.); `Bundle` FHIR outbound către MF |
| Interacțiuni | Web, Android, sistem MF extern |
| Referință | `docs/architecture/module2-cloud/api-module2-cloud.puml`, `docs/architecture/module2-cloud/openapi-cloud.yaml` |

**Controllere principale:** `AuthController`, `PatientsController`, `VisitsController`, `IngestionController`, `AlertsController`, `Hl7Controller`, `FhirController`, `ReportsController`, `AuditController`.

### 2.5 Modulul Web (`module1-web`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Portal medic (și vizualizare pacient): fișă, consultații, grafice, HL7/FHIR |
| Tehnologie | SPA (React/Angular) + TypeScript; comunicare REST cu Cloud |
| Intrări | Input de la medic (formulare); date de la Cloud (`PatientDetail`, `MeasurementSeries`, `AlertEvent`) |
| Prelucrări | Randare consolidată a fișei pacient (`MonitoringController.getConsolidatedPatientView`); căutare ICD-10 (`Icd10LookupService`); renderizare consistentă a alertelor (`ClinicalAlertRenderingService`) |
| Ieșiri | CRUD asupra resurselor pacient; export raport PDF/CSV; trimitere scrisoare FHIR |
| Interacțiuni | Cloud (REST + JWT) |
| Referință | `docs/architecture/module1-web/api-module1-web.puml` |

### 2.6 Modulul „Tipuri partajate" (`shared`)

Nu este un modul runtime ci un contract comun de date (DTO + enum) folosit de toate celelalte module pentru a asigura consistența:

- identitate/auth: `LoginRequest`, `AuthTokens`, `UserRole`;
- pacient: `Demographics`, `MedicalRecord`, `PatientSummary`, `PatientDetail`, `PatientIdentificationHeader`;
- clinic: `ClinicalVisit`, `HealthProblem`, `Allergy`, `Medication`, `Recommendation`;
- senzori: `SensorSample`, `AccelSample`, `AccelerometerBurst`, `UplinkBatch`, `IngestionAck`;
- alarmare: `AlarmRule`, `NormalRangeProfile`, `AlertEvent`, `ClinicalAlertRendering`;
- interop: `Hl7InboundReferral`, `FhirOutboundLetter`;
- versionare & audit: `VersionMetadata`, `HealthItemStatus`, `AuditEvent`.

Referință: `docs/architecture/shared/types-shared.puml`, `docs/architecture/shared/domain-model.puml`.

---

## 3) Descrierea comunicării între module

### 3.1 Șablon unitar pentru canale

```
Canal                 : <perimetru A ↔ B>
Suport fizic / transport : <BLE / HTTPS / TCP / HL7 MLLP>
Protocol              : <GATT / REST / HL7 v2 / FHIR R4>
Direcție              : <A → B / B → A / bidirecțional>
Autentificare         : <JWT / mTLS / pairing BLE>
Format mesaj          : <binar packed / JSON / HL7 ER7 / Bundle>
Frecvență             : <periodic / on-event>
Idempotență / retry   : <cheie + strategie>
Restricții            : <MTU, latență, dimensiuni>
Referință             : <puml / md>
```

### 3.2 Canalele efective din sistem

#### C1. ESP32 ↔ Android (BLE GATT)

| Atribut | Valoare |
|---|---|
| Transport | Bluetooth Low Energy (GATT) |
| Direcție | ESP32 → Android (NOTIFY), Android → ESP32 (WRITE) |
| Autentificare | Pairing BLE + corelare `sensorKitId` cu `DeviceBinding` din Cloud |
| Format | Binar little-endian packed (`SensorFrameWire`, 178 octeți) |
| Frecvență | `SENSOR_FRAME` @ ~10 s; `LEAD_OFF` la eveniment |
| Restricții | MTU ≤ 185 octeți; reconnect cu back-off 1→60 s |
| Referință | `docs/architecture/integration/ble-esp32-android.md` |

**Lista caracteristicilor GATT:**

| Caracteristică | UUID | Properties | Semnificație |
|---|---|---|---|
| `SENSOR_FRAME` | `0000FF02-...` | NOTIFY | cadru măsurători 10 s |
| `DEVICE_INFO` | `0000FF03-...` | READ | id senzor, versiune firmware, baterie |
| `CONTROL` | `0000FF04-...` | WRITE | comenzi de la Android |
| `LEAD_OFF` | `0000FF05-...` | NOTIFY | flag electrozi ECG |

#### C2. Android → Cloud (ingestie batch)

| Atribut | Valoare |
|---|---|
| Transport | HTTPS 1.1 |
| Endpoint | `POST /ingestion/batch` |
| Autentificare | JWT Bearer (`AuthTokens.accessToken`) |
| Corp request | `UplinkBatch` (JSON) |
| Corp response | `IngestionAck` (JSON) |
| Frecvență | ~30 s |
| Idempotență | `UplinkBatch.batchId` unic; re-trimiterile întorc `409 Conflict` tratat ca succes |
| Restricții | payload ≤ 256 KB; timeout client 30 s |

#### C3. Android → Cloud (alarmă)

| Atribut | Valoare |
|---|---|
| Endpoint | `POST /ingestion/alert` |
| Corp | `AlertEvent` (id UUID generat client-side) |
| Prioritate | Asincron imediat la declanșare; latență țintă **< 10 s** |
| Idempotență | `AlertEvent.id` |

#### C4. Cloud → Android (downlink)

| Atribut | Valoare |
|---|---|
| Endpoint | `GET /patients/{id}/alarm-rules`, `GET /patients/{id}/recommendations` |
| Frecvență | la login + periodic (60 min) + la push notification |
| Corp | `AlarmRule[]`, `Recommendation[]` |

#### C5. Web ↔ Cloud (CRUD + vizualizare)

| Atribut | Valoare |
|---|---|
| Transport | HTTPS REST (OpenAPI 3.0) |
| Autentificare | JWT Bearer |
| Exemple | `GET /patients`, `POST /visits`, `GET /reports/measurements?...` |
| Format | JSON |
| Referință | `docs/architecture/module2-cloud/openapi-cloud.yaml` |

#### C6. Cloud ← MF (HL7 v2 inbound — referral)

| Atribut | Valoare |
|---|---|
| Endpoint | `POST /integrations/hl7/inbound` (content-type `text/plain`) |
| Autentificare | mTLS sau API key dedicat |
| Format | Mesaj HL7 v2 ER7 (MSH, PID, PV1, RF1, …) |
| Stocare | `Hl7InboundReferral` |

#### C7. Cloud → MF (FHIR R4 outbound — scrisoare medicală)

| Atribut | Valoare |
|---|---|
| Endpoint | `POST` către serverul MF (URL configurabil) |
| Autentificare | OAuth2 client credentials |
| Format | `Bundle` cu `Composition`, `Patient`, `Practitioner`, `Encounter`, `Observation`, `DocumentReference` |
| Trigger | finalizare consultație în Web |
| Stocare | `FhirOutboundLetter` (bundleJson) |

### 3.3 Harta integrată a canalelor

Referință: `docs/architecture/integration/integration-points.puml` și `docs/architecture/integration/sequences.puml` (onboarding, măsurători, alarmă, HL7, FHIR).

---

## 4) Structuri de baze de date și fișiere

### 4.1 Schema generală (logică)

Baza de date relațională (Azure SQL) este organizată în grupe tematice:

1. **Securitate & audit:** `users`, `roles`, `role_assignments`, `permissions`, `audit_events`.
2. **Pacient & demografie:** `patients`, `demographics`, `medical_records`, `patient_identification`.
3. **Clinic:** `clinical_visits`, `health_problems`, `allergies`, `medications`, `recommendations`.
4. **Dispozitive & reguli:** `device_bindings`, `alarm_rules`, `normal_range_profiles`.
5. **Măsurători:** `measurement_batches`, `sensor_samples`, `accel_bursts`, `accel_samples`.
6. **Alarme:** `alert_events`.
7. **Interoperabilitate:** `hl7_inbound_referrals`, `fhir_outbound_letters`.
8. **Versionare transversală:** coloane `version_*` pe toate entitățile „health item" (+ opțional tabel `version_history`).

Diagrama ER de referință: `docs/architecture/shared/domain-model.puml`.

### 4.2 Definiții de câmp (extras, tabele principale)

#### `patients`
| Câmp | Tip | Lungime | Restricții | Semnificație |
|---|---|---|---|---|
| `id` | UNIQUEIDENTIFIER | 16 | PK, NOT NULL | identificator pacient |
| `doctor_id` | UNIQUEIDENTIFIER | 16 | FK → `users.id`, NOT NULL | medic asignat |
| `active` | BIT | 1 | NOT NULL, default 1 | status logic |
| `created_at` | DATETIME2 | 8 | NOT NULL | auditabil |

#### `demographics`
| Câmp | Tip | Lungime | Restricții | Semnificație |
|---|---|---|---|---|
| `patient_id` | UNIQUEIDENTIFIER | 16 | PK, FK → `patients.id` | 1:1 cu `patients` |
| `nume` | NVARCHAR | 80 | NOT NULL | |
| `prenume` | NVARCHAR | 80 | NOT NULL | |
| `sex` | CHAR | 1 | CHECK IN ('M','F','O') | EuroRec 2 |
| `data_nasterii` | DATE | 3 | NOT NULL | |
| `cnp` | CHAR | 13 | UNIQUE, INDEX | identificator național |
| `strada`, `localitate`, `judet`, `cod_postal`, `tara` | NVARCHAR | 80 | — | adresă structurată |
| `telefon` | VARCHAR | 20 | — | |
| `email` | VARCHAR | 120 | INDEX | |
| `profesie`, `loc_de_munca` | NVARCHAR | 120 | — | |

#### `clinical_visits`
| Câmp | Tip | Restricții | Semnificație |
|---|---|---|---|
| `id` | UNIQUEIDENTIFIER | PK | |
| `patient_id` | UNIQUEIDENTIFIER | FK → `patients.id`, INDEX | |
| `visited_at` | DATETIME2 | NOT NULL, INDEX | |
| `motiv_prezentare` | NVARCHAR(500) | — | |
| `simptome` | NVARCHAR(MAX) | — | |
| `diagnostic_icd10_code` | VARCHAR(10) | INDEX | EuroRec 8 |
| `diagnostic_icd10_display` | NVARCHAR(200) | — | |
| `trimiteri` | NVARCHAR(MAX) | — | |
| `version_id` | UNIQUEIDENTIFIER | UNIQUE, NOT NULL | EuroRec 32 |
| `previous_version_id` | UNIQUEIDENTIFIER | — | EuroRec 5,6,7 |
| `status` | VARCHAR(20) | CHECK IN (`ACTIVE`,`ARCHIVED`,…) | |

#### `alarm_rules`
| Câmp | Tip | Restricții |
|---|---|---|
| `id` | UNIQUEIDENTIFIER | PK |
| `patient_id` | UNIQUEIDENTIFIER | FK, INDEX |
| `parametru` | VARCHAR(16) | CHECK IN (`ECG`,`UMIDITATE`,`TEMPERATURA`,`PULS`) |
| `prag_min` | DECIMAL(10,2) | NOT NULL |
| `prag_max` | DECIMAL(10,2) | NOT NULL, CHECK `prag_max > prag_min` |
| `durata_persistenta_sec` | INT | ≥ 0 |
| `interval_debut_activitate_sec` | INT | ≥ 0 |

#### `measurement_batches`
| Câmp | Tip | Restricții |
|---|---|---|
| `batch_id` | VARCHAR(64) | PK — cheie de idempotență |
| `patient_id` | UNIQUEIDENTIFIER | FK, INDEX |
| `device_id` | VARCHAR(64) | FK → `device_bindings.sensor_kit_id` |
| `interval_start` | DATETIME2 | NOT NULL, INDEX |
| `interval_end` | DATETIME2 | NOT NULL |

#### `sensor_samples`
| Câmp | Tip | Restricții |
|---|---|---|
| `id` | BIGINT IDENTITY | PK |
| `batch_id` | VARCHAR(64) | FK → `measurement_batches.batch_id` |
| `ts` | DATETIME2(3) | NOT NULL, INDEX |
| `puls` | SMALLINT | 0–300 |
| `spo2` | TINYINT | 0–100 |
| `temperatura` | DECIMAL(4,1) | |
| `umiditate` | DECIMAL(4,1) | |
| `ecg_blob` | VARBINARY(MAX) | opțional (stocare ECG 10 s) |

#### `alert_events`
| Câmp | Tip | Restricții |
|---|---|---|
| `id` | UNIQUEIDENTIFIER | PK — generat client-side (idempotență) |
| `patient_id` | UNIQUEIDENTIFIER | FK, INDEX |
| `rule_id` | UNIQUEIDENTIFIER | FK → `alarm_rules.id` |
| `triggered_at` | DATETIME2 | NOT NULL, INDEX |
| `severitate` | VARCHAR(16) | CHECK IN (`WARNING`,`CRITICAL`) |
| `text_pacient` | NVARCHAR(500) | — |

#### `hl7_inbound_referrals` / `fhir_outbound_letters`
Stochează mesajul integral (`raw_message` / `bundle_json`) + metadate (trimis la, status, id pacient asociat) — pentru audit și reprocesare.

#### `audit_events` (append-only)
| Câmp | Tip | Restricții |
|---|---|---|
| `id` | BIGINT IDENTITY | PK |
| `occurred_at` | DATETIME2 | NOT NULL, INDEX |
| `user_id` | UNIQUEIDENTIFIER | FK → `users.id` |
| `event_type` | VARCHAR(32) | CHECK IN (`LOGIN`,`READ`,`CREATE`,`UPDATE`,`DELETE`,…) |
| `resource` | VARCHAR(120) | |
| `resource_id` | UNIQUEIDENTIFIER | |
| `client_ip` | VARCHAR(45) | |
| `outcome` | VARCHAR(16) | `SUCCESS` / `DENIED` |

> Tabela `audit_events` este **strict append-only** (EuroRec 28): `UPDATE` și `DELETE` sunt blocate la nivel de rol DB.

### 4.3 Legături între tabele (relații principale)

- `demographics.patient_id → patients.id` (1:1)
- `medical_records.patient_id → patients.id` (1:1)
- `device_bindings.patient_id → patients.id` (1:1, opțional)
- `clinical_visits.patient_id → patients.id` (1:N)
- `alarm_rules.patient_id → patients.id` (1:N)
- `measurement_batches.patient_id → patients.id` (1:N)
- `sensor_samples.batch_id → measurement_batches.batch_id` (1:N)
- `alert_events.patient_id → patients.id` (1:N)
- `alert_events.rule_id → alarm_rules.id` (N:1)
- `role_assignments.user_id → users.id` (1:N)

### 4.4 Indecși recomandați

| Tabel | Index | Tip | Motivație |
|---|---|---|---|
| `sensor_samples` | `(batch_id, ts)` | CLUSTERED | interogări pe intervale de timp |
| `sensor_samples` | `(patient_id proiectat prin batch, ts)` | acoperitor | grafice evoluție |
| `alert_events` | `(patient_id, triggered_at DESC)` | nonclustered | „ultimele alarme" |
| `clinical_visits` | `(patient_id, visited_at DESC)` | nonclustered | fișa consolidată |
| `audit_events` | `(occurred_at)` | nonclustered | rapoarte audit |
| `demographics` | `cnp` | UNIQUE | identificare rapidă |

### 4.5 Drepturi de acces (nivel rol DB)

| Rol DB | Tabele | Operațiuni |
|---|---|---|
| `app_doctor` | toate tabelele pacienți/consultații | SELECT, INSERT, UPDATE (WHERE `doctor_id = @me`) |
| `app_patient` | `measurement_batches`, `alert_events` proprii | SELECT doar pe `patient_id = @me` |
| `app_ingestion` | `measurement_batches`, `sensor_samples`, `alert_events` | INSERT; UPDATE doar pe ACK |
| `app_auditor` | `audit_events` | SELECT |

### 4.6 Normalizare

- Schema este normalizată până la **3FN**:
  - atributele non-cheie depind exclusiv de cheia primară (1FN, 2FN);
  - nu există dependențe tranzitive (3FN): adresa este parte a `demographics` pentru că identifică pacientul, nu o entitate externă;
  - `CodedValue` (system/code/display) este denormalizat controlat pe `clinical_visits` din motive de istoric clinic (valorile cod nu trebuie să se schimbe odată cu update-ul dicționarului ICD-10).
- `sensor_samples` este menținut **flat** pentru performanță la interogări de serii temporale; denormalizarea este documentată și izolată.

### 4.7 Fișiere și stocare în afara bazei de date

| Conținut | Tip stocare | Format |
|---|---|---|
| `raw_message` HL7 inbound | coloană `NVARCHAR(MAX)` + opțional Azure Blob pentru arhivă | text ER7 |
| `bundle_json` FHIR outbound | coloană `NVARCHAR(MAX)` | JSON |
| rapoarte generate (PDF/CSV) | Azure Blob Storage, container `reports/` | PDF / CSV |
| log-uri tehnice | Azure Application Insights | structurat |

---

## 5) Trasabilitate specificații → proiectare

| Cerință din Specificații | Acoperire în proiectare |
|---|---|
| Monitorizarea parametrilor (ECG, puls, temp., umiditate) | §2.2 (ESP32) + §3.2/C1 + §4.2 (`sensor_samples`) |
| Gestionarea alertelor < 10 s | §2.3 (AlarmEvaluator local) + §3.2/C3 + §4.2 (`alert_events`) |
| Administrarea pacienților (ICD-10) | §2.5 (Web) + §4.2 (`clinical_visits`) |
| Comunicare HL7 / FHIR | §3.2/C6–C7 + §4.2 (`hl7_inbound_referrals`, `fhir_outbound_letters`) |
| Offline + sincronizare | §2.3 (Room + WorkManager) + §3.2/C2 (idempotență) |
| Securitate GDPR, roluri | §1.2 (JWT), §4.5 (roluri DB), §4.2 (`audit_events`) |
| Restricție ESP32 — Bluetooth exclusiv | §3.2/C1 |

---

## 6) Referințe

- `Proiect AEH-MPSAM-DASDM 2025.pdf` — pag. 9–10 (structura obligatorie a documentației de proiectare).
- `Specificatii_draft_grupa1echipa2.pdf` — cerințele funcționale, nefuncționale, actori, SWOT.
- `docs/architecture/README.md` — sinteză arhitecturală și mapare module.
- `docs/architecture/overview/system-components.puml`, `azure-deployment.puml`, `sequence-measurement-sync.puml`.
- `docs/architecture/shared/types-shared.puml`, `shared/domain-model.puml`.
- `docs/architecture/module1-web/…`, `module2-cloud/…`, `module3-mobile/…`, `module4-esp32/…`.
- `docs/architecture/integration/README.md`, `integration-points.puml`, `data-flow.puml`, `sequences.puml`, `ble-esp32-android.md`.
- `docs/architecture/module2-cloud/openapi-cloud.yaml` — contractul REST complet.
- `docs/architecture/index.html` — vizualizare unificată a diagramelor pentru prezentare.
