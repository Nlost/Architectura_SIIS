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

    ecgCharacteristic =
    service->createCharacteristic(
        "0000FF03-0000-1000-8000-00805F9B34FB",
        BLECharacteristic::PROPERTY_NOTIFY
    );

ecgCharacteristic->addDescriptor(new BLE2902());

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

bool BlePeripheral::sendFrameNotification(const SensorFrame& frame)
{
    Serial.println("[BLE] Trying to send frame...");

    if (connectionState != BleConnectionState::CONNECTED)
        return false;

    char buffer[80];

    snprintf(buffer, sizeof(buffer),
        "%d;%.1f;%.1f",
        (int)frame.pulseOx.heartRateBpm,
        frame.env.tempCelsius,
        frame.env.humidityPct
    );

    Serial.print("[BLE] TEXT SENT: ");
    Serial.println(buffer);

    txCharacteristic->setValue((uint8_t*)buffer, strlen(buffer));
    txCharacteristic->notify();

    Serial.println("[BLE] Text notification sent");

    return true;
}

bool BlePeripheral::sendEcgStream(uint16_t value)
{
    if (connectionState != BleConnectionState::CONNECTED)
        return false;

    char buf[16];

    snprintf(buf, sizeof(buf), "%u", value);

    Serial.print("[ECG BLE] ");
    Serial.println(buf);   // 🔥 DEBUG IMPORTANT

    ecgCharacteristic->setValue((uint8_t*)buf, strlen(buf));
    ecgCharacteristic->notify();

    return true;
}

bool BlePeripheral::sendEcgStart()
{
    if (connectionState != BleConnectionState::CONNECTED)
        return false;

    ecgCharacteristic->setValue("S");
    ecgCharacteristic->notify();

    delay(30);
    return true;
}

bool BlePeripheral::sendEcgValue(uint16_t value)
{
    if (connectionState != BleConnectionState::CONNECTED)
        return false;

    char buf[16];
    snprintf(buf, sizeof(buf), "%u", value);

    ecgCharacteristic->setValue(buf);
    ecgCharacteristic->notify();

    delay(20);
    return true;
}

bool BlePeripheral::sendEcgEnd()
{
    if (connectionState != BleConnectionState::CONNECTED)
        return false;

    ecgCharacteristic->setValue("E");
    ecgCharacteristic->notify();

    delay(30);

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