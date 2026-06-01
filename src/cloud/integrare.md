# SeniorWatch — Ghid pentru echipă

**Ultima actualizare:** 2026-06-01  
**Proiect:** MPSAM-2026 / Facultate

---

## Ce este SeniorWatch

O aplicație de teleasistență medicală cu 3 componente:

1. **Dispozitiv embedded (ESP32)** — senzori: ECG, puls, temperatură, accelerometru. Transmite date prin Bluetooth la telefonul pacientului.
2. **Aplicație Android** — primește date de la ESP32, le trimite la server, afișează alerte.
3. **Aplicație web** — interfața medicului: vede pacienții, datele senzorilor, istoricul medical.

---

## Arhitectura sistemului

```
[ESP32 senzori]
      │ Bluetooth
      ▼
[Android app]  ──── REST API ────►  [Backend Spring Boot]  ──►  [Baza de date PostgreSQL]
                                            │
[Web browser]  ──── REST API ────►          │                ──►  [S3 — rapoarte PDF]
                                            │
                                            └──────────────►  [SNS — alerte email/push]
```

**Regula de bază:** Embedded și Web vorbesc **doar cu backend-ul** prin REST API. Nimeni nu se conectează direct la baza de date în afară de Cloud.

---

## Cine face ce

| Modul | Responsabilitate |
|---|---|
| **Cloud** | Infrastructura AWS (deja configurată) + API Spring Boot — deploy pe Elastic Beanstalk |
| **Web** | Aplicația web (frontend) — deploy pe S3 |
| **Embedded** | ESP32 + aplicația Android |

---

## Ce este deja gata

Cloud a configurat și deploiat tot:

| Resursă | Ce este | Status |
|---|---|---|
| **RDS PostgreSQL** | Baza de date cu 21 tabele + date inițiale | ✅ Pornit |
| **Backend Spring Boot** | API REST — deploiat pe Elastic Beanstalk, funcțional | ✅ Live |
| **Autentificare JWT** | Login testat, token returnat corect | ✅ Funcțional |
| **S3 Bucket** | Stocare rapoarte PDF | ✅ Configurat |
| **SNS** | Trimitere alerte pe email / push | ✅ Configurat |
| **CloudFront + S3** | Hosting site web la `seniorwatch.mardelean.com` | ✅ Activ |
| **Auto-shutdown** | Resursele se opresc automat la 23:00 și pornesc la 09:00 | ✅ Activ |

**Infrastructura este gata. Nu mai trebuie configurat nimic în AWS Console de către Web sau Embedded.**

---

## Pentru modulul Cloud (Spring Boot)

**Backend-ul este deja deploiat și funcțional.** Codul sursă se află în `src/cloud/backend/`.

### URL backend live

```
http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com
```

### Verificare rapidă

```powershell
# Login testat — returnează JWT token
Invoke-RestMethod -Uri "http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@seniorwatch.local","password":"Admin@SeniorWatch2026!"}'
```

### Cum faci re-deploy (după modificări de cod)

1. Build JAR (din `src/cloud/backend/`):

   ```powershell
   docker run --rm -v "${PWD}:/app" -w /app maven:3.9-eclipse-temurin-21 mvn clean package -DskipTests
   ```

2. Creare ZIP:

   ```powershell
   cd target
   Compress-Archive -Force -Path Dockerfile, seniorwatch-cloud.jar -DestinationPath seniorwatch-deploy.zip
   ```

3. EB Console → `seniorwatch-dev` → **Upload and deploy** → `seniorwatch-deploy.zip`

---

## Pentru modulul Web (frontend)

### Ce ai disponibil

- **Site-ul** rulează la `https://seniorwatch.mardelean.com` (CloudFront + S3)
- **Backend API** rulează la `http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com`
- **Deploy**: trimiți fișierele în S3 cu scriptul primit, CloudFront face distribuirea automat

### Credențiale de test (există în DB)

| Email                     | Parolă                   | Rol   |
|---------------------------|--------------------------|-------|
| `admin@seniorwatch.local` | `Admin@SeniorWatch2026!` | ADMIN |

> Dacă ai nevoie de conturi cu parole simple (ex. `1234`) pentru test, anunță modulul Cloud să le creeze.

### Ce trebuie modificat în frontend

Momentan login-ul din aplicație este hardcodat. Trebuie înlocuit cu apeluri reale la API:

**1. Login — înlocuiește logica hardcodată:**

```javascript
const API_BASE = 'http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com'

async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error('Credențiale invalide')
  const { token } = await res.json()
  localStorage.setItem('sw_token', token)
}
```

**2. Orice request după login — adaugă header Authorization:**

```javascript
async function apiFetch(path) {
  const token = localStorage.getItem('sw_token')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return res.json()
}

// Exemple:
const patients = await apiFetch('/api/patients')
const details  = await apiFetch('/api/patients/123e4567-...')
```

### Flux de autentificare

1. User introduce email + parolă pe site
2. Site-ul face `POST /api/auth/login`
3. Backend returnează un **JWT token**
4. Site-ul salvează token-ul în `localStorage`
5. Toate request-urile ulterioare includ `Authorization: Bearer <token>`
6. Token-ul expiră după 24 ore — redirecționează la login dacă primești 401

### Gestionarea utilizatorilor (din portal)

Adminul poate crea conturi noi de doctori și pacienți **direct din aplicație**, fără acces la AWS.

**Cont inițial (există în DB):**

| Email                     | Parolă                   | Rol   |
|---------------------------|--------------------------|-------|
| `admin@seniorwatch.local` | `Admin@SeniorWatch2026!` | ADMIN |

> Nu hardcoda credențialele în cod. Formularul de login trimite email + parolă la API.

**Lista utilizatori — înlocuiește lista hardcodată:**

```javascript
// GET /api/users — doar pentru ADMIN
const users = await apiFetch('/api/users')
// Returnează: [{ id, email, role, active, createdAt }, ...]
```

**Creare user nou — înlocuiește `alert()` din `handleCreateUser()`:**

```javascript
async function handleCreateUser(formData) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('sw_token')}`
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,  // minim 8 caractere
      role: formData.rol            // "ADMIN", "DOCTOR" sau "PATIENT"
    })
  })
  if (!res.ok) throw new Error('Eroare la crearea userului')
  return res.json()  // returnează userul creat cu id-ul lui
}
```

> Endpoint-urile `/api/users` sunt protejate — funcționează **doar** cu token de ADMIN.

---

## Pentru modulul Embedded (Android)

### Cum funcționează împreună cu Web

Embedded și Web **nu comunică între ele** — amândoi vorbesc cu același backend:

```
ESP32 ──Bluetooth──► Android ──POST /api/measurements──► Backend ──► RDS
                                                                       │
                     Web browser ◄──GET /api/measurements ◄── Backend ┘
```

Android scrie date în baza de date → web citește automat aceleași date. Nu necesită nicio coordonare directă între module.

### Dependință față de modulul Web

> **Embedded are nevoie de `patientId`** — UUID-ul pacientului din baza de date.

Acest UUID se obține după ce modulul Web creează pacienții prin `POST /api/patients`. **Ordinea de lucru:**

1. Modulul Web creează un pacient în aplicație
2. Backend-ul returnează `patientId` (UUID)
3. Modulul Web comunică acel UUID echipei Embedded
4. Android folosește `patientId` la trimiterea datelor

Pentru testare, modulul Cloud poate crea pacienți direct în DB și comunica UUID-urile.

### URL backend (live, funcțional)

```kotlin
const val BASE_URL = "http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com"
```

### Flux principal

```
1. Android face login → primește JWT token
2. ESP32 trimite date prin Bluetooth la Android
3. Android acumulează datele într-un batch
4. La interval regulat (ex. 30 sec): POST /api/measurements + token JWT
5. Dacă valori anormale: POST /api/alerts → backend trimite SNS → notificare email/push
```

### Exemplu login

```kotlin
interface SeniorWatchApi {
    @POST("/api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): LoginResponse
}

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val token: String)

// La pornirea aplicației:
val response = api.login(LoginRequest("pacient@seniorwatch.local", "parola"))
val jwtToken = response.token  // salvat în memorie, folosit la toate requesturile
```

### Exemplu trimitere date senzori

```kotlin
@POST("/api/measurements")
suspend fun sendMeasurements(
    @Header("Authorization") token: String,
    @Body batch: MeasurementBatch
): Response<Unit>

// Apel la fiecare 30 secunde:
api.sendMeasurements(
    token = "Bearer $jwtToken",
    batch = MeasurementBatch(
        patientId = currentPatientId,       // UUID primit de la modulul Web
        batchId = UUID.randomUUID().toString(), // unic per batch — evită duplicate la retry
        intervalStart = startTime,
        intervalEnd = endTime,
        samples = listOf(
            Sample(ts = now, puls = 72, temperatura = 36.5f)
        )
    )
)
```

### Exemplu trimitere alertă

```kotlin
@POST("/api/alerts")
suspend fun sendAlert(
    @Header("Authorization") token: String,
    @Body alert: AlertRequest
): Response<Unit>

// Dacă puls > 120 sau temperatura > 38.5:
api.sendAlert(
    token = "Bearer $jwtToken",
    alert = AlertRequest(
        patientId = currentPatientId,
        severitate = "WARNING",   // sau "CRITICAL"
        textPacient = "Puls ridicat: 125 bpm"
    )
)
```

**Important:** `batchId` generat pe Android — dacă se trimite de două ori același batch (retry după eroare de rețea), backend-ul îl ignoră pe al doilea. Evită duplicarea datelor.

---

## Credențiale și acces

> Modulul Cloud ține credențialele AWS. Web și Embedded nu au nevoie de acces la AWS Console.

**Ce primește fiecare:**

| Modul | Ce primește de la Cloud |
|---|---|
| Cloud | Acces AWS Console + toate credențialele |
| Web | URL-ul EB pentru API calls + scriptul de deploy S3 |
| Embedded | URL-ul EB pentru API calls |

---

## Program resurse AWS

Resursele **se opresc automat** în fiecare zi la **23:00** și repornesc la **09:00** (ora României, vară).

Dacă lucrezi în afara acestui interval și ai nevoie de server, anunță modulul Cloud să pornească manual resursele din AWS Console.

---

---

## Întrebări frecvente

**Q: Pot să modific tabelele din baza de date?**  
A: Discută cu modulul Cloud înainte. Schema e în `src/cloud/database/schema.sql`. Modificările se aplică via migrări (Flyway), nu manual.

**Q: Cum verific că backend-ul rulează corect pe EB?**  
A: Accesează `http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com/api/actuator/health` — trebuie să returneze `{"status":"UP"}`.

**Q: Site-ul web nu poate apela API-ul (eroare CORS)?**  
A: Verifică că modulul Cloud a configurat CORS în Spring Boot să permită `https://seniorwatch.mardelean.com`.

**Q: Cum văd log-urile backend-ului?**  
A: Modulul Cloud verifică CloudWatch Logs sau EB → Logs.
