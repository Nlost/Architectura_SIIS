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

## Ce este deja gata (infrastructura AWS)

Cloud a configurat tot ce ține de AWS:

| Resursă | Ce este | Status |
|---|---|---|
| **RDS PostgreSQL** | Baza de date cu 21 tabele + date inițiale | ✅ Pornit |
| **Elastic Beanstalk** | Serverul unde rulează backend-ul Spring Boot | ✅ Pornit |
| **S3 Bucket** | Stocare rapoarte PDF | ✅ Configurat |
| **SNS** | Trimitere alerte pe email / push | ✅ Configurat |
| **CloudFront + S3** | Hosting site web la `seniorwatch.mardelean.com` | ✅ Activ |
| **Auto-shutdown** | Resursele se opresc automat la 23:00 și pornesc la 09:00 | ✅ Activ |

**Infrastructura este gata. Nu mai trebuie configurat nimic în AWS Console de către Web sau Embedded.**

---

## Pentru modulul Cloud (Spring Boot)

### Ce ai disponibil

Aplicația va rula pe **Elastic Beanstalk** la URL-ul:

```
http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com
```

Toate variabilele de configurare sunt **deja setate** în mediul EB. Spring Boot le citește automat:

| Variabilă | Valoare (deja setată în AWS) |
|---|---|
| `DB_HOST` | endpoint RDS |
| `DB_PORT` | `5432` |
| `DB_NAME` | `seniorwatch` |
| `DB_USER` | `sw_app` |
| `DB_PASSWORD` | setat |
| `JWT_SECRET` | setat |
| `AWS_REGION_APP` | `eu-central-1` |
| `S3_REPORTS_BUCKET` | `seniorwatch-reports-31m9` |
| `SNS_ALERTS_TOPIC_ARN` | ARN topic alertă |

**Nu trebuie atinsă nicio configurație AWS.** `application.yml` citește aceste variabile automat.

### Cum faci deploy

**Opțiunea simplă — JAR:**
1. `mvn package` → obții `target/seniorwatch-backend.jar`
2. EB Console → `seniorwatch-dev` → Upload and deploy → selectezi JAR-ul

**Opțiunea recomandată — Docker:**
1. Există deja un `Dockerfile` în `src/cloud/`
2. Build + push în ECR → EB face pull automat
3. (Cloud poate configura GitHub Actions pentru deploy automat)

### Ce trebuie implementat obligatoriu

**1. CORS** — fără asta, modulul Web nu poate apela API-ul:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://seniorwatch.mardelean.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

**2. Server port** — aplicația trebuie să asculte pe portul 8080:

```yaml
# application.yml — deja configurat dacă folosești variabila
server:
  port: ${SERVER_PORT:8080}
```

**3. Schema DB** — tabelele sunt deja create. Nu rula `CREATE TABLE` din nou. Dacă folosești Flyway/Liquibase, setează `baseline-on-migrate: true`.

### Endpoint-uri minime necesare

```
POST   /api/auth/login               → returnează JWT token
GET    /api/patients                 → lista pacienți (doctor)
GET    /api/patients/{id}            → detalii pacient
POST   /api/measurements             → primește date senzori de la Embedded
GET    /api/measurements/{patientId} → istoricul măsurătorilor
POST   /api/alerts                   → alertă trimisă de Embedded
```

---

## Pentru modulul Web (frontend)

### Ce ai disponibil

- **Site-ul** rulează la `https://seniorwatch.mardelean.com` (CloudFront + S3)
- **Deploy**: trimiți fișierele în S3 cu scriptul primit, CloudFront face distribuirea automat

### Cum apelezi backend-ul

```javascript
const API_BASE = 'http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com'

// Login
const response = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'doctor@test.com', password: '...' })
})
const { token } = await response.json()

// Orice alt request — trimiți token-ul
const patients = await fetch(`${API_BASE}/api/patients`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Flux de autentificare

1. User introduce email + parolă pe site
2. Site-ul face `POST /api/auth/login`
3. Backend returnează un **JWT token**
4. Site-ul salvează token-ul (localStorage sau cookie)
5. Toate request-urile următoare includ `Authorization: Bearer <token>`

---

## Pentru modulul Embedded (Android)

### URL backend

```kotlin
const val BASE_URL = "http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com"
```

### Flux principal

```
1. Android face login → primește JWT token
2. ESP32 trimite date prin Bluetooth la Android
3. Android acumulează datele într-un batch
4. La interval regulat: POST /api/measurements cu batch-ul + token JWT
5. Dacă valori anormale: POST /api/alerts → backend trimite SNS → notificare email/push
```

### Exemplu trimitere date senzori

```kotlin
// Retrofit
@POST("/api/measurements")
suspend fun sendMeasurements(
    @Header("Authorization") token: String,
    @Body batch: MeasurementBatch
): Response<Unit>

// Apel
api.sendMeasurements(
    token = "Bearer $jwtToken",
    batch = MeasurementBatch(
        patientId = currentPatientId,
        batchId = UUID.randomUUID().toString(), // idempotență
        intervalStart = startTime,
        intervalEnd = endTime,
        samples = listOf(
            Sample(ts = now, puls = 72, temperatura = 36.5f)
        )
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

Dacă lucrezi în afara acestui interval și ai nevoie de server:
- Anunță modulul Cloud să pornească manual resursele
- Sau lucrează pe mediu local cu Docker (vezi `docker-compose.yml` în `src/cloud/`)

---

## Mediu local pentru backend (fără AWS)

Dacă vrei să testezi fără să depinzi de AWS:

```bash
# Din src/cloud/
cp .env.example .env
# Editează .env cu valorile locale (DB locală, etc.)
docker-compose up
```

Există un `docker-compose.yml` care pornește PostgreSQL local + aplicația Spring Boot.

---

## Întrebări frecvente

**Q: Pot să modific tabelele din baza de date?**  
A: Discută cu modulul Cloud înainte. Schema e în `src/cloud/database/schema.sql`. Modificările se aplică via migrări (Flyway), nu manual.

**Q: Cum verific că backend-ul rulează corect pe EB?**  
A: Accesează `http://<EB_URL>/actuator/health` — trebuie să returneze `{"status":"UP"}`.

**Q: Site-ul web nu poate apela API-ul (eroare CORS)?**  
A: Verifică că modulul Cloud a configurat CORS în Spring Boot să permită `https://seniorwatch.mardelean.com`.

**Q: Cum văd log-urile backend-ului?**  
A: Modulul Cloud verifică CloudWatch Logs sau EB → Logs.
