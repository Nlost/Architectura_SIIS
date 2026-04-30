---
title: "Documentatie de proiectare - SeniorWatch"
subtitle: "Sistem de Teleasistenta la Domiciliu a Persoanelor in Varsta"
author:
  - "Echipa proiect MPSAM-2026-AAL-01"
date: "30.04.2026"
lang: "ro-RO"
toc: true
toc-depth: 3
numbersections: true
mainfont: "DejaVu Serif"
sansfont: "DejaVu Sans"
monofont: "DejaVu Sans Mono"
---

# Documentatie de proiectare - SeniorWatch

**Cod proiect:** MPSAM-2026-AAL-01  
**Denumire comercială:** SeniorWatch – Sistem de Teleasistență la Domiciliu a Persoanelor în Vârstă  
**Client:** Fundația „Bătrânii sunt ai noștri", reprezentant Dr. Ionescu Gheorghe  
**Dată demarare:** 26.03.2026  
**Titulari disciplină:** Prof.dr.ing. Lăcărmioara Stoicu-Tivadar, Prof.dr.ing. Vasile Stoicu-Tivadar, Ș.l.dr.ing. Dorin Berian

> **Obiectivul documentului.** Să furnizeze o descriere tehnică completă a soluției astfel încât (a) munca în echipă să poată fi delimitată univoc pe responsabilități și (b) activitatea de codificare să devină o activitate de rutină — fiecare dezvoltator preia o componentă pe baza descrierii sale și a relațiilor cu componentele „din jur".
>
> Documentul păstrează structura și numerotarea Specificațiilor până la schema-bloc inclusiv, conform principiului uniformității, apoi aprofundează conform capitolelor obligatorii din „Partea a 2-a: Proiectare" (pag. 9–10).

***

## Echipa de proiectare și responsabilitățile de codificare

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

***
\newpage

## Arhitectura programului

### Descriere succintă

SeniorWatch este un sistem distribuit pe **patru straturi fizice** interconectate printr-un **Cloud Azure central**.

Fluxuri principale:

| Sursă | Destinație | Protocol / canal | Scop |
|---|---|---|---|
| ESP32 + senzori | Android mobil | BLE (GATT) | transmisie cadre de măsurători |
| Android mobil | Cloud Azure | HTTPS + JWT | upload batch măsurători, alarme |
| Web medic | Cloud Azure | HTTPS + JWT | vizualizare și management clinic |
| Cloud Azure | Sistem MF extern | FHIR R4 | scrisori medicale outbound |
| Sistem MF extern | Cloud Azure | HL7 v2.5 | referral inbound |

Topologie logică (rezumat):

- Lanțul operațional principal: ESP32 + senzori -> Android mobil -> Cloud Azure.
- Interfața medicală: Web medic <-> Cloud Azure (acces securizat cu JWT).
- Interoperabilitate externă: Cloud Azure <-> Sistem MF extern prin HL7 v2.5 / FHIR R4.

Sistemul urmează un model arhitectural hibrid:

- **Three-tier clasic** pentru componenta Cloud + Web + persistență (prezentare → servicii → date).
- **Event-driven / store-and-forward** pentru fluxul de la senzori (ingestie idempotentă, offline-first pe mobil).
- **Edge computing minimal** pe ESP32 (achiziție + fereastră 10 s, fără logică decizională).

### Modele arhitecturale și tehnologii

| Strat | Model arhitectural | Tehnologie | Mediu de dezvoltare |
|---|---|---|---|
| ESP32 | Microcontroller + peripheral BLE (GATT server) | C/C++ (Arduino / ESP-IDF) | PlatformIO / VS Code |
| Android | MVVM + Coordinator | Kotlin, Android SDK, Jetpack (Room, WorkManager), BLE API | Android Studio |
| Cloud | Three-tier (Controller → Service → Repository) | Java Spring Boot / ASP.NET Core, REST, JWT | IntelliJ IDEA / VS 2022 |
| Bază de date | Relațional normalizat | **Azure SQL Database** | Azure Data Studio / SSMS |
| Web | SPA + REST client | React/Angular, TypeScript | VS Code |
| Integrare externă | Message-based | HL7 v2.5 (inbound), FHIR R4 (outbound) | HAPI FHIR / test harness |

### Sistem de operare și execuție

| Componentă | OS / runtime | Observații |
|---|---|---|
| ESP32 | FreeRTOS (sub ESP-IDF) | două task-uri: achiziție senzori @ 10 Hz, BLE GATT |
| Android | Android 10+ (API 29+) | foreground service pentru BLE; WorkManager pentru upload |
| Cloud | Linux (Azure App Service) | containerizat; scalare verticală/orizontală configurabilă |
| Web | browser-agnostic | Chrome/Edge/Firefox — versiuni din ultimii 2 ani |

### Schema-bloc a arhitecturii (uniformitate cu Specificațiile)

Schema-bloc de ansamblu (inclusă direct în acest document):

```text
                     +--------------------------------+
                     |         Cloud Azure            |
                     |  Auth | Ingestion | Alerts     |
                     |  Patients | Visits | Reports   |
                     +----------------+---------------+
                                      ^
                                      | HTTPS + JWT
+--------------------+                |
|   Web medic/pac.   |----------------+
|   SPA TypeScript   |
+--------------------+

+--------------------+      BLE GATT      +--------------------+
|   ESP32 + senzori  |<------------------>|  Android pacient   |
| ECG, SpO2, temp.   |                    | upload + offline   |
+--------------------+                    +---------+----------+
                                                    |
                                                    | HTTPS + JWT
                                                    v
                                           +--------------------+
                                           |    Cloud Azure     |
                                           +---------+----------+
                                                     |
                                                     | HL7 v2 / FHIR R4
                                                     v
                                           +--------------------+
                                           | Sistem MF extern   |
                                           +--------------------+
```

### Arborescența dialogurilor (aplicații cu UI)

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

***
\newpage

## Descrierea componentelor (modulelor)

### Șablon unitar de descriere

Toate modulele sunt descrise după următorul șablon, pentru uniformitate:

```
Denumire modul        : <nume tehnic>
Responsabilitate      : <o frază sintetică>
Tehnologie / runtime  : <limbaj + framework + OS>
Intrări               : <surse de date, tipuri DTO>
Prelucrări            : <algoritmi / reguli / transformări>
Ieșiri                : <destinații, tipuri DTO>
Interacțiuni externe  : <alte module / sisteme>
Referință documentară   : <descriere inclusă în document>
```

### Modulul ESP32 (`module4-esp32`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Achiziție semnale fiziologice și ambientale; emitere cadre BLE la 10 s |
| Tehnologie | C/C++ pe ESP32 (FreeRTOS), BLE GATT server |
| Intrări | Semnal analog ECG, date I²C de la MAX30100 (puls/SpO2), date 1-wire/digitale de la DHT11 (temperatură/umiditate), comenzi BLE pe caracteristica CONTROL |
| Prelucrări | Buffer circular ECG (80 eșantioane / fereastră 10 s); calibrare offset; compunerea structurii SensorFrameWire (178 octeți) |
| Ieșiri | SensorFrame prin NOTIFY pe caracteristica SENSOR_FRAME; flag leadOff pe LEAD_OFF |
| Interacțiuni | Android (BLE GATT central) |
| Referință | Descriere tehnică inclusă în prezentul document |

**Sub-componente interne:**
- `SensorTask` — achiziție 10 Hz, agregare fereastră.
- `BleGattTask` — advertising + notificări.
- `ControlHandler` — interpretare comenzi: `START_STREAM`, `STOP_STREAM`, `SET_LED`, `PING`, `SYNC_TIME`.

### Modulul mobil Android (`module3-mobile`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Client BLE, agregare 30 s, upload batch la Cloud, alerte locale, offline-first |
| Tehnologie | Kotlin, Android SDK, Jetpack (Room, WorkManager), coroutines |
| Intrări | SensorFrame via BLE NOTIFY; Recommendation[] și AlarmRule[] de la Cloud |
| Prelucrări | (a) conversie SensorFrame → SensorSample; (b) agregare 3 × 10 s → UplinkBatch; (c) evaluare reguli AlarmRule local pentru alarme rapide; (d) persistență offline (Room) |
| Ieșiri | POST /ingestion/batch cu UplinkBatch; POST /ingestion/alert cu AlertEvent; notificări UI |
| Interacțiuni | ESP32 (BLE), Cloud (HTTPS + JWT) |
| Referință | Descriere tehnică inclusă în prezentul document |

**Servicii interne:**
- `BluetoothService` — pairing, reconectare exponențială, parsing binary frame.
- `SampleAggregator` — fereastră 30 s + burst accelerometru 1 Hz.
- `CloudSyncService` — upload + `flushOfflineQueueOnConnectivity`.
- `AlarmEvaluator` — evaluare locală contra `AlarmRule`.
- `PatientCoordinator` — orchestrator de sesiune.

### Modulul Cloud (`module2-cloud`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | API REST central, autentificare, persistență, ingestie idempotentă, HL7/FHIR |
| Tehnologie | Spring Boot / ASP.NET Core, Azure App Service, Azure SQL, JWT Bearer |
| Intrări | Apeluri REST din mobil și web; mesaje HL7 v2 inbound; evenimente FHIR |
| Prelucrări | Autorizare pe roluri (ADMIN/DOCTOR/PATIENT); validare DTO; deduplicare pe batchId; generare AlertEvent; transformare consultație → Bundle FHIR |
| Ieșiri | Răspunsuri REST (IngestionAck, PatientDetail, MeasurementSeries etc.); Bundle FHIR outbound către MF |
| Interacțiuni | Web, Android, sistem MF extern |
| Referință | Descriere tehnică inclusă în prezentul document |

**Controllere principale:** `AuthController`, `PatientsController`, `VisitsController`, `IngestionController`, `AlertsController`, `Hl7Controller`, `FhirController`, `ReportsController`, `AuditController`.

### Modulul Web (`module1-web`)

| Atribut | Valoare |
|---|---|
| Responsabilitate | Portal medic (și vizualizare pacient): fișă, consultații, grafice, HL7/FHIR |
| Tehnologie | SPA (React/Angular) + TypeScript; comunicare REST cu Cloud |
| Intrări | Input de la medic (formulare); date de la Cloud (PatientDetail, MeasurementSeries, AlertEvent) |
| Prelucrări | Randare consolidată a fișei pacient (MonitoringController.getConsolidatedPatientView); căutare ICD-10 (Icd10LookupService); renderizare consistentă a alertelor (ClinicalAlertRenderingService) |
| Ieșiri | CRUD asupra resurselor pacient; export raport PDF/CSV; trimitere scrisoare FHIR |
| Interacțiuni | Cloud (REST + JWT) |
| Referință | Descriere tehnică inclusă în prezentul document |

### Modulul „Tipuri partajate" (`shared`)

Nu este un modul runtime ci un contract comun de date (DTO + enum) folosit de toate celelalte module pentru a asigura consistența:

- identitate/auth: `LoginRequest`, `AuthTokens`, `UserRole`;
- pacient: `Demographics`, `MedicalRecord`, `PatientSummary`, `PatientDetail`, `PatientIdentificationHeader`;
- clinic: `ClinicalVisit`, `HealthProblem`, `Allergy`, `Medication`, `Recommendation`;
- senzori: `SensorSample`, `AccelSample`, `AccelerometerBurst`, `UplinkBatch`, `IngestionAck`;
- alarmare: `AlarmRule`, `NormalRangeProfile`, `AlertEvent`, `ClinicalAlertRendering`;
- interop: `Hl7InboundReferral`, `FhirOutboundLetter`;
- versionare & audit: `VersionMetadata`, `HealthItemStatus`, `AuditEvent`.

Referință: modelul de date și tipurile partajate sunt descrise integral în secțiunile 2-4 ale acestui document.

***
\newpage

## Descrierea comunicării între module

### Șablon unitar pentru canale

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
Referință             : <descriere inclusă în document>
```

### Canalele efective din sistem

#### C1. ESP32 ↔ Android (BLE GATT)

| Atribut | Valoare |
|---|---|
| Transport | Bluetooth Low Energy (GATT) |
| Direcție | ESP32 → Android (NOTIFY), Android → ESP32 (WRITE) |
| Autentificare | Pairing BLE + corelare sensorKitId cu DeviceBinding din Cloud |
| Format | Binar little-endian packed (SensorFrameWire, 178 octeți) |
| Frecvență | SENSOR_FRAME @ ~10 s; LEAD_OFF la eveniment |
| Restricții | MTU ≤ 185 octeți; reconnect cu back-off 1→60 s |
| Referință | Specificație de canal inclusă în secțiunea curentă |

**Lista caracteristicilor GATT:**

| Caracteristică | UUID | Properties | Semnificație |
|---|---|---|---|
| SENSOR_FRAME | 0000FF02-... | NOTIFY | cadru măsurători 10 s |
| DEVICE_INFO | 0000FF03-... | READ | id senzor, versiune firmware, baterie |
| CONTROL | 0000FF04-... | WRITE | comenzi de la Android |
| LEAD_OFF | 0000FF05-... | NOTIFY | flag electrozi ECG |

#### C2. Android → Cloud (ingestie batch)

| Atribut | Valoare |
|---|---|
| Transport | HTTPS 1.1 |
| Endpoint | POST /ingestion/batch |
| Autentificare | JWT Bearer (AuthTokens.accessToken) |
| Corp request | UplinkBatch (JSON) |
| Corp response | IngestionAck (JSON) |
| Frecvență | ~30 s |
| Idempotență | UplinkBatch.batchId unic; re-trimiterile întorc 409 Conflict tratat ca succes |
| Restricții | payload ≤ 256 KB; timeout client 30 s |

#### C3. Android → Cloud (alarmă)

| Atribut | Valoare |
|---|---|
| Endpoint | POST /ingestion/alert |
| Corp | AlertEvent (id UUID generat client-side) |
| Prioritate | Asincron imediat la declanșare; latență țintă **< 10 s** |
| Idempotență | AlertEvent.id |

#### C4. Cloud → Android (downlink)

| Atribut | Valoare |
|---|---|
| Endpoint | GET /patients/{id}/alarm-rules, GET /patients/{id}/recommendations |
| Frecvență | la login + periodic (60 min) + la push notification |
| Corp | AlarmRule[], Recommendation[] |

#### C5. Web ↔ Cloud (CRUD + vizualizare)

| Atribut | Valoare |
|---|---|
| Transport | HTTPS REST (OpenAPI 3.0) |
| Autentificare | JWT Bearer |
| Exemple | GET /patients, POST /visits, GET /reports/measurements?... |
| Format | JSON |
| Referință | Contract API sintetizat în secțiunea curentă |

#### C6. Cloud ← MF (HL7 v2 inbound — referral)

| Atribut | Valoare |
|---|---|
| Endpoint | POST /integrations/hl7/inbound (content-type text/plain) |
| Autentificare | mTLS sau API key dedicat |
| Format | Mesaj HL7 v2 ER7 (MSH, PID, PV1, RF1, …) |
| Stocare | Hl7InboundReferral |

#### C7. Cloud → MF (FHIR R4 outbound — scrisoare medicală)

| Atribut | Valoare |
|---|---|
| Endpoint | POST către serverul MF (URL configurabil) |
| Autentificare | OAuth2 client credentials |
| Format | Bundle cu Composition, Patient, Practitioner, Encounter, Observation, DocumentReference |
| Trigger | finalizare consultație în Web |
| Stocare | FhirOutboundLetter (bundleJson) |

### Harta integrată a canalelor

Schemă integrată a canalelor (inclusă direct):

```text
[ESP32] --(C1 BLE/GATT, 10s frame)--> [Android]
   ^                                      |
   |<-------- comenzi CONTROL ------------|

[Android] --(C2 HTTPS POST /ingestion/batch)--> [Cloud]
[Android] --(C3 HTTPS POST /ingestion/alert)--> [Cloud]
[Cloud]   --(C4 HTTPS GET rules/recommendations)--> [Android]

[Web] <----(C5 HTTPS REST CRUD + rapoarte)----> [Cloud]

[Sistem MF] --(C6 HL7 v2 inbound referral)--> [Cloud]
[Cloud]     --(C7 FHIR R4 outbound letter)--> [Sistem MF]
```

***
\newpage

## Structuri de baze de date și fișiere

### Schema generală (logică)

Baza de date relațională (Azure SQL) este organizată în grupe tematice:

1. **Securitate & audit:** `users`, `roles`, `role_assignments`, `permissions`, `audit_events`.
2. **Pacient & demografie:** `patients`, `demographics`, `medical_records`, `patient_identification`.
3. **Clinic:** `clinical_visits`, `health_problems`, `allergies`, `medications`, `recommendations`.
4. **Dispozitive & reguli:** `device_bindings`, `alarm_rules`, `normal_range_profiles`.
5. **Măsurători:** `measurement_batches`, `sensor_samples`, `accel_bursts`, `accel_samples`.
6. **Alarme:** `alert_events`.
7. **Interoperabilitate:** `hl7_inbound_referrals`, `fhir_outbound_letters`.
8. **Versionare transversală:** coloane `version_*` pe toate entitățile „health item" (+ opțional tabel `version_history`).

Diagramă ER logică (inclusă direct):

```text
users (1) -----< role_assignments >----- (1) roles
  |
  +--< audit_events

patients (1) -- (1) demographics
patients (1) -- (1) medical_records
patients (1) --< clinical_visits
patients (1) --< alarm_rules
patients (1) --< measurement_batches --< sensor_samples
patients (1) --< alert_events >-- (1) alarm_rules
patients (1) --< recommendations

patients (1) --< hl7_inbound_referrals
patients (1) --< fhir_outbound_letters
```

### Definiții de câmp (extras, tabele principale)

#### `patients`

Câmpuri:
- Câmp: id; Tip: UNIQUEIDENTIFIER; Lungime: 16; Restricții: PK, NOT NULL; Semnificație: identificator pacient
- Câmp: doctor_id; Tip: UNIQUEIDENTIFIER; Lungime: 16; Restricții: FK → users.id, NOT NULL; Semnificație: medic asignat
- Câmp: active; Tip: BIT; Lungime: 1; Restricții: NOT NULL, default 1; Semnificație: status logic
- Câmp: created_at; Tip: DATETIME2; Lungime: 8; Restricții: NOT NULL; Semnificație: auditabil


#### `demographics`

Câmpuri:
- Câmp: patient_id; Tip: UNIQUEIDENTIFIER; Lungime: 16; Restricții: PK, FK → patients.id; Semnificație: 1:1 cu patients
- Câmp: nume; Tip: NVARCHAR; Lungime: 80; Restricții: NOT NULL
- Câmp: prenume; Tip: NVARCHAR; Lungime: 80; Restricții: NOT NULL
- Câmp: sex; Tip: CHAR; Lungime: 1; Restricții: CHECK IN ('M','F','O'); Semnificație: EuroRec 2
- Câmp: data_nasterii; Tip: DATE; Lungime: 3; Restricții: NOT NULL
- Câmp: cnp; Tip: CHAR; Lungime: 13; Restricții: UNIQUE, INDEX; Semnificație: identificator național
- Câmp: strada, localitate, judet, cod_postal, tara; Tip: NVARCHAR; Lungime: 80; Restricții: —; Semnificație: adresă structurată
- Câmp: telefon; Tip: VARCHAR; Lungime: 20; Restricții: —
- Câmp: email; Tip: VARCHAR; Lungime: 120; Restricții: INDEX
- Câmp: profesie, loc_de_munca; Tip: NVARCHAR; Lungime: 120; Restricții: —


#### `clinical_visits`

Câmpuri:
- Câmp: id; Tip: UNIQUEIDENTIFIER; Restricții: PK
- Câmp: patient_id; Tip: UNIQUEIDENTIFIER; Restricții: FK → patients.id, INDEX
- Câmp: visited_at; Tip: DATETIME2; Restricții: NOT NULL, INDEX
- Câmp: motiv_prezentare; Tip: NVARCHAR(500); Restricții: —
- Câmp: simptome; Tip: NVARCHAR(MAX); Restricții: —
- Câmp: diagnostic_icd10_code; Tip: VARCHAR(10); Restricții: INDEX; Semnificație: EuroRec 8
- Câmp: diagnostic_icd10_display; Tip: NVARCHAR(200); Restricții: —
- Câmp: trimiteri; Tip: NVARCHAR(MAX); Restricții: —
- Câmp: version_id; Tip: UNIQUEIDENTIFIER; Restricții: UNIQUE, NOT NULL; Semnificație: EuroRec 32
- Câmp: previous_version_id; Tip: UNIQUEIDENTIFIER; Restricții: —; Semnificație: EuroRec 5,6,7
- Câmp: status; Tip: VARCHAR(20); Restricții: CHECK IN (ACTIVE,ARCHIVED,…)


#### `alarm_rules`

Câmpuri:
- Câmp: id; Tip: UNIQUEIDENTIFIER; Restricții: PK
- Câmp: patient_id; Tip: UNIQUEIDENTIFIER; Restricții: FK, INDEX
- Câmp: parametru; Tip: VARCHAR(16); Restricții: CHECK IN (ECG,UMIDITATE,TEMPERATURA,PULS)
- Câmp: prag_min; Tip: DECIMAL(10,2); Restricții: NOT NULL
- Câmp: prag_max; Tip: DECIMAL(10,2); Restricții: NOT NULL, CHECK prag_max > prag_min
- Câmp: durata_persistenta_sec; Tip: INT; Restricții: ≥ 0
- Câmp: interval_debut_activitate_sec; Tip: INT; Restricții: ≥ 0


#### `measurement_batches`

Câmpuri:
- Câmp: batch_id; Tip: VARCHAR(64); Restricții: PK — cheie de idempotență
- Câmp: patient_id; Tip: UNIQUEIDENTIFIER; Restricții: FK, INDEX
- Câmp: device_id; Tip: VARCHAR(64); Restricții: FK → device_bindings.sensor_kit_id
- Câmp: interval_start; Tip: DATETIME2; Restricții: NOT NULL, INDEX
- Câmp: interval_end; Tip: DATETIME2; Restricții: NOT NULL


#### `sensor_samples`

Câmpuri:
- Câmp: id; Tip: BIGINT IDENTITY; Restricții: PK
- Câmp: batch_id; Tip: VARCHAR(64); Restricții: FK → measurement_batches.batch_id
- Câmp: ts; Tip: DATETIME2(3); Restricții: NOT NULL, INDEX
- Câmp: puls; Tip: SMALLINT; Restricții: 0–300
- Câmp: spo2; Tip: TINYINT; Restricții: 0–100
- Câmp: temperatura; Tip: DECIMAL(4,1)
- Câmp: umiditate; Tip: DECIMAL(4,1)
- Câmp: ecg_blob; Tip: VARBINARY(MAX); Restricții: opțional (stocare ECG 10 s)


#### `alert_events`

Câmpuri:
- Câmp: id; Tip: UNIQUEIDENTIFIER; Restricții: PK — generat client-side (idempotență)
- Câmp: patient_id; Tip: UNIQUEIDENTIFIER; Restricții: FK, INDEX
- Câmp: rule_id; Tip: UNIQUEIDENTIFIER; Restricții: FK → alarm_rules.id
- Câmp: triggered_at; Tip: DATETIME2; Restricții: NOT NULL, INDEX
- Câmp: severitate; Tip: VARCHAR(16); Restricții: CHECK IN (WARNING,CRITICAL)
- Câmp: text_pacient; Tip: NVARCHAR(500); Restricții: —


#### `hl7_inbound_referrals` / `fhir_outbound_letters`
Stochează mesajul integral (`raw_message` / `bundle_json`) + metadate (trimis la, status, id pacient asociat) — pentru audit și reprocesare.

#### `audit_events` (append-only)

Câmpuri:
- Câmp: id; Tip: BIGINT IDENTITY; Restricții: PK
- Câmp: occurred_at; Tip: DATETIME2; Restricții: NOT NULL, INDEX
- Câmp: user_id; Tip: UNIQUEIDENTIFIER; Restricții: FK → users.id
- Câmp: event_type; Tip: VARCHAR(32); Restricții: CHECK IN (LOGIN,READ,CREATE,UPDATE,DELETE,…)
- Câmp: resource; Tip: VARCHAR(120)
- Câmp: resource_id; Tip: UNIQUEIDENTIFIER
- Câmp: client_ip; Tip: VARCHAR(45)
- Câmp: outcome; Tip: VARCHAR(16); Restricții: SUCCESS / DENIED


> Tabela `audit_events` este **strict append-only** (EuroRec 28): `UPDATE` și `DELETE` sunt blocate la nivel de rol DB.

### Legături între tabele (relații principale)

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

### Indecși recomandați

| Tabel | Index | Tip | Motivație |
|---|---|---|---|
| sensor_samples | (batch_id, ts) | CLUSTERED | interogări pe intervale de timp |
| sensor_samples | (patient_id proiectat prin batch, ts) | acoperitor | grafice evoluție |
| alert_events | (patient_id, triggered_at DESC) | nonclustered | „ultimele alarme" |
| clinical_visits | (patient_id, visited_at DESC) | nonclustered | fișa consolidată |
| audit_events | (occurred_at) | nonclustered | rapoarte audit |
| demographics | cnp | UNIQUE | identificare rapidă |

### Drepturi de acces (nivel rol DB)

| Rol DB | Tabele | Operațiuni |
|---|---|---|
| app_doctor | toate tabelele pacienți/consultații | SELECT, INSERT, UPDATE (WHERE doctor_id = @me) |
| app_patient | measurement_batches, alert_events proprii | SELECT doar pe patient_id = @me |
| app_ingestion | measurement_batches, sensor_samples, alert_events | INSERT; UPDATE doar pe ACK |
| app_auditor | audit_events | SELECT |

### Normalizare

- Schema este normalizată până la **3FN**:
  - atributele non-cheie depind exclusiv de cheia primară (1FN, 2FN);
  - nu există dependențe tranzitive (3FN): adresa este parte a `demographics` pentru că identifică pacientul, nu o entitate externă;
  - `CodedValue` (system/code/display) este denormalizat controlat pe `clinical_visits` din motive de istoric clinic (valorile cod nu trebuie să se schimbe odată cu update-ul dicționarului ICD-10).
- `sensor_samples` este menținut **flat** pentru performanță la interogări de serii temporale; denormalizarea este documentată și izolată.

### Fișiere și stocare în afara bazei de date

| Conținut | Tip stocare | Format |
|---|---|---|
| raw_message HL7 inbound | coloană NVARCHAR(MAX) + opțional Azure Blob pentru arhivă | text ER7 |
| bundle_json FHIR outbound | coloană NVARCHAR(MAX) | JSON |
| rapoarte generate (PDF/CSV) | Azure Blob Storage, container reports/ | PDF / CSV |
| log-uri tehnice | Azure Application Insights | structurat |

***
\newpage

## Trasabilitate specificații → proiectare

| Cerință din Specificații | Acoperire în proiectare |
|---|---|
| Monitorizarea parametrilor (ECG, puls, temp., umiditate) | §2.2 (ESP32) + §3.2/C1 + §4.2 (sensor_samples) |
| Gestionarea alertelor < 10 s | §2.3 (AlarmEvaluator local) + §3.2/C3 + §4.2 (alert_events) |
| Administrarea pacienților (ICD-10) | §2.5 (Web) + §4.2 (clinical_visits) |
| Comunicare HL7 / FHIR | §3.2/C6–C7 + §4.2 (hl7_inbound_referrals, fhir_outbound_letters) |
| Offline + sincronizare | §2.3 (Room + WorkManager) + §3.2/C2 (idempotență) |
| Securitate GDPR, roluri | §1.2 (JWT), §4.5 (roluri DB), §4.2 (audit_events) |
| Restricție ESP32 — Bluetooth exclusiv | §3.2/C1 |

***
\newpage

## Referințe

- Ghidul disciplinei MPSAM (structura obligatorie a documentației de proiectare, partea de proiectare software).
- Specificațiile funcționale ale proiectului SeniorWatch (versiunea aprobată la nivel de echipă).
- Standard HL7 v2.5 (mesaje clinice inbound).
- Standard HL7 FHIR R4 (schimb de documente clinice outbound).
- Recomandări generale de proiectare pentru sisteme medicale distribuite (securitate, audit, trasabilitate, interoperabilitate).
