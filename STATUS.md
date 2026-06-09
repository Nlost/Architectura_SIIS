# SeniorWatch — Status Deploy (2026-06-09)

## Ce s-a facut azi (2026-06-09)

### Frontend — fix proxy dev local

- **Eroare rezolvata:** `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` la login
  - Cauza: `API_BASE = ""` in `api.js` + CRA dev server (`:3000`) nu stia de `/api/*` → returna `index.html` in loc de JSON
  - Fix: adaugat `"proxy": "http://localhost:8080"` in `src/web/package.json`
  - In **productie** (EB + nginx): `API_BASE = ""` ramane corect — nginx ruteaza `/api/*` la backend automat
  - In **dev local**: proxy-ul CRA forward-eaza cererile la backend pe `localhost:8080`
  - **Important:** dupa modificarea `package.json` e necesar restart `npm start` ca proxy-ul sa fie activat

### Baza de date — reset parola admin

- Generat hash bcrypt (rounds=10) pentru parola `Admin@SeniorWatch2026!`:

  ```text
  $2b$10$ilWGlNf7qu1T0dGk4TzVkeguLRRkekzKtoJ8JTewPvvqo12Nh2UdS
  ```

- Aplicat in RDS via:

  ```sql
  UPDATE users
  SET password_hash = '$2b$10$ilWGlNf7qu1T0dGk4TzVkeguLRRkekzKtoJ8JTewPvvqo12Nh2UdS'
  WHERE email = 'admin@seniorwatch.local';
  ```

- Login cu `admin@seniorwatch.local` / `Admin@SeniorWatch2026!` ar trebui sa returneze `200 OK` acum

---

## Ce s-a facut anterior (2026-06-08)

### Backend (Spring Boot → Docker → ECR → EB)
- **Fix `@JdbcType`** pe entitatile cu enum PostgreSQL custom:
  - `User.role` → `user_role`
  - `AlertEvent.severitate` → `alert_severity`
  - `AlarmRule.parametru` → `sensor_parameter`
  - `AlarmRule.status` → `health_item_status`
  - Fara fix: `POST /api/users` returna 500 (Hibernate nu stia sa mapeze enum-urile)

- **Fix Dockerfile** — `COPY target/seniorwatch-cloud.jar app.jar`
  - Inainte: `COPY seniorwatch-cloud.jar` — Docker nu gasea fisierul (Maven pune JAR in `target/`)
  - Pipeline-ul esua la pasul "Build & push Docker image"

- **CI/CD pipeline** (`.github/workflows/deploy-backend.yml`)
  - Build Docker in GitHub Actions → push la ECR → `Dockerrun.aws.json` → S3 → EB
  - Evita OOM pe t3.small (Docker build nu mai ruleaza pe instanta EB)
  - Triggerare: orice push pe `master` cu fisiere in `src/cloud/backend/**`

- **Permisiuni IAM** adaugate pentru GitHub Actions user:
  - `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:PutImage`, etc.
  - Fara ele: pipeline-ul pica la "Login to Amazon ECR"

- **Script deploy manual** — `src/cloud/backend/deploy-manual.ps1`
  - Alternativa la GitHub Actions daca pipeline-ul nu merge
  - Rulare: `cd src/cloud/backend && .\deploy-manual.ps1`

### Frontend (React + Vite)
- Coleg a adaugat `src/web/src/api.js` — toate apelurile HTTP centralizate
- `Login.js` refactorizat sa foloseasca `api.js`
- `admin.jsx` refactorizat — formularul "Creaza utilizator" apeleaza efectiv backend-ul
- Email generat automat din nume+prenume (`prenume.nume@seniorwatch.com`)
- Parola default: `Senior123!` (hardcodata, intentionat pentru demo)

### Baza de date (RDS PostgreSQL)
- Verificat via Session Manager pe instanta EB:
  - 21 tabele prezente ✅
  - `admin@seniorwatch.local` cu rol ADMIN ✅
  - 32 permisiuni ✅

---

## Ce trebuie facut maine

### 1. Verifica pipeline-ul GitHub Actions
- Commit: `9511064` — fix Dockerfile COPY path
- URL: `https://github.com/Nlost/Architectura_SIIS/actions`
- Daca e verde → EB face pull din ECR si reporneste containerul (~3-5 min)
- Daca e rosu → uita-te la ce pas a picat si trimite eroarea

### 2. Testeaza backend-ul dupa deploy
```
POST http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@seniorwatch.local",
  "password": "Admin@SeniorWatch2026!"
}
```
- Raspuns asteptat: `200 OK` cu `{ "token": "eyJ..." }`
- Daca 401: parola din seed.sql e placeholder — trebuie resetata in DB

### 3. Daca login returneaza 401 — reset parola admin
Conecteaza-te la RDS via Session Manager si ruleaza:
```sql
UPDATE users
SET password_hash = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'
WHERE email = 'admin@seniorwatch.local';
```
Hash-ul de mai sus e pentru parola `password` (doar pentru test).
Pentru parola reala `Admin@SeniorWatch2026!`:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'Admin@SeniorWatch2026!', bcrypt.gensalt(12)).decode())"
```

### 4. Testeaza crearea de useri din frontend
- Mergi la `https://seniorwatch.mardelean.com` (sau localhost daca frontend nu e deployed)
- Login cu admin → Admin Panel → "Creaza utilizator"
- Completeaza nume + prenume + rol → verifica in DB ca apare

### 5. Deploy frontend (daca nu e facut)
```bash
cd src/web
npm install
npm run build
# Upload dist/ la S3 + invalidare CloudFront
```

---

## Informatii utile

| Resursa | Valoare |
|---|---|
| EB URL | `seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com` |
| Frontend | `https://seniorwatch.mardelean.com` |
| RDS endpoint | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |
| DB name | `seniorwatch` |
| DB admin user | `postgres` / `CsK5nncjqUk7zRGeQNnZ` |
| DB app user | `sw_app` / `SeniorWatch2026!App` |
| ECR repo | `096506568929.dkr.ecr.eu-central-1.amazonaws.com/seniorwatch-backend` |
| GitHub Actions | `https://github.com/Nlost/Architectura_SIIS/actions` |

### Conectare la RDS (din EB via Session Manager)
1. EC2 → Instances → instanta EB → Connect → Session Manager
2. `sudo dnf install -y postgresql15`
3. `psql -h seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com -U postgres -d seniorwatch`

### Auto-shutdown
- EB: oprire `23:00 RO` / pornire `09:00 RO`
- RDS: oprire `23:00 RO` / pornire `09:00 RO`
