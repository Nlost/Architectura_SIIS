-- SeniorWatch — date initiale (seed)
-- Ruleaza DUPA schema.sql
-- ATENTIE: schimba parola admin inainte de deploy in productie

-- ─── Utilizator admin initial ─────────────────────────────────────────────────
-- Parola implicita: "Admin@SeniorWatch2026!" (hash bcrypt)
-- SCHIMBA IMEDIAT dupa primul login sau seteaza prin variabila de mediu

INSERT INTO users (id, email, password_hash, role, active)
VALUES (
  gen_random_uuid(),
  'admin@seniorwatch.local',
  -- bcrypt hash pentru "Admin@SeniorWatch2026!" — inlocuieste cu hash real
  '$2a$12$PLACEHOLDER_HASH_REPLACE_BEFORE_DEPLOY_xxxxxxxxxxxxxxxxxxxx',
  'ADMIN',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ─── Permisiuni implicite per rol ─────────────────────────────────────────────

-- DOCTOR: acces complet la datele pacientilor proprii
INSERT INTO permissions (role, resource, action, confidential) VALUES
  ('DOCTOR', 'patients',           'READ',   FALSE),
  ('DOCTOR', 'patients',           'WRITE',  FALSE),
  ('DOCTOR', 'demographics',       'READ',   FALSE),
  ('DOCTOR', 'demographics',       'WRITE',  FALSE),
  ('DOCTOR', 'clinical_visits',    'READ',   FALSE),
  ('DOCTOR', 'clinical_visits',    'WRITE',  FALSE),
  ('DOCTOR', 'clinical_visits',    'DELETE', FALSE),
  ('DOCTOR', 'health_problems',    'READ',   FALSE),
  ('DOCTOR', 'health_problems',    'WRITE',  FALSE),
  ('DOCTOR', 'allergies',          'READ',   FALSE),
  ('DOCTOR', 'allergies',          'WRITE',  FALSE),
  ('DOCTOR', 'medications',        'READ',   FALSE),
  ('DOCTOR', 'medications',        'WRITE',  FALSE),
  ('DOCTOR', 'recommendations',    'READ',   FALSE),
  ('DOCTOR', 'recommendations',    'WRITE',  FALSE),
  ('DOCTOR', 'alarm_rules',        'READ',   FALSE),
  ('DOCTOR', 'alarm_rules',        'WRITE',  FALSE),
  ('DOCTOR', 'measurements',       'READ',   FALSE),
  ('DOCTOR', 'alert_events',       'READ',   FALSE),
  ('DOCTOR', 'reports',            'READ',   FALSE),
  ('DOCTOR', 'reports',            'EXPORT', FALSE),
  ('DOCTOR', 'hl7_referrals',      'READ',   FALSE),
  ('DOCTOR', 'fhir_letters',       'WRITE',  FALSE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- PATIENT: acces doar la propriile masuratori si recomandari
INSERT INTO permissions (role, resource, action, confidential) VALUES
  ('PATIENT', 'measurements',    'READ',  FALSE),
  ('PATIENT', 'recommendations', 'READ',  FALSE),
  ('PATIENT', 'alert_events',    'READ',  FALSE)
ON CONFLICT (role, resource, action) DO NOTHING;

-- ADMIN: acces total (gestionare utilizatori + audit)
INSERT INTO permissions (role, resource, action, confidential) VALUES
  ('ADMIN', 'users',        'READ',   FALSE),
  ('ADMIN', 'users',        'WRITE',  FALSE),
  ('ADMIN', 'users',        'DELETE', FALSE),
  ('ADMIN', 'permissions',  'READ',   FALSE),
  ('ADMIN', 'permissions',  'WRITE',  FALSE),
  ('ADMIN', 'audit_events', 'READ',   FALSE)
ON CONFLICT (role, resource, action) DO NOTHING;
