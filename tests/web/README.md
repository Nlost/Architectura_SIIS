# Web tests (Jest)

Teste unitare pentru aplicația React din `src/web`.

## Setup

```bash
cd tests/web
npm install
```

## Rulare

```bash
npm test            # rulează toate testele o singură dată
npm run test:watch  # mod watch
```

## Structură

```
tests/web/
├── package.json
├── jest.config.js
├── babel.config.js
└── unit/
    ├── fhirXmlBuilder.test.js   # generator de Bundle FHIR R4 XML
    └── api.test.js              # wrappere fetch către backend
```

Testele importă direct codul sursă din `../../src/web/src/...`, deci nu
e nevoie să publici biblioteci separate – se rulează pe codul real.

## Ce este acoperit

### `fhirXmlBuilder.test.js`

- maparea sex M/F/O/altul către `gender` FHIR;
- construcția unui resource `Patient` complet (identifier CNP, name,
  telecom, address);
- construcția resursei `Observation` pentru semne vitale (puls, SpO2,
  temperatură, umiditate);
- generarea bundle-ului final și prezența header-ului XML / tag-ului
  `<Bundle xmlns="http://hl7.org/fhir">`;
- escape-ul corect al caracterelor speciale XML (`&`, `<`, `>`, `"`, `'`).

### `api.test.js`

- `loginUser` apelează `POST /api/auth/login` cu credențialele și
  parsează răspunsul JSON;
- `loginUser` aruncă eroare pe răspuns `4xx/5xx`;
- `getPatients` adaugă header-ul `Authorization: Bearer <token>` din
  `localStorage`;
- `logoutUser` curăță cheile `sw_token`, `sw_role`, `sw_email`.

`fetch` și `localStorage` sunt mock-uite prin `jest.fn()` /
`@testing-library/jest-environment-jsdom`.
