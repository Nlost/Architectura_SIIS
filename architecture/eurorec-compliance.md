# Conformitate EuroRec Seal Level 2

Documentul leagă cele **33 de criterii marcate „da"** din `Criterii EuroRec.pdf` de
**clasele și metodele** din arhitectura noastră. Pentru fiecare criteriu se indică:
- textul criteriului (scurt),
- unde este implementat (modul + fișier + clasă / pachet),
- tipurile de date relevante din `shared/types-shared.puml`.

Criteriile marcate „nu" (11, 12, 13, 18, 19, 20, 21, 22, 23, 27, 30, 37, 41, 42, 46, 47, 48) sunt în afara scope-ului acestui proiect și nu sunt tratate.

---

## 1. Utilizatori, roluri, audit, acces

| # | Criteriu (scurt) | Implementare |
|---|------------------|--------------|
| 1  | Legătură rol ↔ utilizator | `UserController.assignRole`, `RoleAssignment` DTO |
| 24 | Date confidențiale doar pentru utilizatori autorizați | `AccessControlService.canUserAccess`, `Permission.confidential` |
| 25 | Politică de privilegii și control acces | `AccessControlService.updatePermissionsForRole` + UI în `UserAdminService` |
| 26 | Audit de login/logout | `AuthService` apelează `AuditService.recordEvent(LOGIN / LOGOUT)` |
| 28 | Înregistrările auditului nu pot fi modificate | `AuditController` expune doar GET; tabela în SQL este append-only |
| 29 | Schimbarea parolei de către utilizator | `AuthController.changePassword`, `AccountService.changeMyPassword` (web + mobil) |
| 33 | Fiecare utilizator identificat unic și persistent | `UserAccount.id : UUID`, PK în tabela `user_account` |
| 34 | Drepturi diferite (R/W) pe health item ținând cont de confidențialitate | `Permission(resource, action, confidential)` + `AccessControlService.canUserAccess` |
| 36 | Admin / privileged user / common user | `UserRole` enum (ADMIN, DOCTOR, PATIENT); `UserAdminService` pentru admin |
| 40 | Acces în funcție de rol și de relația cu pacientul | `AccessControlService.isAuthorizedForPatient` |

---

## 2. Identificare pacient

| # | Criteriu | Implementare |
|---|----------|--------------|
| 2  | Nume, prenume, sex, data nașterii | `Demographics.nume/prenume/sex/dataNasterii` + `Sex` enum |
| 3  | Date demografice conform legislației | `Demographics` cu toate câmpurile cerute (adresă, CNP, telefon, email, profesie, loc de muncă) |
| 38 | Pacient + EHR identificat unic și persistent | `PatientSummary.id : UUID` (PK stabil) |
| 39 | Distinge pacienți cu aceleași nume/prenume/sex/dată naștere | `PatientService.findDuplicateCandidates` + UI de confirmare |
| 43 | Header pacient pe fiecare ecran de date | `PatientIdentificationHeader` DTO + `PatientIdentificationBarService` (web) + `PatientUiService.renderPatientHeader` (mobil) |
| 45 | Modificarea datelor administrative | `PatientController.updatePatient` (PATCH) + `PatientService.updateDemographics` |

---

## 3. Versionare date medicale

| # | Criteriu | Implementare |
|---|----------|--------------|
| 5  | Dată + oră pe fiecare versiune | `VersionMetadata.recordedAt : DateTime` |
| 6  | Utilizatorul care a introdus datele | `VersionMetadata.recordedByUserId : UUID` |
| 7  | Fiecare update → versiune nouă | Serviciile backend (ex. `ClinicalVisitService.updateVisit`) creează rând nou cu `previousVersionId` setat; update-ul „in place" este interzis prin convenție. |
| 15 | Ștergere → versiune nouă cu status `DELETED` | `AllergyService.markDeleted`, `HealthProblemService.updateStatus(DELETED)`, `HealthItemStatus.DELETED` |
| 16 | Responsabil de conținut | `VersionMetadata.responsiblePersonId : UUID` |
| 17 | Schimbarea statusului unei probleme → versiune nouă | `HealthProblemController.updateProblemStatus` + `HealthItemStatus` |
| 31 | Fiecare health item legat unic și persistent de un pacient | `VersionMetadata.healthItemId` + `patientId` (toate entitățile medicale) |
| 32 | Fiecare versiune identificată unic și persistent | `VersionMetadata.versionId : UUID` |

> **Convenție transversală:** toate entitățile `HealthProblem`, `Allergy`, `Medication`, `ClinicalVisit`, `Recommendation`, `AlarmRule` au atributul compozit `version : VersionMetadata`. Backend-ul **nu face UPDATE**; face INSERT cu versiune nouă.

---

## 4. Probleme de sănătate, alergii, medicație

| # | Criteriu | Implementare |
|---|----------|--------------|
| 4  | Toate problemele curente de sănătate | `HealthProblemController.listCurrentProblems` (filtrate pe `status = ACTIVE`) → `PatientPortalService.getMyCurrentProblems` (pacient) |
| 14 | Listă alergeni cu status activ | `AllergyController.listActiveAllergies` + `MyAllergiesService.getActiveAllergies` (mobil) |
| 9  | Listă medicație curentă | `MedicationController.listCurrentMedication` + `MyMedicationService.getCurrentMedication` |
| 10 | Istoric medicație | `MedicationController.listMedicationHistory` + `MyMedicationService.getMedicationHistory` |
| 44 | La prescriere afișează alergiile cunoscute | `MedicationService.checkPrescriptionSafety` → `PrescriptionDecisionSupport.knownAllergies` (UI-ul medicului le afișează obligatoriu înainte de confirmare) |
| 50 | Medicația conține ID produs (forma), dată început, dată ultima prescriere, posologie | `Medication.product / packageForm / startingDate / latestPrescription / dosing` |

---

## 5. Acces dosar + coding

| # | Criteriu | Implementare |
|---|----------|--------------|
| 8  | Suport sisteme de codificare (ICD-10, ATC) | `CodedValue(system, code, display)` folosit în `ClinicalVisit.diagnosticICD10`, `Allergy.substance`, `Medication.product`, `HealthProblem.code` + `Icd10LookupService` (web) |
| 35 | Toate datele pacientului accesibile direct din dosarul lui | `MonitoringController.getConsolidatedPatientView` + ecran unic „Dosar pacient" în web (agregă probleme, alergii, medicație, consultații, recomandări, măsurători) |

---

## 6. Alerte clinice

| # | Criteriu | Implementare |
|---|----------|--------------|
| 49 | Mod consistent de afișare a alertelor (roșu = anormal) | `ClinicalAlertRendering(level, color, icon, message)` + `ClinicalAlertRenderingService` în web și mobil. Un singur loc decide culorile, reutilizat peste tot. |

---

## Matrice rezumat — criteriu × modul

Legend: ◉ = implementare primară, ○ = implementare secundară / afișare.

| # | Criteriu (short) | Web (Mod.1) | Cloud (Mod.2) | Mobile (Mod.3) | ESP32 (Mod.4) |
|---|------------------|:-:|:-:|:-:|:-:|
| 1  | Rol ↔ user | ○ | ◉ | | |
| 2  | Nume/sex/DoB | ○ | ◉ | ○ | |
| 3  | Demografie completă | ○ | ◉ | | |
| 4  | Probleme curente | ○ | ◉ | ○ | |
| 5  | Dată/oră versiune | | ◉ | | |
| 6  | Autor intrare | | ◉ | | |
| 7  | Update → versiune nouă | | ◉ | | |
| 8  | Coduri (ICD-10) | ○ | ◉ | | |
| 9  | Medicație curentă | ○ | ◉ | ○ | |
| 10 | Istoric medicație | ○ | ◉ | ○ | |
| 14 | Alergii active | ○ | ◉ | ○ | |
| 15 | Ștergere = versiune DELETED | | ◉ | | |
| 16 | Responsabil de conținut | | ◉ | | |
| 17 | Status problemă → versiune nouă | | ◉ | | |
| 24 | Acces doar autorizat | ○ | ◉ | | |
| 25 | Politică privilegii | ○ | ◉ | | |
| 26 | Audit login/logout | ○ | ◉ | | |
| 28 | Audit imuabil | | ◉ | | |
| 29 | Schimbare parolă | ◉ | ◉ | ◉ | |
| 31 | Health item → pacient | | ◉ | | ○ |
| 32 | Versiune identificată unic | | ◉ | | |
| 33 | User identificat unic | | ◉ | | |
| 34 | Drepturi R/W ținând cont de confidențialitate | | ◉ | | |
| 35 | Toate datele direct din dosar | ◉ | ◉ | | |
| 36 | Admin/privileged/common | ◉ | ◉ | | |
| 38 | Pacient + EHR unic | | ◉ | | ○ |
| 39 | Discriminare nume identice | ○ | ◉ | | |
| 40 | Acces după rol | | ◉ | | |
| 43 | Header pacient pe ecrane | ◉ | ○ | ◉ | |
| 44 | Alergii la prescriere | ◉ | ◉ | | |
| 45 | Modificare date administrative | ◉ | ◉ | | |
| 49 | Rendering alerte consistent | ◉ | ○ | ◉ | |
| 50 | Elemente medicație | ○ | ◉ | ○ | |

---

## Decizii de design

1. **Versionare append-only** — toate entitățile medicale sunt imuabile; orice „modificare" e un INSERT cu `previousVersionId`.
2. **Audit append-only** — tabela `audit_event` nu are UPDATE/DELETE; accesul la citire doar prin `AuditController` (rol ADMIN).
3. **Un singur `ClinicalAlertRenderingService`** — asigură consistența vizuală (criteriul 49) între web și mobil; culorile sunt centralizate în `ClinicalAlertRendering`.
4. **Header pacient** — componentă UI fixă în shell-ul aplicației, alimentată cu `PatientIdentificationHeader`. Orice ecran care afișează date clinice e obligat să o afișeze.
5. **Coding systems** — `CodedValue` este tipul standard folosit pentru ICD-10 (probleme, consultații), ATC (medicație), SNOMED (alergii substanțe). Un singur loc de lookup în web: `Icd10LookupService`.
6. **Scope firmware (ESP32)** — EuroRec se aplică pe EHR. ESP32 nu ține utilizatori / health items / audit. Indirect respectă criteriile 31, 32 prin `seqNumber` + `timestampMs` pe fiecare `SensorFrame`.

---

## Referințe fișiere

- `shared/types-shared.puml` — toate tipurile noi: `UserAccount`, `UserRole`, `Permission`, `VersionMetadata`, `HealthItemStatus`, `HealthProblem`, `Allergy`, `Medication`, `AuditEvent`, `CodedValue`, `PatientIdentificationHeader`, `ClinicalAlertRendering`.
- `module1-web/api-module1-web.puml` — servicii web pentru toate zonele funcționale + portal pacient.
- `module2-cloud/api-module2-cloud.puml` — pachetele `Users & Roles`, `Health Problems`, `Allergies`, `Medications`, `Audit`.
- `module3-mobile/api-module3-mobile.puml` — `AccountService`, `MyAllergiesService`, `MyMedicationService`, `MyProblemsService`, `ClinicalAlertRenderingService`.
- `module4-esp32/api-module4-esp32.puml` — notă cu scope EuroRec pe firmware (doar indirect).
