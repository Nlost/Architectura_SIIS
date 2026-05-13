#ifndef BLE_PERIPHERAL_H
#define BLE_PERIPHERAL_H

#include <Arduino.h>
#include <functional>

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#include "SensorFrameBuilder.h"

enum class BleConnectionState {
    DISCONNECTED,
    CONNECTED
};

using ConnectCallback =
    std::function<void(String clientAddress)>;

using DisconnectCallback =
    std::function<void()>;

class BlePeripheral {
public:
    void startBlePeripheral(String deviceName);

    BleConnectionState getConnectionState();

    bool sendFrameNotification(
        const SensorFrame& frame
    );

    void onClientConnected(
        ConnectCallback cb
    );

    void onClientDisconnected(
        DisconnectCallback cb
    );

public:
    BLEServer* server = nullptr;
    BLECharacteristic* txCharacteristic = nullptr;

    BleConnectionState connectionState =
        BleConnectionState::DISCONNECTED;

    ConnectCallback connectCallback = nullptr;
    DisconnectCallback disconnectCallback = nullptr;

    static BlePeripheral* instance;
};

#endif