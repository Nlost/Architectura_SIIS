# SeniorWatch — Documentație Cloud & Backend

**Ultima actualizare:** 2026-06-01  
**Regiune AWS:** `eu-central-1` (Frankfurt)  
**Cont AWS:** credite studențești

---

## Resurse AWS active

### VPC

| Resursă | ID |
|---|---|
| VPC | `vpc-0493050ca449fc46e` |
| Subnet public 1a | `10.0.1.0/24` — eu-central-1a |
| Subnet public 1b | `10.0.2.0/24` — eu-central-1b |
| Subnet privat 1a | `10.0.3.0/24` — eu-central-1a |
| Subnet privat 1b | `10.0.4.0/24` — eu-central-1b |

RDS-ul este în subnets private — nu este accesibil direct din internet.

---

### Baza de date — RDS PostgreSQL

| Câmp | Valoare |
|---|---|
| Endpoint | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |
| Port | `5432` |
| Database | `seniorwatch` |
| Engine | PostgreSQL 18.3-R1 |
| Instance | `db.t3.micro` / 20 GB |

**Utilizatori:**

| User | Rol | Folosit de |
|---|---|---|
| `postgres` | Master admin | Migrări, setup manual |
| `sw_app` | User aplicație | Spring Boot (via env vars) |

**Schema:** 21 tabele — users, patients, demographics, medical_records, device_bindings, alarm_rules, clinical_visits, health_problems, allergies, medications, recommendations, measurement_batches, sensor_samples, accel_bursts, accel_samples, alert_events, audit_events, hl7_inbound_referrals, fhir_outbound_letters, permissions.

**Date inițiale (seed):**
- 1 user admin: `admin@seniorwatch.local` / rol `ADMIN`
- 32 permisiuni pentru rolurile DOCTOR, PATIENT, ADMIN

#### Cum te conectezi la RDS

RDS este în subnet privat — nu are IP public. Singura metodă de acces este via **Session Manager** pe instanța EC2 a Elastic Beanstalk:

```bash
# 1. AWS Console → EC2 → Instances → instanța EB → Connect → Session Manager → Connect
# 2. În terminal:
sudo dnf install -y postgresql15
psql -h seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com -U postgres -d seniorwatch
# Parola: vezi aws-resources.md
```

---

### Elastic Beanstalk — Backend API

| Câmp | Valoare |
|---|---|
| Application | `seniorwatch-cloud` |
| Environment | `seniorwatch-dev` |
| Platform | Docker / Amazon Linux 2023 |
| Instance type | `t3.small` |
| **URL** | `http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com` |

**Variabile de mediu configurate în EB** (Spring Boot le citește automat):

| Variabilă | Valoare |
|---|---|
| `SERVER_PORT` | `8080` |
| `DB_HOST` | endpoint RDS de mai sus |
| `DB_PORT` | `5432` |
| `DB_NAME` | `seniorwatch` |
| `DB_USER` | `sw_app` |
| `DB_PASSWORD` | configurat |
| `JWT_SECRET` | configurat |
| `AWS_REGION_APP` | `eu-central-1` |
| `S3_REPORTS_BUCKET` | `seniorwatch-reports-31m9` |
| `SNS_ALERTS_TOPIC_ARN` | `arn:aws:sns:eu-central-1:096506568929:seniorwatch-mobile-alerts` |

> Backend-ul nu necesită nicio configurație suplimentară — toate variabilele sunt deja setate în mediul EB.

---

### S3

| Câmp | Valoare |
|---|---|
| Bucket | `seniorwatch-reports-31m9` |
| Scop | Stocare rapoarte PDF generate de backend |
| Acces public | Blocat complet |
| Lifecycle | Ștergere automată după 90 zile |

---

### SNS — Alerte

| Topic | ARN |
|---|---|
| `seniorwatch-mobile-alerts` | `arn:aws:sns:eu-central-1:096506568929:seniorwatch-mobile-alerts` |
| `seniorwatch-ops-alerts` | abonament email confirmat |

---

### CloudFront + S3 Web

| Câmp | Valoare |
|---|---|
| URL public | `https://seniorwatch.mardelean.com` |
| CloudFront Distribution | `E2N0ABALUR7PES` |

---

### Auto-shutdown/start

Resursele se opresc și pornesc automat:

| Eveniment | Ora (România, vară) | Ora (UTC) |
|---|---|---|
| Oprire | 23:00 | 20:00 |
| Pornire | 09:00 | 06:00 |

**EB** — Scheduled Actions configurate direct în EB.  
**RDS** — Lambda `seniorwatch-rds-scheduler` + EventBridge rules `seniorwatch-rds-stop` / `seniorwatch-rds-start`.

> Dacă lucrezi în afara intervalului 09:00–23:00, resursele trebuie pornite manual din AWS Console.

---

## Cum te conectezi la backend

### URL de bază

```
http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com
```

### Autentificare — JWT

Toate endpoint-urile (în afară de `/api/auth/login`) necesită un **JWT token** în header.

**Pas 1 — obții token-ul:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@seniorwatch.local",
  "password": "<parola>"
}
```

**Răspuns:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Pas 2 — trimiți token-ul la fiecare request:**

```http
GET /api/patients
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Exemple — modulul Web (JavaScript)

```javascript
const API_BASE = 'http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com'

// Login
async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const { token } = await res.json()
  localStorage.setItem('token', token)
}

// Request autentificat
async function getPatients() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE}/api/patients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return res.json()
}
```

---

### Exemple — modulul Embedded (Android / Kotlin)

```kotlin
// Retrofit — definire interfață
interface SeniorWatchApi {
    @POST("/api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): LoginResponse

    @POST("/api/measurements")
    suspend fun sendMeasurements(
        @Header("Authorization") token: String,
        @Body batch: MeasurementBatch
    ): Response<Unit>

    @POST("/api/alerts")
    suspend fun sendAlert(
        @Header("Authorization") token: String,
        @Body alert: AlertEvent
    ): Response<Unit>
}

// Inițializare Retrofit
val retrofit = Retrofit.Builder()
    .baseUrl("http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(SeniorWatchApi::class.java)

// Trimitere date senzori
api.sendMeasurements(
    token = "Bearer $jwtToken",
    batch = MeasurementBatch(
        patientId = currentPatientId,
        batchId = UUID.randomUUID().toString(),
        intervalStart = startTime,
        intervalEnd = endTime,
        samples = sensorReadings
    )
)
```

> **batchId** — generat pe Android, UUID unic per batch. Dacă același batch se trimite de două ori (retry la eroare de rețea), backend-ul îl ignoră pe al doilea. Evită duplicarea datelor.

---

### Endpoint-uri principale

| Metodă | Endpoint | Descriere |
|---|---|---|
| `POST` | `/api/auth/login` | Login, returnează JWT |
| `GET` | `/api/patients` | Lista pacienți (medic) |
| `GET` | `/api/patients/{id}` | Detalii pacient |
| `POST` | `/api/patients` | Adaugă pacient |
| `POST` | `/api/measurements` | Trimite date senzori (Android) |
| `GET` | `/api/measurements/{patientId}` | Istoricul măsurătorilor |
| `POST` | `/api/alerts` | Trimite alertă (Android) |
| `GET` | `/api/alerts/{patientId}` | Lista alerte pacient |

---

## Deploy backend

### Opțiunea 1 — JAR (simplu)

```bash
mvn package
# Rezultat: target/seniorwatch-backend.jar
```

AWS Console → Elastic Beanstalk → `seniorwatch-dev` → **Upload and deploy** → selectezi JAR-ul.

### Opțiunea 2 — Docker (recomandat)

```bash
docker build -t seniorwatch-backend .
docker tag seniorwatch-backend:latest <ECR_URL>/seniorwatch-backend:latest
docker push <ECR_URL>/seniorwatch-backend:latest
```

EB face pull automat la deploy.

### Verificare după deploy

```
GET http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com/actuator/health
```

Răspuns așteptat: `{"status":"UP"}`

---

## Mediu local (fără AWS)

```bash
cd src/cloud
cp .env.example .env
# Completează .env cu valorile locale
docker-compose up
```

Pornește PostgreSQL local + aplicația Spring Boot. Util pentru development fără dependență de AWS.

---

## Note importante

- **Schema DB nu se modifică manual** — folosește migrări Flyway/Liquibase. Dacă ai Flyway, setează `spring.flyway.baseline-on-migrate=true` (schema e deja creată).
- **CORS obligatoriu** — backend-ul trebuie să permită request-uri de pe `https://seniorwatch.mardelean.com`.
- **Nu commita `.env`** — conține parole. Fișierul e în `.gitignore`.
- **Credențialele AWS** — gestionate de modulul Cloud. Web și Embedded nu au nevoie de acces la AWS Console.
