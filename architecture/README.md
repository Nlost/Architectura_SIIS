# Arhitectură — sistem purtabil de supraveghere a stării de sănătate

Documentația este aliniată la tema tehnică (Clinica „Sănătatea noastră", vers. 1.1, 14.02.2026).
Componenta cloud este proiectată pentru **Microsoft Azure**.

---

## Structura folderelor

```
docs/architecture/
│
├── shared/                        # Tipuri de date partajate între toate modulele
│   ├── types-shared.puml          # Toate DTO-urile: Auth, Demographics, SensorSample, etc.
│   └── domain-model.puml          # Model de domeniu complet (entități + relații)
│
├── overview/                      # Diagrame de ansamblu ale întregului sistem
│   ├── system-components.puml     # Componente: web, cloud, mobil, ESP32
│   ├── azure-deployment.puml      # Deployment pe Azure (resurse, legături)
│   └── sequence-measurement-sync.puml  # Secvență: ESP32 → Android → API → SQL
│
├── module1-web/                   # Aplicație web (medic + pacient)
│   └── api-module1-web.puml       # Servicii <<Service>> + contract modul (self-contained)
│
├── module2-cloud/                 # Componentă cloud — Azure App Service
│   ├── api-module2-cloud.puml     # Controller + Service per domeniu + contract modul
│   └── openapi-cloud.yaml         # OpenAPI 3.0 (Swagger / Postman)
│
├── module3-mobile/                # Aplicație mobilă Android
│   └── api-module3-mobile.puml    # Servicii <<Service>> + Coordinator + contract modul
│
├── module4-esp32/                 # Modul inteligent (ESP32 + senzori)
│   └── api-module4-esp32.puml     # Firmware <<Module>> + <<Entry>> + contract modul
│
├── integration/                   # Cum se leagă toate modulele între ele
│   ├── README.md                  # Overview + contracte + tabel puncte integrare
│   ├── integration-points.puml    # Harta tuturor granițelor (BLE / REST / HL7 / FHIR)
│   ├── data-flow.puml             # SensorFrame → SensorSample → UplinkBatch → SQL
│   ├── sequences.puml             # Onboarding / măsurători / alarmă / HL7 / FHIR
│   └── ble-esp32-android.md       # GATT: UUID-uri, payload binar, pairing
│
├── index.html                     # Viewer web interactiv pentru toate diagramele PlantUML
├── eurorec-compliance.md          # Mapping criterii EuroRec Seal L2 → implementare
└── README.md                      # Acest fișier
```

---

## Cum citești diagramele

### Punct de start recomandat
1. `overview/system-components.puml` — privire de ansamblu asupra sistemului
2. `shared/types-shared.puml` — tipurile de date folosite de toate modulele
3. `module2-cloud/api-module2-cloud.puml` — API-ul cloud (toate pachetele într-o diagramă)
4. `module2-cloud/openapi-cloud.yaml` — detaliu endpoint + scheme JSON

### Vizualizare PlantUML
- **Cursor / VS Code:** extensia [PlantUML](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) → preview cu `Alt+D`
- **Online:** [plantuml.com/plantuml](https://www.plantuml.com/plantuml) — lipire conținut `.puml`
- **OpenAPI:** importare `module2-cloud/openapi-cloud.yaml` în [Swagger Editor](https://editor.swagger.io/) sau Postman

### Vizualizare web unificată (`index.html`)
- `index.html` agregă toate diagramele din `overview/`, `integration/`, `shared/` și modulele 1–4 într-o singură pagină.
- Pagina folosește `fetch` pentru fișierele locale `.puml`, deci trebuie servită prin HTTP (nu funcționează deschisă direct cu `file://`).
- Pornire rapidă:
  - `cd docs/architecture && python3 -m http.server 8000`
  - deschide `http://localhost:8000/`
- Pentru diagrame multi-pagină (`newpage`), viewer-ul separă automat paginile și oferă linkuri către SVG și editorul PlantUML.

---

## Cloud pe Azure (referință scurtă)

| Cerință (temă) | Azure (indicativ) |
|----------------|-------------------|
| Utilizatori, asocieri medic–pacient | Entra ID B2C / B2B + tabele rol în SQL |
| Izolare date per medic | Autorizare API + filtru `doctor_id` |
| Pacient ↔ smartphone ↔ senzori | `device_id` unic în DB |
| Fișă, consultații, reguli | **Azure SQL** + API (App Service sau Functions) |
| Ingestie de la mobil | `POST /ingestion/*`, mesaje idempotente (`batch_id`) |
| Push opțional | **Notification Hubs** |
| HL7 / FHIR | Endpoint dedicat; opțional **Azure API for FHIR** |

**Fluxuri:** batch măsurători ~30 s (din ferestre 10 s); alarmă asincronă imediat la prag; TLS + JWT; audit pe HL7/FHIR.

**Diagrame legate:** `overview/azure-deployment.puml`, `overview/sequence-measurement-sync.puml`.

---

## Module sistem (rezumat)

| Modul | Folder | Rol |
|-------|--------|-----|
| Aplicație web | `module1-web/` | Fișă pacient, consultații ICD-10, recomandări, alarme, grafice, HL7/FHIR |
| Cloud Azure | `module2-cloud/` | REST API, autentificare, stocare, ingestie, recomandări/alarme spre mobil |
| Aplicație mobilă Android | `module3-mobile/` | BLE de la ESP32, agregare 30 s, burst accelerometru, alarme locale, offline |
| Modul inteligent ESP32 | `module4-esp32/` | ECG, puls/SpO2, umiditate, temperatură; cadru BLE la 10 s |
| **Integrare** | `integration/` | **Lipirea** celor patru module: BLE, REST, HL7/FHIR, fluxuri end-to-end |

---

## Integrare — puncte rapide

| Perimetru | Protocol | Vezi |
|-----------|----------|------|
| ESP32 ↔ Android | BLE GATT (notify) | [`integration/ble-esp32-android.md`](integration/ble-esp32-android.md) |
| Android ↔ Cloud (ingestie, alarmă) | HTTPS REST + JWT | [`module2-cloud/openapi-cloud.yaml`](module2-cloud/openapi-cloud.yaml) |
| Web ↔ Cloud | HTTPS REST + JWT | [`module2-cloud/api-module2-cloud.puml`](module2-cloud/api-module2-cloud.puml) |
| Cloud ↔ MF | HL7 v2 inbound / FHIR outbound | [`integration/sequences.puml`](integration/sequences.puml) (pag. 4–5) |

Harta completă și transformările de date: [`integration/README.md`](integration/README.md).

---

## Conformitate EuroRec Seal Level 2

Arhitectura implementează cele **33 de criterii marcate „da"** din `Criterii EuroRec.pdf`. Zonele principale acoperite:

| Zonă | Criterii | Unde |
|------|----------|------|
| Users, roluri, audit, acces | 1, 24, 25, 26, 28, 29, 33, 34, 36, 40 | `module2-cloud` (Users & Roles, Audit) + `module1-web` (Admin) |
| Identificare pacient | 2, 3, 38, 39, 43, 45 | `shared` (`Demographics`, `PatientIdentificationHeader`) + `module1-web` + `module3-mobile` |
| Versionare (append-only) | 5, 6, 7, 15, 16, 17, 31, 32 | `shared` (`VersionMetadata`, `HealthItemStatus`) — convenție transversală |
| Probleme, alergii, medicație | 4, 9, 10, 14, 44, 50 | `module2-cloud` (pachete Health Problems / Allergies / Medications) |
| Acces date + coding (ICD-10) | 8, 35 | `shared.CodedValue`, `module1-web.Icd10LookupService`, `MonitoringController.getConsolidatedPatientView` |
| Alerte clinice consistente | 49 | `ClinicalAlertRenderingService` (web + mobil) + `shared.ClinicalAlertRendering` |

Tabel detaliat criteriu-cu-criteriu + matrice criteriu × modul: [`eurorec-compliance.md`](eurorec-compliance.md).

---

*Funcțiile publice sunt în engleză; câmpurile de date urmează terminologia din tema PDF.*
