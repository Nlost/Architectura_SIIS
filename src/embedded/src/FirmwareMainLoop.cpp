#include "FirmwareMainLoop.h"

void FirmwareMainLoop::init()
{
    Serial.println("[Firmware] Starting...");

    board.initializeBoard();

    pulseOx.init(32);
    env.init(27);
    ecg.init(34, 26, 25);
    builder.init(&pulseOx, &env, &ecg);

    aggregator.start();

    ble.startBlePeripheral("WH-0001");

    ble.onClientConnected(
    [](String addr)
    {
        Serial.print("Client: ");
        Serial.println(addr);
    }
);

ble.onClientDisconnected(
    []()
    {
        Serial.println("Client disconnected");
    }
);

    Serial.println("[Firmware] Init complete");
}

SensorFrame FirmwareMainLoop::runMeasurementCycle()
{
    return builder.assembleTenSecondFrame(seq++);
}

void FirmwareMainLoop::handleBleStatus()
{
    if (ble.getConnectionState() ==
        BleConnectionState::CONNECTED)
    {
        Serial.println("[BLE] Connected");
    }
}

void FirmwareMainLoop::loop()
{
    handleBleStatus();

    unsigned long now = millis();

    // =========================
    // 🟢 0. ECG STREAM CONTINUU (~200 Hz)
    // =========================
    // Trimite un eșantion ECG la fiecare ECG_INTERVAL ms, fără
    // blocare, ca să nu mai depindă de ciclul de 1 secundă.
    if (now - lastEcgTime >= (unsigned long)ECG_INTERVAL)
    {
        lastEcgTime = now;

        if (!ecg.isLeadOff())
        {
            ble.sendEcgStream(ecg.readRaw());
        }
    }

    // =========================
    // 🟢 1. COLECTARE LA 1 SEC
    // =========================
    if (now - lastSampleTime >= SAMPLE_INTERVAL)
    {
        lastSampleTime = now;

        SensorFrame frame = runMeasurementCycle();

        aggregator.addSample(frame);

        // LIVE DEBUG (opțional)
        Serial.print("[LIVE] HR: ");
        Serial.print(frame.pulseOx.heartRateBpm);

        

        Serial.print(" | T: ");
        Serial.print(frame.env.tempCelsius);

        Serial.print(" | H: ");
        Serial.println(frame.env.humidityPct);

        Serial.print("ECG count: ");
        Serial.println(frame.ecg.sampleCount);
    }

    // =========================
    // 🟢 2. FINAL LA 10 SEC
    // =========================
    if (now - lastFrameTime >= FRAME_INTERVAL)
{
    lastFrameTime = now;

    SensorFrame avg =
        aggregator.computeAverageFrame(seq++);

    ble.sendFrameNotification(avg);

    aggregator.reset();   // 🔥 AICI ESTE CORECT

    Serial.println("=== DATA SENT VIA BLE (AVERAGE) ===");

    Serial.print("SEQ FINAL: ");
    Serial.println(avg.seqNumber);
}




    // Loop rapid: ECG_INTERVAL este 5 ms (~200 Hz), deci nu putem
    // bloca 10 ms aici sau am rata eșantioanele ECG.
    delay(1);
}