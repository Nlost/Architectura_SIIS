# AWS Resources — SeniorWatch (stare curentă)

**Cont AWS:** credite studențești  
**Regiune:** `eu-central-1` (Frankfurt)  
**Ultima actualizare:** 2026-05-13

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

---

## ✅ Pas 2 — RDS PostgreSQL

| Câmp | Valoare |
|---|---|
| Identifier | `seniorwatch-postgres` |
| Engine | PostgreSQL 18.3-R1 |
| Instance class | `db.t3.micro` |
| Storage | 20 GB gp2 |
| Multi-AZ | No |
| Public access | No |
| VPC | `seniorwatch-vpc` |
| Subnet group | `seniorwatch-db-subnet-group` |
| Security group | `seniorwatch-sg-rds` |
| Database name | `seniorwatch` |
| Master user | `postgres` |
| Backup retention | 7 zile |
| **Endpoint** | `seniorwatch-postgres.ckaqkenutyfa.eu-central-1.rds.amazonaws.com` |

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
| Politici managed | `AWSElasticBeanstalkWebTier`, `AWSElasticBeanstalkMulticontainerDocker`, `CloudWatchLogsFullAccess`, `AmazonEC2ContainerRegistryReadOnly` |
| Politică inline | `seniorwatch-app-permissions` — S3 (`seniorwatch-reports-31m9`) + SNS Publish (`seniorwatch-mobile-alerts`) |

---

## 🔄 Pas 6 — Elastic Beanstalk (în curs)

| Câmp | Valoare |
|---|---|
| Application name | `seniorwatch-cloud` |
| Environment name | `seniorwatch-dev` |
| Platform | Docker / Amazon Linux 2023 |
| Instance type | `t3.small` |
| VPC | `vpc-0493050ca449fc46e` |
| Subnets instanțe | `seniorwatch-public-1a`, `seniorwatch-public-1b` |
| Security group | `seniorwatch-sg-backend` |
| EC2 instance profile | `seniorwatch-beanstalk-ec2-role` |
| EB URL | *(de completat după creare)* |

---

## ⬜ Pași rămași

| Pas | Descriere |
|---|---|
| 7 | Schema DB — conectare RDS + rulare `schema.sql` + `seed.sql` |
| 8 | CloudWatch Alarms (5xx, CPU, RDS storage) |
| 9 | Custom domain `seniorwatch.mardelean.com` + HTTPS (ACM + Route53) |
| 10 | Auto-shutdown/start (EB Scheduled Actions + Lambda + EventBridge pentru RDS) |
