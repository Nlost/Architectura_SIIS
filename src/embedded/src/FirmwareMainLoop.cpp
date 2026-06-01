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
    // 🟢 1. COLECTARE LA 1 SEC
    // =========================
    if (now - lastSampleTime >= SAMPLE_INTERVAL)
    {
        lastSampleTime = now;

        SensorFrame frame = runMeasurementCycle();

        if (!frame.ecg.leadOff && frame.ecg.sampleCount > 0)
        {
            ble.sendEcgStart();

            for (int i = 0; i < frame.ecg.sampleCount; i++)
            {
                ble.sendEcgValue(frame.ecg.rawAdcValues[i]);
            }

        ble.sendEcgEnd();

        Serial.println("[ECG STREAM SENT]");
    }


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




    // ❌ scoate sleep-ul agresiv
    delay(10);
}