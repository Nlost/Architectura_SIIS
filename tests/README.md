# Tests – SeniorWatch

Acest folder conține testele automate pentru cele două componente
software ale platformei SeniorWatch:

```
tests/
├── web/         # teste unitare pentru aplicația React (Jest + @testing-library)
└── embedded/    # teste unitare pentru firmware-ul ESP32 (Unity + PlatformIO)
```

Fiecare subfolder are propriul `README.md` cu instrucțiunile de rulare,
pentru că cele două ecosisteme (Node.js și PlatformIO) folosesc tooling
diferit.

## Cum se rulează pe scurt

| Componentă | Comandă | Director de lucru |
| --- | --- | --- |
| Web (React)        | `npm install && npm test`         | `tests/web` |
| Embedded (ESP32)   | `pio test -e native`              | `tests/embedded` |

> Pentru detalii (dependențe, structura cazurilor de test, debugging),
> vezi `tests/web/README.md` și `tests/embedded/README.md`.

## Convenție de denumire

- `*.test.js` pentru testele web (Jest îi descoperă automat).
- `test_<modul>/test_main.cpp` pentru testele embedded
  (convenția impusă de PlatformIO Unit Testing).

## Cod testat

### Web

- `src/web/src/utils/fhirXmlBuilder.js` – generator de bundle FHIR R4 XML.
- `src/web/src/api.js` – wrapper-ele `fetch` către backend-ul Spring Boot.

### Embedded

- `src/embedded/include/SensorAggregator.h` – mediere date senzori pe
  fereastră de 10 secunde.
