#include "BlePeripheral.h"

#define SERVICE_UUID        "0000FF01-0000-1000-8000-00805F9B34FB"
#define CHARACTERISTIC_UUID "0000FF02-0000-1000-8000-00805F9B34FB"

BlePeripheral* BlePeripheral::instance = nullptr;

class InternalServerCallbacks :
    public BLEServerCallbacks
{
    void onConnect(BLEServer* pServer) override
    {
        if (BlePeripheral::instance == nullptr)
            return;

        BlePeripheral::instance->connectionState =
            BleConnectionState::CONNECTED;

        Serial.println("[BLE] Client connected");

        if (BlePeripheral::instance->connectCallback)
{
    BlePeripheral::instance
        ->connectCallback(
            String("CONNECTED")
        );
}
    }

    void onDisconnect(BLEServer* pServer) override
    {
        if (BlePeripheral::instance == nullptr)
            return;

        BlePeripheral::instance->connectionState =
            BleConnectionState::DISCONNECTED;

        Serial.println("[BLE] Client disconnected");

        BLEDevice::startAdvertising();

        if (BlePeripheral::instance->disconnectCallback)
        {
            BlePeripheral::instance
                ->disconnectCallback();
        }
    }
};

void BlePeripheral::startBlePeripheral(
    String deviceName
)
{
    instance = this;

    BLEDevice::init(deviceName.c_str());

    server = BLEDevice::createServer();

    server->setCallbacks(
        new InternalServerCallbacks()
    );

    BLEService* service =
        server->createService(
            SERVICE_UUID
        );

    txCharacteristic =
        service->createCharacteristic(
            CHARACTERISTIC_UUID,
            BLECharacteristic::PROPERTY_NOTIFY
        );

    txCharacteristic->addDescriptor(
        new BLE2902()
    );

    service->start();

    BLEAdvertising* advertising =
        BLEDevice::getAdvertising();

    advertising->start();

    Serial.println(
        "[BLE] Advertising started"
    );
}

BleConnectionState
BlePeripheral::getConnectionState()
{
    return connectionState;
}

bool BlePeripheral::sendFrameNotification(
    const SensorFrame& frame
)
{
    Serial.println("[BLE] Trying to send frame...");

    if (connectionState !=
        BleConnectionState::CONNECTED)
    {
        return false;
    }

    // =========================
    // Construire mesaj text
    // FORMAT:
    // puls;temperatura;umiditate;ecgStatus
    // =========================

    String ecgStatus = "Normal";

    String message =
        String((int)frame.pulseOx.heartRateBpm) + ";" +
        String(frame.env.tempCelsius, 1) + ";" +
        String(frame.env.humidityPct, 1) + ";" +
        ecgStatus;

    // DEBUG SERIAL
    Serial.print("[BLE] TEXT SENT: ");
    Serial.println(message);

    // Trimite TEXT prin BLE
    txCharacteristic->setValue(
        message.c_str()
    );

    txCharacteristic->notify();

    Serial.println("[BLE] Text notification sent");

    return true;
}
void BlePeripheral::onClientConnected(
    ConnectCallback cb
)
{
    connectCallback = cb;
}

void BlePeripheral::onClientDisconnected(
    DisconnectCallback cb
)
{
    disconnectCallback = cb;
}