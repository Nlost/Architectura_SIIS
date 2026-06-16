# Embedded tests (Unity + PlatformIO)

Teste unitare pentru firmware-ul SeniorWatch din `src/embedded`. Rulează
pe dev host (env `native`), nu pe ESP32, deci nu ai nevoie de hardware.

## Cerinte

- [PlatformIO Core](https://platformio.org/install/cli) (`pip install platformio`)
- Un compilator C++ de host (g++ pe Linux/macOS, MSVC/MinGW pe Windows).

## Rulare

```bash
cd tests/embedded
python -m platformio test -e native
```

> Daca `pio` nu e in PATH (Python din Microsoft Store), foloseste
> `python -m platformio` in loc de `pio`.

Vei vedea output Unity de forma:

```
test_sensor_aggregator/test_main.cpp:42: PASSED
=====  6 tests, 0 failures =====
```

## Structura

```
tests/embedded/
├── platformio.ini
├── README.md
├── lib/
│   ├── ArduinoStub/          # stub pentru Arduino.h / DHT.h pe host
│   └── SeniorWatchCore/      # leaga SensorAggregator.cpp
│       └── library.json
└── test/
    └── test_sensor_aggregator/
        └── test_main.cpp     # SensorAggregator -> mediere senzori
```

`platformio.ini` redirectioneaza `include_dir` catre `src/embedded`, iar
biblioteca locala `SeniorWatchCore` compileaza si leaga in teste doar
`SensorAggregator.cpp` (fara `main.cpp`).
PlatformIO nu include automat fisierele din `src/` la build-ul de test.

## Ce este acoperit

### `test_sensor_aggregator`

- `start()` reseteaza index-ul de esantioane;
- `addSample()` adauga date in buffer;
- `computeAverageFrame()` ignora valorile HR in afara intervalului
  fiziologic 30–220 bpm;
- `computeAverageFrame()` marcheaza env ca invalid daca nu exista
  esantioane valide;
- `isReady()` devine `true` doar dupa 10 secunde (`millis()` stub).

## De ce stub pentru Arduino?

Codul firmware include `Arduino.h`, `DHT.h` etc., disponibile doar la
build cu toolchain-ul ESP32. Pentru a putea testa logica pura pe host,
`lib/ArduinoStub/` reimplementeaza minimul necesar:
`millis()`, `Serial.println()`, tipurile `uint8_t/uint16_t/...`, clasa
`DHT`. Pentru testul de `millis()` exista helper-ul
`__testSetMillis(value)` care permite avansarea timpului virtual.
