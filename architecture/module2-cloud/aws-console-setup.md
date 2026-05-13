# AWS Console Setup — SeniorWatch Cloud (fără Terraform)

**Timp estimat:** 60–90 minute  
**Cont AWS:** credite studențești  
**Regiune:** `eu-central-1` (Frankfurt) — selecteaz-o din colțul dreapta-sus înainte de orice pas

> Ordinea contează — respectă pașii în secvența de mai jos deoarece unele resurse depind de altele.

---

## Pas 0 — VPC dedicat SeniorWatch

Creăm un VPC separat pentru a izola complet SeniorWatch de orice alte resurse din contul AWS.

### 0.1 Creare VPC

**VPC → Your VPCs → Create VPC**

| Câmp | Valoare |
|---|---|
| Name tag | `seniorwatch-vpc` |
| IPv4 CIDR | `10.0.0.0/16` |
| Tenancy | Default |

→ **Create VPC**

### 0.2 Subnets

**VPC → Subnets → Create subnet**  
Selectează `seniorwatch-vpc`, apoi adaugă toate 4 subnets dintr-o singură creare:

| Subnet name | AZ | CIDR |
|---|---|---|
| `seniorwatch-public-1a` | eu-central-1a | `10.0.1.0/24` |
| `seniorwatch-public-1b` | eu-central-1b | `10.0.2.0/24` |
| `seniorwatch-private-1a` | eu-central-1a | `10.0.3.0/24` |
| `seniorwatch-private-1b` | eu-central-1b | `10.0.4.0/24` |

→ **Create subnet**

**Activează auto-assign IP public** pe subnets publice (altfel EB nu pornește):  
Subnets → `seniorwatch-public-1a` → Actions → **Edit subnet settings** → ✓ Enable auto-assign public IPv4 → Save  
Repetă pentru `seniorwatch-public-1b`.

### 0.3 Internet Gateway

**VPC → Internet Gateways → Create internet gateway**

| Câmp | Valoare |
|---|---|
| Name tag | `seniorwatch-igw` |

→ **Create** → Actions → **Attach to VPC** → selectează `seniorwatch-vpc` → Attach

### 0.4 Route table publică

**VPC → Route Tables → Create route table**

| Câmp | Valoare |
|---|---|
| Name | `seniorwatch-rt-public` |
| VPC | `seniorwatch-vpc` |

→ **Create route table**

**Routes → Edit routes → Add route:**

| Destination | Target |
|---|---|
| `0.0.0.0/0` | `seniorwatch-igw` |

→ Save routes

**Subnet associations → Edit subnet associations:**  
✓ `seniorwatch-public-1a`  
✓ `seniorwatch-public-1b`  
→ Save associations

### 0.5 DB Subnet Group (pentru RDS)

**RDS → Subnet groups → Create DB subnet group**

| Câmp | Valoare |
|---|---|
| Name | `seniorwatch-db-subnet-group` |
| Description | Private subnets for SeniorWatch RDS |
| VPC | `seniorwatch-vpc` |
| Availability Zones | eu-central-1a, eu-central-1b |
| Subnets | `seniorwatch-private-1a`, `seniorwatch-private-1b` |

→ **Create**

---

## Pas 1 — Security Groups

Trebuie create 2 SG-uri: unul pentru backend (EC2), unul pentru baza de date (RDS). RDS va accepta conexiuni **doar** din SG-ul backend.

### 1.1 SG pentru backend

**EC2 → Security Groups → Create security group**

| Câmp | Valoare |
|---|---|
| Security group name | `seniorwatch-sg-backend` |
| Description | Backend EC2 — port 8080 |
| VPC | `seniorwatch-vpc` |

**Inbound rules → Add rule:**

| Type | Port | Source |
|---|---|---|
| Custom TCP | 8080 | Anywhere-IPv4 (`0.0.0.0/0`) |
| HTTP | 80 | Anywhere-IPv4 |
| HTTPS | 443 | Anywhere-IPv4 |

**Outbound rules:** lasă implicit (All traffic).

→ **Create security group**

### 1.2 SG pentru RDS

**EC2 → Security Groups → Create security group**

| Câmp | Valoare |
|---|---|
| Security group name | `seniorwatch-sg-rds` |
| Description | RDS PostgreSQL — acces doar din backend |
| VPC | `seniorwatch-vpc` |

**Inbound rules → Add rule:**

| Type | Port | Source |
|---|---|---|
| PostgreSQL | 5432 | Custom → *selectează* `seniorwatch-sg-backend` |

→ **Create security group**

---

## Pas 2 — RDS PostgreSQL

**RDS → Create database**

| Secțiune | Câmp | Valoare |
|---|---|---|
| Choose a database creation method | | Standard create |
| Engine options | Engine type | PostgreSQL |
| Engine options | Engine Version | **PostgreSQL 18.3-R1** |
| Templates | | **Free tier** (sau Dev/Test dacă nu apare) |
| Settings | DB instance identifier | `seniorwatch-postgres` |
| Settings | Master username | `postgres` |
| Settings | Master password | *(alege o parolă puternică, noteaz-o)* |
| Instance configuration | DB instance class | `db.t3.micro` |
| Storage | Storage type | gp2 |
| Storage | Allocated storage | 20 GB |
| Storage | Enable storage autoscaling | ✗ dezactivat |
| Connectivity | Compute resource | Don't connect to an EC2 resource |
| Connectivity | VPC | `seniorwatch-vpc` |
| Connectivity | Subnet group | `seniorwatch-db-subnet-group` |
| Connectivity | Public access | **No** |
| Connectivity | VPC security group | *(Remove default)* → **Add existing** → `seniorwatch-sg-rds` |
| Connectivity | Availability Zone | eu-central-1a |
| Database authentication | | Password authentication |
| Additional configuration | Initial database name | `seniorwatch` |
| Additional configuration | Automated backups | Enabled, 7 zile |
| Additional configuration | Encryption | ✗ dezactivat (economie, dev) |

→ **Create database** *(durează ~5 minute)*

> **Notează endpoint-ul** din RDS → Databases → `seniorwatch-postgres` → Connectivity → Endpoint  
> Ex: `seniorwatch-postgres.xxxxxx.eu-central-1.rds.amazonaws.com`

---

## Pas 3 — S3 Bucket (rapoarte PDF/CSV)

**S3 → Create bucket**

| Câmp | Valoare |
|---|---|
| Bucket name | `seniorwatch-reports-` + *(4 cifre aleatorii, ex: `seniorwatch-reports-4f2a`)* |
| AWS Region | eu-central-1 |
| Block Public Access | ✓ Block all public access |
| Bucket Versioning | Enable |
| Default encryption | SSE-S3 |

→ **Create bucket**

**Lifecycle rule** (opțional — șterge rapoarte vechi):
S3 → bucket → Management → Lifecycle rules → Create lifecycle rule

| Câmp | Valoare |
|---|---|
| Rule name | expire-old-reports |
| Filter | *(lasă gol — se aplică pe tot)* |
| Expiration | Current version → 90 days |

---

## Pas 4 — SNS Topics

### 4.1 Topic notificări mobile

**SNS → Topics → Create topic**

| Câmp | Valoare |
|---|---|
| Type | Standard |
| Name | `seniorwatch-mobile-alerts` |

→ **Create topic** — **notează ARN-ul** (format: `arn:aws:sns:eu-central-1:XXXX:seniorwatch-mobile-alerts`)

### 4.2 Topic alarme operaționale (CloudWatch → email)

**SNS → Topics → Create topic**

| Câmp | Valoare |
|---|---|
| Type | Standard |
| Name | `seniorwatch-ops-alerts` |

→ **Create topic**

**Abonare email:**
SNS → Topics → `seniorwatch-ops-alerts` → **Create subscription**

| Câmp | Valoare |
|---|---|
| Protocol | Email |
| Endpoint | `ardelean.marius.ma@gmail.com` |

→ **Create subscription** → confirmă emailul primit

---

## Pas 5 — IAM Role pentru Elastic Beanstalk

Elastic Beanstalk are nevoie de un rol IAM pentru instanțele EC2.

**IAM → Roles → Create role**

| Câmp | Valoare |
|---|---|
| Trusted entity type | AWS service |
| Use case | EC2 |

→ **Next**

**Adaugă permisiuni** (caută și bifează fiecare):
- `AWSElasticBeanstalkWebTier`
- `AWSElasticBeanstalkMulticontainerDocker`
- `CloudWatchLogsFullAccess`
- `AmazonEC2ContainerRegistryReadOnly`

→ **Next**

| Câmp | Valoare |
|---|---|
| Role name | `seniorwatch-beanstalk-ec2-role` |

→ **Create role**

**Adaugă politică inline** (S3 + SNS + Secrets Manager):
IAM → Roles → `seniorwatch-beanstalk-ec2-role` → **Add permissions → Create inline policy**

Tab **JSON** → lipește:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Reports",
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::seniorwatch-reports-XXXX",
        "arn:aws:s3:::seniorwatch-reports-XXXX/*"
      ]
    },
    {
      "Sid": "SNSPublish",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:eu-central-1:ACCOUNT_ID:seniorwatch-mobile-alerts"
    }
  ]
}
```
*(înlocuiește `XXXX` și `ACCOUNT_ID` cu valorile reale)*

→ Policy name: `seniorwatch-app-permissions` → **Create policy**

---

## Pas 6 — Elastic Beanstalk

**Elastic Beanstalk → Create application**

### 6.1 Configure environment

| Câmp | Valoare |
|---|---|
| Environment tier | Web server environment |
| Application name | `seniorwatch-cloud` |
| Environment name | `seniorwatch-dev` |
| Platform | Docker |
| Platform branch | Docker running on 64bit Amazon Linux 2023 |
| Platform version | *(cea mai recentă)* |
| Application code | Sample application *(pentru acum — codul vine ulterior)* |

→ **Next**

### 6.2 Configure service access

| Câmp | Valoare |
|---|---|
| Service role | Create and use new service role |
| EC2 instance profile | `seniorwatch-beanstalk-ec2-role` |

→ **Next**

### 6.3 Set up networking, database, and tags

| Câmp | Valoare |
|---|---|
| VPC | `seniorwatch-vpc` |
| Public IP address | ✓ Activated |
| Instance subnets | ✓ `seniorwatch-public-1a`, `seniorwatch-public-1b` |

*(Nu adăuga RDS de aici — am creat deja separat)*

→ **Next**

### 6.4 Configure instance traffic and scaling

| Câmp | Valoare |
|---|---|
| Root volume type | General Purpose (SSD) |
| Size | 10 GB |
| EC2 security groups | ✓ `seniorwatch-sg-backend` |
| Instance type | `t3.small` |
| AMI ID | *(lasă default)* |

**Auto scaling:**

| Câmp | Valoare |
|---|---|
| Environment type | Load balanced |
| Min | 1 |
| Max | 2 |

→ **Next**

### 6.5 Configure updates, monitoring, and logging

| Câmp | Valoare |
|---|---|
| Health reporting | Enhanced |
| Managed updates | ✗ dezactivat |
| CloudWatch log streaming | ✓ activat |
| Retention | 30 days |

→ **Next**

### 6.6 Variabile de mediu

**Environment properties → Add:**

| Key | Value |
|---|---|
| `SERVER_PORT` | `8080` |
| `DB_HOST` | *(endpoint RDS de la Pas 2)* |
| `DB_PORT` | `5432` |
| `DB_NAME` | `seniorwatch` |
| `DB_USER` | `sw_app` |
| `DB_PASSWORD` | *(parola utilizatorului aplicație — creată la Pas 7)* |
| `JWT_SECRET` | *(string aleatoriu, min 32 caractere)* |
| `AWS_REGION_APP` | `eu-central-1` |
| `S3_REPORTS_BUCKET` | *(numele bucket-ului de la Pas 3)* |
| `SNS_ALERTS_TOPIC_ARN` | *(ARN-ul de la Pas 4.1)* |

→ **Next → Submit**

*(durează ~5 minute să pornească environment-ul)*

---

## Pas 7 — Schema baza de date

După ce RDS-ul e disponibil (status = `Available`), rulează schema SQL.

### 7.1 Conectare temporară la RDS

RDS-ul nu e public, deci ai 3 opțiuni:

**Opțiunea A — EC2 bastion (recomandat):**
Lansează un EC2 `t2.micro` în Default VPC, adaugă `seniorwatch-sg-backend` la el, conectează-te SSH și rulează psql de acolo.

**Opțiunea B — activează temporar Public Access pe RDS:**
RDS → `seniorwatch-postgres` → Modify → Connectivity → Public access = **Yes** → Apply immediately.  
*(Dezactivează după ce rulezi schema!)*

**Opțiunea C — RDS Query Editor (dacă e disponibil):**
RDS → Query Editor → selectează instanța → rulează SQL direct din consolă.

### 7.2 Creare utilizator aplicație

```sql
-- Ruleaza ca postgres
CREATE USER sw_app WITH PASSWORD 'PAROLA_APP_PUTERNICA';
GRANT CONNECT ON DATABASE seniorwatch TO sw_app;
GRANT USAGE ON SCHEMA public TO sw_app;
```

### 7.3 Rulare schema + seed

```bash
psql -h <rds-endpoint> -U postgres -d seniorwatch -f schema.sql
psql -h <rds-endpoint> -U postgres -d seniorwatch -f seed.sql
```

### 7.4 Drepturi pentru sw_app

```sql
-- Ruleaza dupa schema.sql ca postgres
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO sw_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sw_app;

-- Audit: doar INSERT (append-only, EuroRec 28)
REVOKE UPDATE, DELETE ON audit_events FROM sw_app;
```

---

## Pas 8 — CloudWatch Alarms

**CloudWatch → Alarms → Create alarm**

Creează 3 alarme:

### Alarmă 1 — Erori 5xx

| Câmp | Valoare |
|---|---|
| Metric | ApplicationELB → Per AppELB → HTTPCode_Target_5XX_Count |
| Statistic | Sum |
| Period | 5 minutes |
| Threshold | Greater than 5 |
| Alarm name | `seniorwatch-5xx-errors` |
| Notification | *(selectează `seniorwatch-ops-alerts`)* |

### Alarmă 2 — CPU ridicat

| Câmp | Valoare |
|---|---|
| Metric | EC2 → Per-Instance → CPUUtilization |
| Statistic | Average |
| Period | 5 minutes |
| Threshold | Greater than 80 |
| Alarm name | `seniorwatch-high-cpu` |
| Notification | `seniorwatch-ops-alerts` |

### Alarmă 3 — Spațiu RDS

| Câmp | Valoare |
|---|---|
| Metric | RDS → Per-Database → FreeStorageSpace |
| Statistic | Average |
| Period | 5 minutes |
| Threshold | Lower than 2147483648 (2 GB) |
| Alarm name | `seniorwatch-rds-low-storage` |
| Notification | `seniorwatch-ops-alerts` |

---

## Pas 9 — Custom Domain + HTTPS (seniorwatch.mardelean.com)

### 9.1 Certificat SSL în ACM

**ACM → Request certificate**

| Câmp | Valoare |
|---|---|
| Certificate type | Public |
| Fully qualified domain name | `seniorwatch.mardelean.com` |
| Validation method | DNS validation |

→ **Request**

ACM → Certificates → selectează certificatul → Domains → **Create records in Route 53**  
*(AWS inserează automat recordul CNAME de validare în hosted zone-ul tău)*

Așteaptă 2–5 minute → Status devine **Issued**.

### 9.2 Listener HTTPS pe Elastic Beanstalk

**EB → `seniorwatch-dev` → Configuration → Load Balancer → Edit**

Adaugă listener:

| Câmp | Valoare |
|---|---|
| Port | 443 |
| Protocol | HTTPS |
| SSL certificate | `seniorwatch.mardelean.com` *(ARN din ACM)* |

→ **Save** → **Apply** *(mediul se restartează ~3 minute)*

### 9.3 Record CNAME în Route 53

**Route 53 → Hosted zones → `mardelean.com` → Create record**

| Câmp | Valoare |
|---|---|
| Record name | `seniorwatch` |
| Record type | CNAME |
| Value | `seniorwatch-dev.xxxxxx.eu-central-1.elasticbeanstalk.com` |
| TTL | 300 |

→ **Create records**

> Propagarea DNS durează 1–5 minute. Verifică cu:  
> `curl https://seniorwatch.mardelean.com/api/v1/health`

---

## Rezumat resurse create + valorile de notat

După toți pașii, completează acest tabel cu valorile reale și păstrează-l în `.env`:

| Resursă | Valoare de notat |
|---|---|
| VPC ID | `vpc-0493050ca449fc46e` (`seniorwatch-vpc`) |
| RDS Endpoint | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |
| S3 Bucket | `seniorwatch-reports-31m9` |
| SNS Mobile ARN | `arn:aws:sns:eu-central-1:096506568929:seniorwatch-mobile-alerts` |
| EB URL (intern) | `seniorwatch-dev.xxxxxx.eu-central-1.elasticbeanstalk.com` |
| URL public | `https://seniorwatch.mardelean.com` |
| AWS Region | `eu-central-1` |

---

## Pas 10 — Auto-Shutdown / Auto-Start (economie credite)

Programul activ: **08:00–22:00 ora României (EEST = UTC+3)** = 05:00–19:00 UTC.  
Coordonare critică: RDS pornește cu 10 minute înainte de EC2.

### 10.1 EC2 — Scheduled Actions în Elastic Beanstalk

**EB → `seniorwatch-dev` → Configuration → Capacity → Scheduled actions → Add scheduled action**

**Acțiune 1 — Oprire noapte:**

| Câmp | Valoare |
|---|---|
| Name | `shutdown-night` |
| Min | 0 |
| Max | 0 |
| Desired | 0 |
| Recurrence | `0 19 * * ?` *(19:00 UTC = 22:00 EEST)* |

→ **Add**

**Acțiune 2 — Pornire dimineață:**

| Câmp | Valoare |
|---|---|
| Name | `startup-morning` |
| Min | 1 |
| Max | 2 |
| Desired | 1 |
| Recurrence | `0 5 * * ?` *(05:00 UTC = 08:00 EEST)* |

→ **Add** → **Apply**

### 10.2 RDS — Lambda + EventBridge

RDS nu are scheduled actions built-in — necesită 2 funcții Lambda.

#### Creare funcții Lambda

**Lambda → Create function** (de două ori, runtime: Python 3.12)

**Funcția 1 — `seniorwatch-rds-stop`:**

```python
import boto3

def lambda_handler(event, context):
    boto3.client('rds', region_name='eu-central-1').stop_db_instance(
        DBInstanceIdentifier='seniorwatch-postgres'
    )
```

**Funcția 2 — `seniorwatch-rds-start`:**

```python
import boto3

def lambda_handler(event, context):
    boto3.client('rds', region_name='eu-central-1').start_db_instance(
        DBInstanceIdentifier='seniorwatch-postgres'
    )
```

**Permisiuni Lambda** — pentru fiecare funcție:  
Configuration → Permissions → Execution role → Add inline policy → JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["rds:StopDBInstance", "rds:StartDBInstance"],
    "Resource": "arn:aws:rds:eu-central-1:ACCOUNT_ID:db:seniorwatch-postgres"
  }]
}
```

*(înlocuiește `ACCOUNT_ID` cu ID-ul contului tău)*

#### Creare reguli EventBridge

**EventBridge → Rules → Create rule** (de două ori, Event bus: default)

| Câmp | Stop RDS | Start RDS |
|---|---|---|
| Name | `stop-rds-night` | `start-rds-morning` |
| Rule type | Schedule | Schedule |
| Cron | `cron(0 19 * * ? *)` | `cron(50 4 * * ? *)` |
| Ora UTC | 19:00 = 22:00 EEST | 04:50 = 07:50 EEST |
| Target | Lambda `seniorwatch-rds-stop` | Lambda `seniorwatch-rds-start` |

> RDS pornește la 07:50 (04:50 UTC), EC2 pornește la 08:00 (05:00 UTC) — 10 minute buffer pentru ca DB-ul să fie `Available` înainte ca backend-ul să facă conexiuni.

### 10.3 Limitare AWS — RDS auto-restart după 7 zile

AWS repornește automat orice RDS oprit după **7 zile consecutive**. Dacă proiectul are pauze mai lungi de o săptămână, Lambda va încerca să oprească un RDS deja pornit — nu cauzează erori, dar e bine de știut.

### 10.4 Economie estimată (1 lună, $50 credite)

| Resursă | Fără schedule | Cu schedule 14h/zi | Economie |
| --- | --- | --- | --- |
| EC2 t3.small | ~$17 | ~$10 | $7 |
| RDS db.t3.micro | ~$12 | ~$7 | $5 |
| ALB (24/7) | ~$8 | ~$8 | — |
| S3 + CloudWatch + SNS | ~$2 | ~$2 | — |
| Lambda + EventBridge | — | ~$0 (free tier) | — |
| **Total** | **~$39** | **~$27** | **$12** |

**Buget rămas din $50:** ~$23 — suficient pentru depășiri sau teste extra.

---

## Verificare finală

```
✓ VPC seniorwatch-vpc creat cu 4 subnets + IGW
✓ RDS status = Available (în subnet privat)
✓ EB environment health = Green
✓ ACM certificate status = Issued
✓ GET https://seniorwatch.mardelean.com/api/v1/health → 200 OK
✓ Email de confirmare primit de la SNS ops-alerts
✓ schema.sql rulat cu succes pe RDS
✓ EB Scheduled Actions: shutdown-night + startup-morning active
✓ EventBridge Rules: stop-rds-night + start-rds-morning active
```
