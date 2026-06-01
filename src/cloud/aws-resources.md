# AWS Resources — SeniorWatch (stare curentă)

**Cont AWS:** credite studențești  
**Regiune:** `eu-central-1` (Frankfurt)  
**Ultima actualizare:** 2026-06-01

---

## ✅ Pas 0 — VPC

| Resursă | Nume | ID / Valoare |
|---|---|---|
| VPC | `seniorwatch-vpc` | `vpc-0493050ca449fc46e` |
| Subnet public 1a | `seniorwatch-public-1a` | eu-central-1a / `10.0.1.0/24` |
| Subnet public 1b | `seniorwatch-public-1b` | eu-central-1b / `10.0.2.0/24` |
| Subnet privat 1a | `seniorwatch-private-1a` | eu-central-1a / `10.0.3.0/24` |
| Subnet privat 1b | `seniorwatch-private-1b` | eu-central-1b / `10.0.4.0/24` |
| Internet Gateway | `seniorwatch-igw` | atașat la `seniorwatch-vpc` |
| Route table publică | `seniorwatch-rt-public` | `0.0.0.0/0` → igw, asociată la public-1a + public-1b |
| DB Subnet Group | `seniorwatch-db-subnet-group` | private-1a + private-1b |

---

## ✅ Pas 1 — Security Groups

| Nume | Inbound | VPC |
|---|---|---|
| `seniorwatch-sg-backend` | TCP 8080, HTTP 80, HTTPS 443 — `0.0.0.0/0` | `seniorwatch-vpc` |
| `seniorwatch-sg-rds` | PostgreSQL 5432 — doar din `seniorwatch-sg-backend` | `seniorwatch-vpc` |

> **Notă acces admin:** Pentru a rula psql de pe laptop, adaugă temporar IP-ul tău (`82.77.158.29/32` sau verifică cu `https://checkip.amazonaws.com`) în inbound rules pe `seniorwatch-sg-rds` port 5432. Șterge după ce termini.

---

## ✅ Pas 2 — RDS PostgreSQL

| Câmp | Valoare |
|---|---|
| Identifier | `seniorwatch-postgres` |
| Engine | PostgreSQL 18.3-R1 |
| Instance class | `db.t3.micro` |
| Storage | 20 GB gp2 |
| Multi-AZ | No |
| Public access | No (subnet privat — acces doar din VPC) |
| VPC | `seniorwatch-vpc` |
| Subnet group | `seniorwatch-db-subnet-group` (private-1a + private-1b) |
| Security group | `seniorwatch-sg-rds` |
| Database name | `seniorwatch` |
| Master user | `postgres` |
| Master password | `CsK5nncjqUk7zRGeQNnZ` |
| Backup retention | 7 zile |
| **Endpoint** | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |

### Utilizatori DB

| User | Parolă | Rol |
| --- | --- | --- |
| `postgres` | `CsK5nncjqUk7zRGeQNnZ` | Master admin — doar pentru migrări/setup |
| `sw_app` | `SeniorWatch2026!App` | User aplicație — folosit de Spring Boot |

### Cum te conectezi la RDS (subnet privat)

**Opțiunea recomandată — Session Manager prin EB:**

1. EC2 → Instances → instanța EB → Connect → Session Manager → Connect
2. `sudo dnf install -y postgresql15`
3. `psql -h seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com -U postgres -d seniorwatch`

**Nu** te poți conecta direct de pe laptop — RDS e în subnet privat fără IP public.

---

## ✅ Pas 3 — S3

| Câmp | Valoare |
|---|---|
| Bucket name | `seniorwatch-reports-31m9` |
| ARN | `arn:aws:s3:::seniorwatch-reports-31m9` |
| Region | eu-central-1 |
| Public access | Blocat complet |
| Versioning | Activat |
| Encryption | SSE-S3 |
| Lifecycle rule | `expire-old-reports` — șterge după 90 zile |

---

## ✅ Pas 4 — SNS Topics

| Topic | ARN |
|---|---|
| `seniorwatch-mobile-alerts` | `arn:aws:sns:eu-central-1:096506568929:seniorwatch-mobile-alerts` |
| `seniorwatch-ops-alerts` | abonament email `ardelean.marius.ma@gmail.com` confirmat |

---

## ✅ Pas 5 — IAM Role (pentru Elastic Beanstalk EC2)

| Câmp | Valoare |
|---|---|
| Role name | `seniorwatch-beanstalk-ec2-role` |
| Trusted entity | EC2 |
| Politici managed | `AWSElasticBeanstalkWebTier`, `AWSElasticBeanstalkMulticontainerDocker`, `CloudWatchLogsFullAccess`, `AmazonEC2ContainerRegistryReadOnly`, `AmazonSSMManagedInstanceCore` |
| Politică inline | `seniorwatch-app-permissions` — S3 (`seniorwatch-reports-31m9`) + SNS Publish (`seniorwatch-mobile-alerts`) |

> `AmazonSSMManagedInstanceCore` adăugat pe 2026-05-28 — necesar pentru Session Manager (acces la instanță fără SSH).

---

## ✅ Pas 6 — Elastic Beanstalk

| Câmp | Valoare |
|---|---|
| Application name | `seniorwatch-cloud` |
| Environment name | `seniorwatch-dev` |
| Environment ID | `e-cyqdawmfm7` |
| Platform | Docker / Amazon Linux 2023 / 4.13.0 |
| Instance type | `t3.small` |
| VPC | `vpc-0493050ca449fc46e` |
| Subnets instanțe | `seniorwatch-public-1a`, `seniorwatch-public-1b` |
| Security group | `seniorwatch-sg-backend` |
| EC2 instance profile | `seniorwatch-beanstalk-ec2-role` |
| Health reporting | Enhanced |
| CloudWatch log streaming | Activat, 30 zile |
| **EB URL** | `seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com` |
| Health status | ✅ Green |

### Environment properties (variabile de mediu)

| Key | Value |
| --- | --- |
| `SERVER_PORT` | `8080` |
| `DB_HOST` | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |
| `DB_PORT` | `5432` |
| `DB_NAME` | `seniorwatch` |
| `DB_USER` | `sw_app` |
| `DB_PASSWORD` | `SeniorWatch2026!App` |
| `JWT_SECRET` | `b3f8a2d94c1e76f05b2a9d3e8c4f17a06d52b8e19c3f74a5b0e2d96c` |
| `AWS_REGION_APP` | `eu-central-1` |
| `S3_REPORTS_BUCKET` | `seniorwatch-reports-31m9` |
| `SNS_ALERTS_TOPIC_ARN` | `arn:aws:sns:eu-central-1:096506568929:seniorwatch-mobile-alerts` |

> **Problemă întâlnită 2026-05-28:** variabilele copiate cu TAB trailing cauzează eroare Docker (`poorly formatted environment`). Tastează cheile manual, nu le copia din tabel.

---

## ✅ Pas 7 — Schema + Seed baza de date

**schema.sql** — rulat pe **2026-05-28** via Session Manager pe instanța EB:
- 21 tabele create cu succes
- `sw_app` creat cu permisiuni corecte (SELECT/INSERT/UPDATE pe toate tabelele, REVOKE UPDATE/DELETE pe `audit_events`)

**seed.sql** — rulat pe **2026-06-01** via Session Manager:
- 1 user admin: `admin@seniorwatch.local` / rol `ADMIN`
- 32 permisiuni inserate (DOCTOR + PATIENT + ADMIN roles)

### Verificare

```sql
-- Conectare via Session Manager pe instanța EB:
sudo dnf install -y postgresql15
psql -h seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com -U postgres -d seniorwatch
-- Parola: CsK5nncjqUk7zRGeQNnZ
\dt                                     -- 21 tabele
SELECT email, role FROM users;          -- 1 row: admin@seniorwatch.local | ADMIN
SELECT COUNT(*) FROM permissions;       -- 32
```

---

## ✅ Pas 10 — Auto-shutdown/start

### EB Scheduled Actions

| Acțiune | Cron (UTC) | Ora România (vară) | Min | Max | Desired |
| --- | --- | --- | --- | --- | --- |
| `StopAtNight` | `0 20 * * *` | 23:00 | 0 | 0 | 0 |
| `StartInMorning` | `0 6 * * *` | 09:00 | 1 | 2 | 1 |

End time setat: **2026-07-31** — prelungește dacă proiectul continuă după iulie.

### Lambda + EventBridge pentru RDS

| Resursă | Nume / ARN |
| --- | --- |
| IAM Role | `seniorwatch-lambda-rds-scheduler` |
| Lambda | `seniorwatch-rds-scheduler` (Python 3.12) |
| EventBridge Stop | `seniorwatch-rds-stop` — `cron(0 20 * * ? *)` → `{"action": "stop"}` |
| EventBridge Start | `seniorwatch-rds-start` — `cron(0 6 * * ? *)` → `{"action": "start"}` |

Ambele reguli **Enabled**. Testate manual cu succes pe 2026-06-01.

> **Notă UTC:** Vara (EEST, UTC+3) — 20:00 UTC = 23:00 RO, 06:00 UTC = 09:00 RO. În octombrie când se schimbă ora, ajustează la 21:00 / 07:00 UTC.

---

## ⬜ Pași rămași

| Pas | Descriere | Status |
| --- | --- | --- |
| 8 | CloudWatch Alarms (5xx, CPU, RDS storage) | sărit — proiect facultate |
| 9 | Custom domain API `api.seniorwatch.mardelean.com` → EB | opțional |
| — | Deploy cod real Spring Boot (înlocuiește sample app) | ⬜ |
