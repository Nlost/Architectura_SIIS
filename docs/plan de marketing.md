---
title: ""
---

<div class="cover-page">

<h1 class="cover-title">PLAN DE MARKETING</h1>
<h2 class="cover-subtitle">SeniorWatch – Sistem de Teleasistență la Domiciliu</h2>

<hr class="cover-rule" />

<h3 class="cover-section">Identificarea Proiectului</h3>

| | |
|---|---|
| **Cod proiect:** | MPSAM-2026-AAL-01 |
| **Titlu proiect:** | SeniorWatch – Sistem de Teleasistență la Domiciliu a Persoanelor în Vârstă |
| **Versiune document:** | 1.3 |
| **Data lansării:** | 26.03.2026 |
| **Data estimată finalizare:** | 17.06.2026 |
| **Client:** | Fundația „Bătrânii sunt ai noștri" |
| **Contact client:** | Dr. Ionescu Gheorghe \| fundatiabatriniisuntainostri@fbs.ro |

</div>

<div class="page-break"></div>

## Cuprins {#cuprins}

1. [Colectivul de realizare](#colectivul-de-realizare)
2. [Calculul de stabilire a costurilor](#calculul-de-stabilire-a-costurilor)
3. [Segmentul-țintă](#segmentul-tinta)
4. [Comparație cu produsele concurente (performanțe, prețuri)](#comparatie-cu-produsele-concurente)
5. [Propunere de preț cu justificare](#propunere-de-pret-cu-justificare)
6. [Estimarea volumului total de vânzări](#estimarea-volumului-total-de-vanzari)
7. [Preliminarea vânzărilor pe 2 ani](#preliminarea-vanzarilor-pe-2-ani)
8. [Proiectarea campaniei de marketing](#proiectarea-campaniei-de-marketing)
   - [Metode](#metode)
   - [Conținut](#continut)
   - [Mod de derulare](#mod-de-derulare)
9. [Materiale promoționale](#materiale-promotionale)
10. [Analiza riscurilor și a modului de minimizare a acestora](#analiza-riscurilor)
11. [Concluzii referitoare la returnarea investiției](#concluzii-roi)

<div class="page-break"></div>

## Colectivul de realizare {#colectivul-de-realizare}

| Rol | Membru |
|---|---|
| Programator-șef | Balan Dan |
| Ajutor programator-șef | Ardelean Marius |
| Secretar / Manager | Balan Cristina |
| Programator (Firmware ESP32) | Mathe Alexandra |
| Programator (Web – medic) | Morgovan Raluca |
| Programator (Web – pacient & rapoarte) | Nicola Larisa |
| Programator (Aplicație mobilă Android) | Cotolan Denisa |

## Calculul de stabilire a costurilor {#calculul-de-stabilire-a-costurilor}

Costurile sunt structurate pe categoriile de efort și de operare ale proiectului. Manopera echipei a fost dimensionată pe baza pachetelor WBS din Fișa de lansare a proiectului (Specificații, Proiectare, Implementare, Testare, Management & Marketing), iar costurile recurente acoperă infrastructura AWS.

### Cercetare, dezvoltare și manoperă echipă: 4.000 EUR

- Analiza temei tehnice, specificații funcționale/nefuncționale și documentație de proiectare.
- Codificarea celor patru module (firmware ESP32, aplicație mobilă, aplicație web, backend Cloud AWS).
- Integrarea HL7/FHIR și testarea de sistem, integrare și acceptanță.

Efortul este dimensionat pe pachetele WBS: echipă de 7 persoane, ~10 săptămâni (26.03–17.06.2026), **~400 ore-om × 10 EUR/oră ≈ 4.000 EUR** (tarif mediu academic / echipă de proiect).

### Producția de hardware (kit-uri de senzori): 12.000 EUR

- Achiziția modulelor ESP32 și a senzorilor (ECG AD8232, senzor puls SEN-11574, DHT11).
- Asamblare, carcasare purtabilă, calibrare și testare a kit-urilor.
- Producție în serie mică pentru pilot și demonstrații.

**Bill of Materials (BOM) estimat per kit — prețuri listă producător / distribuitor (iunie 2026):**

| Componentă | Referință | Preț unitar (EUR) | Link |
|---|---|---:|---|
| Placă ESP32 DevKit | Espressif ESP32-DevKitC-32E | 11,00 | [Espressif ESP32-DevKitC](https://www.espressif.com/en/products/devkits/esp32-devkitc) · [DigiKey](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-DEVKITC-32E/12091810) |
| Senzor ECG | SparkFun SEN-12650 (AD8232) | 22,50 | [SparkFun SEN-12650](https://www.sparkfun.com/sparkfun-single-lead-heart-rate-monitor-ad8232.html) |
| Senzor puls | SparkFun SEN-11574 (Pulse Sensor) | 27,50 | [SparkFun SEN-11574](https://www.sparkfun.com/products/11574) |
| Senzor ambiental | Adafruit DHT11 (#386) | 5,50 | [Adafruit DHT11](https://www.adafruit.com/product/386) |
| PCB, cabluri, baterie LiPo, carcasă, electrozi | — | 30,00 | Estimare atelier + carcasare serie mică |
| Manoperă asamblare + test | — | 23,50 | Calibrare senzori, test BLE, control calitate |
| **Total BOM + asamblare** | | **120,00 EUR/kit** | |

**Verificare buget:** 100 kit-uri × 120 EUR = **12.000 EUR**

### Software, infrastructură Cloud și licențe: 6.000 EUR

- Provizionare AWS (Elastic Beanstalk / EC2, Amazon RDS PostgreSQL, Amazon S3, CloudFront, SNS).
- Licențe pentru mediile de dezvoltare și certificate de securitate.
- Testare, integrare continuă și hardening de securitate.

Estimare costuri AWS lunare (pilot): Elastic Beanstalk + RDS ~30–50 EUR/lună; total an 1 ~5.000–6.000 EUR (inclusiv securitate, CI/CD, domeniu).

### Marketing și distribuție: 3.000 EUR

- Materiale promoționale (broșuri, pliante).
- Publicitate online și pe rețele sociale.
- Participare la târguri și conferințe medicale.

### Rezumat costuri

| Categorie | Cost estimat |
|---|---:|
| Cercetare, dezvoltare și manoperă echipă | 4.000 EUR |
| Producția de hardware (kit-uri senzori) | 12.000 EUR |
| Software, infrastructură Cloud AWS și licențe | 6.000 EUR |
| Marketing și distribuție | 3.000 EUR |
| **Cost total estimat** | **25.000 EUR** |

## Segmentul-țintă {#segmentul-tinta}

1. **Persoane vârstnice care locuiesc singure** — segmentul principal, conform misiunii Fundației „Bătrânii sunt ai noștri": persoane peste 65 de ani, în special cele cu boli cronice (cardiovasculare, diabet) sau cu risc ridicat de accidente domestice.
2. **Familii, aparținători și îngrijitori** — monitorizare în timp real și alerte imediate pe smartphone.
3. **Medici de familie și supraveghetori dispecerat** — fișă pacient, grafice, istoric alarme.
4. **Fundații, ONG-uri și centre de îngrijire la domiciliu** — teleasistență scalabilă.
5. **Clinici, spitale și cabinete medicale** — monitorizare post-spitalizare cu HL7/FHIR.
6. **Autorități și programe de sănătate publică / asistență socială**.
7. **Case de asigurări de sănătate** — reducerea spitalizărilor evitabile.
8. **Pacienți de vârstă medie cu afecțiuni cronice** (50–65 ani) — monitorizare preventivă.

## Comparație cu produsele concurente (performanțe, prețuri) {#comparatie-cu-produsele-concurente}

### Produsul nostru: SeniorWatch

SeniorWatch este un sistem integrat de teleasistență la domiciliu, distribuit pe patru straturi interconectate printr-un Cloud AWS central: modul ESP32 cu senzori (BLE), aplicație mobilă Android offline-first, aplicație web pentru medic și infrastructură Cloud (Elastic Beanstalk, RDS PostgreSQL, S3).

**Performanțe:**

| Parametru | SeniorWatch |
|---|---|
| Monitorizare fiziologică | ECG (AD8232), puls (SEN-11574), temperatură |
| Monitorizare ambientală | Temperatură, umiditate (DHT11) |
| Timp alarmare | Sub 10 secunde |
| Portal medic | Fișă pacient, ICD-10, grafice, istoric alarme |
| Interoperabilitate | HL7 v2.5 / FHIR R4 |
| Mod offline | Da (sincronizare automată la reconectare) |
| Conformitate | GDPR, audit append-only |

**Preț:** kit hardware **180 EUR/unitate** + abonament **15 EUR/lună**.

### Concurent A – brățară de monitorizare de consum (Fitbit Charge 6)

| Parametru | Concurent A |
|---|---|
| Produs | [Fitbit Charge 6](https://store.google.com/ie/product/fitbit_charge_6?hl=en-GB) |
| Monitorizare | Puls, activitate, SpO₂, somn (fără ECG dedicat clinic) |
| Portal medic | Nu |
| Interoperabilitate clinică | Nu (fără HL7/FHIR) |
| Orientare | Fitness / consum |
| **Preț** | **159,95 EUR/unitate** (Google Store IE, iunie 2026) |

Alternativă în aceeași categorie: [Garmin Vivosmart 5](https://www.coolblue.be/en/product/904542/garmin-vivosmart-5-black-l.html) — **122 EUR** (promoție Coolblue).

### Concurent B – platformă de monitorizare la distanță (Withings RPM)

| Parametru | Concurent B |
|---|---|
| Platformă | [Withings Health Solutions — RPM](https://www.withings.com/eu/en/health-solutions) |
| Dispozitiv exemplu | [Withings BPM Connect](https://www.withings.com/eu/en/bpm-connect) (tensiune + puls) |
| Monitorizare | Parametri vitali (fără ECG continuu la domiciliu în pachetul de bază) |
| Portal furnizor | Da (Health Mate / RPM) |
| Interoperabilitate | Limitată (fără HL7/FHIR în oferta standard) |
| Mod offline | Parțial (sincronizare Wi-Fi / Bluetooth) |
| **Preț dispozitiv** | **~105–130 EUR** ([Otto](https://www.otto.de/p/withings-oberarm-blutdruckmessgeraet-wireless-blood-pressure-monitor-bpm-connect-C920987073/), [Amazon DE](https://www.amazon.de/dp/B07SJV1HNR)) |
| **Abonament** | **9,95 EUR/lună** (Withings+, după perioada de probă) |

Alternativă premium: [Withings ScanWatch 2](https://www.withings.com/eu/en/scanwatch-2) — **349,95 EUR** + Withings+ 9,95 EUR/lună (ECG pe cerere, fără portal medical complet).

### Concluzie

SeniorWatch combină monitorizarea fiziologică continuă (ECG, puls, temperatură), alarmarea automată sub 10 secunde, aplicația dedicată medicului și interoperabilitatea HL7/FHIR, la **180 EUR** — poziționat între wearables de consum (122–160 EUR) și platformele RPM Withings (dispozitiv + abonament, fără ECG continuu și fără portal medical complet).

## Propunere de preț cu justificare {#propunere-de-pret-cu-justificare}

**Preț propus:** **180 EUR/kit** (hardware) + **15 EUR/lună** abonament de monitorizare și serviciu Cloud AWS.

### Justificare preț kit hardware (180 EUR)

| Element | Valoare | Explicații |
|---|---:|---|
| Cost direct BOM + asamblare | 120 EUR/kit | Componente + manoperă (vezi tabelul BOM) |
| Amortizare software | 3 EUR/kit | Repartizare din bugetul R&D de 4.000 EUR pe ~1.300 kit-uri estimate |
| Marjă canal distribuție | 57 EUR/kit | Parteneri instituționali (Fundație, clinici) |
| **Total** | **180 EUR/kit** | Peste Fitbit Charge 6 (160 EUR), sub ScanWatch 2 (350 EUR) |

```
Preț kit ≈ BOM (120 EUR) + amortizare software (3 EUR) + marjă canal (57 EUR) ≈ 180 EUR
```

### Justificare abonament (15 EUR/lună)

| Element | Valoare | Explicații |
|---|---:|---|
| Infrastructură AWS per utilizator | 0,50–2 EUR/lună | Cost fix AWS împărțit la baza de utilizatori |
| Suport și actualizări | 2–3 EUR/lună | Securitate, mentenanță, actualizări |
| Valoare clinică | — | Portal medic, HL7/FHIR, alerte sub 10 s |
| **Total** | **15 EUR/lună** | Peste Withings+ (9,95 EUR), sub cost RPM clinic complet |

### Argumente comerciale

1. **Sistem complet** — kit ESP32 + senzori, aplicație mobilă, portal web medic, infrastructură AWS.
2. **Monitorizare multi-parametru** — ECG, puls, temperatură; alarmare sub 10 s; mod offline-first.
3. **Valoare clinică** — fișă consolidată, ICD-10, interoperabilitate HL7/FHIR.
4. **Conformitate** — GDPR, criptare, JWT, audit append-only.

Modelul „kit + abonament" face soluția accesibilă la achiziție și asigură sustenabilitatea operării Cloud pe termen lung.

## Estimarea volumului total de vânzări {#estimarea-volumului-total-de-vanzari}

Estimarea pornește de la canalul principal (Fundația „Bătrânii sunt ai noștri" și rețeaua sa de beneficiari și parteneri sociali) și de la extinderea graduală către clinici, centre de îngrijire și case de asigurări.

| Perioadă | Segment | Estimare vânzări |
|---|---|---:|
| Anul 1 | Beneficiari Fundație, familii, medici de familie | 1.500 kit-uri |
| Anul 2 | Clinici, centre de îngrijire, asiguratori | 6.000 kit-uri |
| **Total 2 ani** | | **7.500 kit-uri** |

La aceasta se adaugă veniturile recurente din abonamentul de monitorizare, care cresc cumulativ pe măsură ce baza instalată se mărește.

## Preliminarea vânzărilor pe 2 ani {#preliminarea-vanzarilor-pe-2-ani}

Veniturile provin din două surse: vânzarea kit-urilor (180 EUR/kit) și abonamentul lunar (15 EUR/lună). Pentru abonamente: medie **6 luni** active în anul 1 (vânzări eșalonate) și **12 luni** în anul 2 (baza instalată cumulată).

### Anul 1

| Sursă | Calcul | Venit |
|---|---|---:|
| Hardware | 1.500 × 180 EUR | 270.000 EUR |
| Abonament | 1.500 × 15 EUR × 6 luni | 135.000 EUR |
| **Total an 1** | | **405.000 EUR** |

### Anul 2

| Sursă | Calcul | Venit |
|---|---|---:|
| Hardware | 6.000 × 180 EUR | 1.080.000 EUR |
| Abonament | 7.500 × 15 EUR × 12 luni | 1.350.000 EUR |
| **Total an 2** | | **2.430.000 EUR** |

### Total pe 2 ani

| Sursă | Anul 1 | Anul 2 | Total |
|---|---:|---:|---:|
| Hardware (kit-uri) | 270.000 EUR | 1.080.000 EUR | 1.350.000 EUR |
| Abonament monitorizare | 135.000 EUR | 1.350.000 EUR | 1.485.000 EUR |
| **Total** | **405.000 EUR** | **2.430.000 EUR** | **2.835.000 EUR** |

Pentru scenariu conservator (**139 kit-uri** în anul 1), veniturile din hardware (25.020 EUR) acoperă investiția inițială de **25.000 EUR**.

## Proiectarea campaniei de marketing {#proiectarea-campaniei-de-marketing}

### Metode {#metode}

1. **Parteneriate cu fundații, ONG-uri și autorități locale** — colaborare directă cu Fundația „Bătrânii sunt ai noștri" și cu direcțiile de asistență socială pentru programe pilot.
2. **Parteneriate cu clinici, spitale și medici de familie** — demonstrații, studii de caz și kit-uri pentru testare la cabinete medicale.
3. **Publicitate online și pe rețele sociale** — Google Ads (căutare și remarketing), campanii pe Facebook, YouTube și LinkedIn (segment instituțional).
4. **Participare la târguri și conferințe** — evenimente medicale și de asistență socială, prezentarea prototipului funcțional.

### Conținut {#continut}

- Testimoniale de la pacienți, familii și medici (mărturii scrise despre reacția rapidă în urgențe).
- Articole, ghiduri și studii de caz despre teleasistență și monitorizarea continuă la domiciliu.
- Conținut educativ publicat pe blog și în reviste de profil.

### Mod de derulare {#mod-de-derulare}

1. **Lansare inițială (campanie de 3 luni)** — campanie intensivă online și offline: anunțuri Google și social media, eveniment de lansare cu Fundația, prezentarea prototipului.
2. **Activități lunare** — actualizări pe blog, newsletter instituțional către clinici și centre de îngrijire.
3. **Evenimente trimestriale** — participare la târguri, demonstrații live, sesiuni de instruire pentru parteneri.

| Perioadă | Acțiuni | Materiale | Periodicitate |
|---|---|---|---|
| Luna 1–3 | Lansare, conștientizare | Broșuri, pliante, postări social media | Săptămânal |
| Lunar | Blog, newsletter | Articole, studii de caz | Lunar |
| Trimestrial | Târguri, webinarii | Demonstrații live, pliante | La 3 luni |

## Materiale promoționale {#materiale-promotionale}

| Material | Descriere | Utilizare |
|---|---|---|
| Broșuri și pliante | Funcționalități SeniorWatch: ECG/puls/temperatură, alarmare <10 s, portal medic, GDPR | Clinici, Fundație, târguri |
| Testimoniale scrise | Mărturii îngrijitori și medici despre intervenții rapide | Site, broșuri, evenimente |
| Demonstrații live / webinarii | Flux monitorizare, alarmare, interoperabilitate HL7/FHIR | Parteneri instituționali |

## Analiza riscurilor și a modului de minimizare a acestora {#analiza-riscurilor}

### Riscuri

| # | Risc | Descriere | Impact |
|---|---|---|---|
| 1 | Acceptarea de către vârstnici | Reticență față de tehnologie nouă | Adoptare lentă |
| 2 | Concurență | Wearables ieftine și platforme RPM pe piață | Presiune pe preț, cotă redusă |
| 3 | Fiabilitate alarmare | Alertă ratată sau întârziată (>10 s) | Pierdere încredere, risc reputațional |
| 4 | Securitate / GDPR | Date medicale sensibile | Sancțiuni, pierdere parteneri |

### Minimizare

| # | Acțiuni | Rezultate așteptate |
|---|---|---|
| 1 | UI simplificată, configurare asistată de îngrijitor, ghiduri | Creșterea gradului de acceptare |
| 2 | Diferențiere sistem complet vs. wearables; actualizări software | Menținerea avantajului competitiv |
| 3 | Evaluare locală alarme pe mobil, offline-first, testare <10 s | Alarmare consecventă și de încredere |
| 4 | Criptare, JWT, audit append-only, backup periodic | Conformitate GDPR, încredere instituțională |

## Concluzii referitoare la returnarea investiției {#concluzii-roi}

### Investiție și costuri

| Categorie | Valoare |
|---|---:|
| Cost total proiect | 25.000 EUR |
| Din care marketing și distribuție | 3.000 EUR |
| Cost producție hardware (pilot) | 12.000 EUR |
| Cost dezvoltare software (manoperă echipă) | 4.000 EUR |
| Cost infrastructură Cloud AWS | 6.000 EUR |

### Venituri estimate (2 ani)

| Indicator | Valoare |
|---|---:|
| Venituri totale estimate | 2.835.000 EUR |
| Venituri an 1 | 405.000 EUR |
| Venituri an 2 | 2.430.000 EUR |
| Prag conservator ROI | ~139 kit-uri (25.000 EUR hardware) |

### Analiză ROI

Având în vedere costul total de **25.000 EUR** (inclusiv **3.000 EUR** pentru marketing) în contrast cu veniturile estimate de **2.835.000 EUR** pe primii doi ani, returnarea investiției este puternic profitabilă. Investiția se recuperează din vânzarea a aproximativ **139 kit-uri** (139 × 180 EUR = 25.020 EUR), echivalentul unui program pilot extins prin Fundație.

Modelul „kit + abonament" oferă un dublu avantaj: venit imediat din hardware (180 EUR/kit) și flux recurent stabil din abonament (15 EUR/lună), care crește odată cu baza instalată.

### Impactul riscurilor asupra ROI

Riscurile identificate (acceptarea de către vârstnici, concurența, fiabilitatea alarmării, conformitatea GDPR) sunt acoperite de strategiile de minimizare din secțiunea anterioară. Chiar în scenarii prudente, marja rămâne semnificativă față de investiția redusă de 25.000 EUR (manoperă la 10 EUR/oră).

Dincolo de rentabilitatea financiară, SeniorWatch are valoare socială ridicată: reduce timpul de reacție în urgențe, sprijină independența persoanelor vârstnice la domiciliu și răspunde misiunii Fundației „Bătrânii sunt ai noștri".
