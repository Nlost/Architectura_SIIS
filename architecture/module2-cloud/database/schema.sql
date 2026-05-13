-- SeniorWatch — schema PostgreSQL 15
-- Bazat pe Proiectare.md §4 + EuroRec Seal Level 2
-- Rulare: psql -h <host> -U seniorwatch_admin -d seniorwatch -f schema.sql

-- ─── Extensii ────────────────────────────────────────────────────────────────
-- gen_random_uuid() este built-in in PostgreSQL 13+ (nu necesita extensie)

-- ─── Tipuri enumerate ─────────────────────────────────────────────────────────

CREATE TYPE health_item_status AS ENUM (
  'ACTIVE', 'ARCHIVED', 'DELETED', 'AMENDED'
);

CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'PATIENT');

CREATE TYPE alert_severity AS ENUM ('WARNING', 'CRITICAL');

CREATE TYPE sensor_parameter AS ENUM ('ECG', 'UMIDITATE', 'TEMPERATURA', 'PULS');

-- ─── USERS ───────────────────────────────────────────────────────────────────
-- EuroRec 33 — fiecare utilizator identificat unic si persistent

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role   NOT NULL,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PERMISSIONS ─────────────────────────────────────────────────────────────
-- EuroRec 25, 34 — politica privilegii per rol

CREATE TABLE permissions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role         user_role   NOT NULL,
  resource     VARCHAR(80) NOT NULL,
  action       VARCHAR(20) NOT NULL CHECK (action IN ('READ','WRITE','DELETE','EXPORT')),
  confidential BOOLEAN     NOT NULL DEFAULT FALSE,
  UNIQUE (role, resource, action)
);

-- ─── PATIENTS ─────────────────────────────────────────────────────────────────

CREATE TABLE patients (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  UUID        NOT NULL REFERENCES users(id),
  active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_doctor ON patients(doctor_id);

-- ─── DEMOGRAPHICS ─────────────────────────────────────────────────────────────
-- EuroRec 2, 3 — date demografice complete (1:1 cu patients)

CREATE TABLE demographics (
  patient_id    UUID        PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  nume          VARCHAR(80) NOT NULL,
  prenume       VARCHAR(80) NOT NULL,
  sex           CHAR(1)     CHECK (sex IN ('M','F','O')),
  data_nasterii DATE        NOT NULL,
  cnp           CHAR(13)    UNIQUE,
  strada        VARCHAR(80),
  localitate    VARCHAR(80),
  judet         VARCHAR(80),
  cod_postal    VARCHAR(10),
  tara          VARCHAR(80) DEFAULT 'Romania',
  telefon       VARCHAR(20),
  email         VARCHAR(120),
  profesie      VARCHAR(120),
  loc_de_munca  VARCHAR(120)
);

CREATE INDEX idx_demographics_cnp   ON demographics(cnp);
CREATE INDEX idx_demographics_email ON demographics(email);

-- ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
-- EuroRec 5-7, 31, 32 — versionare (nu UPDATE in-place)

CREATE TABLE medical_records (
  patient_id              UUID        PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  istoric_medical         TEXT,
  alergii_text            TEXT,
  consultatii_cardio_text TEXT,
  -- VersionMetadata
  version_id              UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id     UUID        REFERENCES users(id),
  responsible_person_id   UUID        REFERENCES users(id),
  status                  health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id     UUID
);

-- ─── DEVICE BINDINGS ─────────────────────────────────────────────────────────

CREATE TABLE device_bindings (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id           UUID         UNIQUE REFERENCES patients(id),
  smartphone_device_id VARCHAR(128),
  sensor_kit_id        VARCHAR(128) NOT NULL UNIQUE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── ALARM RULES ─────────────────────────────────────────────────────────────

CREATE TABLE alarm_rules (
  id                            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                    UUID             NOT NULL REFERENCES patients(id),
  parametru                     sensor_parameter NOT NULL,
  prag_min                      NUMERIC(10,2)    NOT NULL,
  prag_max                      NUMERIC(10,2)    NOT NULL,
  durata_persistenta_sec        INT              NOT NULL DEFAULT 0 CHECK (durata_persistenta_sec >= 0),
  interval_debut_activitate_sec INT              NOT NULL DEFAULT 0 CHECK (interval_debut_activitate_sec >= 0),
  CONSTRAINT chk_alarm_prag CHECK (prag_max > prag_min),
  -- VersionMetadata
  version_id              UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id     UUID        REFERENCES users(id),
  responsible_person_id   UUID        REFERENCES users(id),
  status                  health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id     UUID
);

CREATE INDEX idx_alarm_rules_patient ON alarm_rules(patient_id);

-- ─── NORMAL RANGE PROFILES ───────────────────────────────────────────────────

CREATE TABLE normal_range_profiles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID        NOT NULL UNIQUE REFERENCES patients(id),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CLINICAL VISITS ─────────────────────────────────────────────────────────
-- EuroRec 8 (ICD-10), 5-7, 15-17, 31, 32

CREATE TABLE clinical_visits (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id               UUID        NOT NULL REFERENCES patients(id),
  visited_at               TIMESTAMPTZ NOT NULL,
  motiv_prezentare         VARCHAR(500),
  simptome                 TEXT,
  diagnostic_icd10_code    VARCHAR(10),
  diagnostic_icd10_display VARCHAR(200),
  trimiteri                TEXT,
  retete                   TEXT,
  -- VersionMetadata
  version_id              UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id     UUID        REFERENCES users(id),
  responsible_person_id   UUID        REFERENCES users(id),
  status                  health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id     UUID
);

CREATE INDEX idx_clinical_visits_patient  ON clinical_visits(patient_id, visited_at DESC);
CREATE INDEX idx_clinical_visits_icd10    ON clinical_visits(diagnostic_icd10_code);

-- ─── HEALTH PROBLEMS ─────────────────────────────────────────────────────────
-- EuroRec 4, 17

CREATE TABLE health_problems (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID        NOT NULL REFERENCES patients(id),
  description           TEXT        NOT NULL,
  icd10_code            VARCHAR(10),
  icd10_display         VARCHAR(200),
  onset_date            DATE,
  -- VersionMetadata
  version_id            UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id   UUID        REFERENCES users(id),
  responsible_person_id UUID        REFERENCES users(id),
  status                health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id   UUID
);

CREATE INDEX idx_health_problems_patient ON health_problems(patient_id);

-- ─── ALLERGIES ───────────────────────────────────────────────────────────────
-- EuroRec 14, 44

CREATE TABLE allergies (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID        NOT NULL REFERENCES patients(id),
  substance_code        VARCHAR(50),
  substance_display     VARCHAR(200) NOT NULL,
  reaction              VARCHAR(200),
  severity              VARCHAR(20) CHECK (severity IN ('MILD','MODERATE','SEVERE')),
  -- VersionMetadata
  version_id            UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id   UUID        REFERENCES users(id),
  responsible_person_id UUID        REFERENCES users(id),
  status                health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id   UUID
);

CREATE INDEX idx_allergies_patient ON allergies(patient_id);

-- ─── MEDICATIONS ─────────────────────────────────────────────────────────────
-- EuroRec 9, 10, 50

CREATE TABLE medications (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID        NOT NULL REFERENCES patients(id),
  product_code          VARCHAR(50),
  product_display       VARCHAR(200) NOT NULL,
  dosage                VARCHAR(100),
  frequency             VARCHAR(100),
  prescribed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- VersionMetadata
  version_id            UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id   UUID        REFERENCES users(id),
  responsible_person_id UUID        REFERENCES users(id),
  status                health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id   UUID
);

CREATE INDEX idx_medications_patient ON medications(patient_id);

-- ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────

CREATE TABLE recommendations (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id            UUID        NOT NULL REFERENCES patients(id),
  tip_activitate        VARCHAR(120),
  durata_zilnica_minute INT,
  alte_indicatii        TEXT,
  -- VersionMetadata
  version_id            UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  health_item_id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by_user_id   UUID        REFERENCES users(id),
  responsible_person_id UUID        REFERENCES users(id),
  status                health_item_status NOT NULL DEFAULT 'ACTIVE',
  previous_version_id   UUID
);

CREATE INDEX idx_recommendations_patient ON recommendations(patient_id);

-- ─── MEASUREMENT BATCHES ─────────────────────────────────────────────────────
-- batch_id = cheie de idempotenta (generat de Android)

CREATE TABLE measurement_batches (
  batch_id       VARCHAR(64)  PRIMARY KEY,
  patient_id     UUID         NOT NULL REFERENCES patients(id),
  device_id      VARCHAR(128) REFERENCES device_bindings(sensor_kit_id),
  interval_start TIMESTAMPTZ  NOT NULL,
  interval_end   TIMESTAMPTZ  NOT NULL,
  received_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_measurement_batches_patient ON measurement_batches(patient_id, interval_start DESC);

-- ─── SENSOR SAMPLES ──────────────────────────────────────────────────────────

CREATE TABLE sensor_samples (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id    VARCHAR(64) NOT NULL REFERENCES measurement_batches(batch_id),
  ts          TIMESTAMPTZ NOT NULL,
  puls        SMALLINT    CHECK (puls BETWEEN 0 AND 300),
  spo2        SMALLINT    CHECK (spo2 BETWEEN 0 AND 100),
  temperatura NUMERIC(4,1),
  umiditate   NUMERIC(4,1),
  ecg_blob    BYTEA
);

-- Index clustered recomandat pentru interogari pe serii temporale (Proiectare.md §4.4)
CREATE INDEX idx_sensor_samples_batch_ts ON sensor_samples(batch_id, ts);

-- ─── ACCELEROMETRU ────────────────────────────────────────────────────────────

CREATE TABLE accel_bursts (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  batch_id       VARCHAR(64) NOT NULL REFERENCES measurement_batches(batch_id),
  interval_start TIMESTAMPTZ NOT NULL,
  interval_end   TIMESTAMPTZ NOT NULL
);

CREATE TABLE accel_samples (
  id       BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  burst_id BIGINT      NOT NULL REFERENCES accel_bursts(id),
  t        TIMESTAMPTZ NOT NULL,
  x        NUMERIC(8,4),
  y        NUMERIC(8,4),
  z        NUMERIC(8,4)
);

-- ─── ALERT EVENTS ────────────────────────────────────────────────────────────
-- id generat client-side pe Android pentru idempotenta (Proiectare.md §3.2/C3)

CREATE TABLE alert_events (
  id           UUID           PRIMARY KEY,
  patient_id   UUID           NOT NULL REFERENCES patients(id),
  rule_id      UUID           NOT NULL REFERENCES alarm_rules(id),
  triggered_at TIMESTAMPTZ    NOT NULL,
  severitate   alert_severity NOT NULL,
  text_pacient VARCHAR(500),
  received_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_events_patient ON alert_events(patient_id, triggered_at DESC);

-- ─── AUDIT EVENTS (append-only) ──────────────────────────────────────────────
-- EuroRec 26, 28 — nu se permite UPDATE sau DELETE (aplicat prin roluri DB)

CREATE TABLE audit_events (
  id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id     UUID        REFERENCES users(id),
  event_type  VARCHAR(32) NOT NULL CHECK (
    event_type IN ('LOGIN','LOGOUT','READ','CREATE','UPDATE','DELETE','EXPORT','IMPORT')
  ),
  resource    VARCHAR(120),
  resource_id UUID,
  client_ip   VARCHAR(45),
  outcome     VARCHAR(16) NOT NULL CHECK (outcome IN ('SUCCESS','DENIED'))
);

CREATE INDEX idx_audit_events_occurred ON audit_events(occurred_at DESC);
CREATE INDEX idx_audit_events_user     ON audit_events(user_id, occurred_at DESC);

-- ─── HL7 INBOUND REFERRALS ───────────────────────────────────────────────────

CREATE TABLE hl7_inbound_referrals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_message TEXT        NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  patient_id  UUID        REFERENCES patients(id),
  status      VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
    CHECK (status IN ('RECEIVED','PROCESSED','ERROR')),
  error_msg   TEXT
);

-- ─── FHIR OUTBOUND LETTERS ───────────────────────────────────────────────────

CREATE TABLE fhir_outbound_letters (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID        NOT NULL REFERENCES patients(id),
  visit_id    UUID        REFERENCES clinical_visits(id),
  bundle_json TEXT        NOT NULL,
  sent_at     TIMESTAMPTZ,
  status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','SENT','ERROR')),
  error_msg   TEXT
);
