package com.example.mobileapp.data.bluetooth

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.bluetooth.BluetoothStatusCodes
import android.bluetooth.le.ScanCallback
import android.bluetooth.le.ScanResult
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import java.util.UUID

class BleManager(
    private val context: Context
) {
    private val mainHandler = Handler(Looper.getMainLooper())

    private val bluetoothManager =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

    private val bluetoothAdapter: BluetoothAdapter? =
        bluetoothManager.adapter

    private var bluetoothGatt: BluetoothGatt? = null

    private var onStatusChanged: ((String) -> Unit)? = null
    private var onDataReceived: ((String) -> Unit)? = null

    private var isScanning = false
    private var isConnected = false

    companion object {
        const val DEVICE_NAME = "WH-0001"

        // MAC-ul ESP32 afișat în Serial Monitor:
        // [BLE] MAC address: b0:cb:d8:c0:2b:2a
        const val DEVICE_MAC = "B0:CB:D8:C0:2B:2A"

        val SERVICE_UUID: UUID =
            UUID.fromString("0000ff01-0000-1000-8000-00805f9b34fb")

        val CHARACTERISTIC_UUID: UUID =
            UUID.fromString("0000ff02-0000-1000-8000-00805f9b34fb")

        val CLIENT_CHARACTERISTIC_CONFIG_UUID: UUID =
            UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")
    }

    fun hasBluetoothPermissions(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.BLUETOOTH_SCAN
            ) == PackageManager.PERMISSION_GRANTED &&
                    ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.BLUETOOTH_CONNECT
                    ) == PackageManager.PERMISSION_GRANTED &&
                    ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.ACCESS_FINE_LOCATION
                    ) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        }
    }

    @SuppressLint("MissingPermission")
    fun startScan(
        onStatusChanged: (String) -> Unit,
        onDataReceived: (String) -> Unit
    ) {
        this.onStatusChanged = onStatusChanged
        this.onDataReceived = onDataReceived

        if (!hasBluetoothPermissions()) {
            updateStatus("Permisiuni Bluetooth lipsă.")
            return
        }

        val adapter = bluetoothAdapter

        if (adapter == null) {
            updateStatus("Bluetooth nu este disponibil pe acest telefon.")
            return
        }

        if (!adapter.isEnabled) {
            updateStatus("Bluetooth este oprit. Activează Bluetooth pe telefon.")
            return
        }

        if (isConnected) {
            updateStatus("Telefonul este deja conectat la ESP32.")
            return
        }

        try {
            adapter.bluetoothLeScanner?.stopScan(scanCallback)
        } catch (_: Exception) {
        }

        isScanning = true

        updateStatus("Scanare BLE pornită. Caut dispozitivul $DEVICE_NAME...")

        adapter.bluetoothLeScanner?.startScan(scanCallback)

        mainHandler.postDelayed({
            if (isScanning) {
                try {
                    adapter.bluetoothLeScanner?.stopScan(scanCallback)
                } catch (_: Exception) {
                }

                isScanning = false
                updateStatus("Scanare oprită. Dacă ESP32 nu a fost găsit, verifică dacă este pornit.")
            }
        }, 15_000)
    }

    @SuppressLint("MissingPermission")
    fun disconnect() {
        isConnected = false
        isScanning = false

        try {
            bluetoothAdapter?.bluetoothLeScanner?.stopScan(scanCallback)
        } catch (_: Exception) {
        }

        try {
            bluetoothGatt?.disconnect()
            bluetoothGatt?.close()
        } catch (_: Exception) {
        }

        bluetoothGatt = null
        updateStatus("Deconectat de la ESP32.")
    }

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(
            callbackType: Int,
            result: ScanResult
        ) {
            val device = result.device

            val deviceName =
                result.scanRecord?.deviceName ?: device.name

            val deviceAddress = device.address

            val matchesByName = deviceName == DEVICE_NAME

            val matchesByMac = deviceAddress.equals(
                DEVICE_MAC,
                ignoreCase = true
            )

            if (matchesByName || matchesByMac) {
                try {
                    bluetoothAdapter?.bluetoothLeScanner?.stopScan(this)
                } catch (_: Exception) {
                }

                isScanning = false

                updateStatus(
                    "Dispozitiv găsit: ${deviceName ?: "fără nume"} / $deviceAddress. Conectare..."
                )

                bluetoothGatt = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    device.connectGatt(
                        context,
                        false,
                        gattCallback,
                        BluetoothDevice.TRANSPORT_LE
                    )
                } else {
                    device.connectGatt(
                        context,
                        false,
                        gattCallback
                    )
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            isScanning = false
            updateStatus("Scanare BLE eșuată. Cod eroare: $errorCode")
        }
    }

    private val gattCallback = object : BluetoothGattCallback() {

        @SuppressLint("MissingPermission")
        override fun onConnectionStateChange(
            gatt: BluetoothGatt,
            status: Int,
            newState: Int
        ) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    isConnected = true
                    bluetoothGatt = gatt

                    updateStatus("Conectat la ESP32. Caut servicii BLE...")

                    mainHandler.postDelayed({
                        try {
                            gatt.discoverServices()
                        } catch (e: Exception) {
                            updateStatus("Eroare la căutarea serviciilor BLE: ${e.message}")
                        }
                    }, 600)
                }

                BluetoothProfile.STATE_DISCONNECTED -> {
                    isConnected = false

                    updateStatus("ESP32 deconectat. Status: $status")

                    try {
                        gatt.close()
                    } catch (_: Exception) {
                    }

                    bluetoothGatt = null
                }
            }
        }

        @SuppressLint("MissingPermission")
        override fun onServicesDiscovered(
            gatt: BluetoothGatt,
            status: Int
        ) {
            if (status != BluetoothGatt.GATT_SUCCESS) {
                updateStatus("Descoperirea serviciilor BLE a eșuat. Status: $status")
                return
            }

            val service = gatt.getService(SERVICE_UUID)

            if (service == null) {
                updateStatus("Serviciul BLE nu a fost găsit. Verifică SERVICE_UUID.")
                return
            }

            val characteristic = service.getCharacteristic(CHARACTERISTIC_UUID)

            if (characteristic == null) {
                updateStatus("Caracteristica BLE nu a fost găsită. Verifică CHARACTERISTIC_UUID.")
                return
            }

            val notificationsEnabled = gatt.setCharacteristicNotification(
                characteristic,
                true
            )

            if (!notificationsEnabled) {
                updateStatus("Nu s-au putut activa notificările BLE.")
                return
            }

            val descriptor = characteristic.getDescriptor(
                CLIENT_CHARACTERISTIC_CONFIG_UUID
            )

            if (descriptor == null) {
                updateStatus("Descriptorul de notificări nu a fost găsit.")
                return
            }

            val writeStarted: Boolean =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    val result = gatt.writeDescriptor(
                        descriptor,
                        BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                    )

                    result == BluetoothStatusCodes.SUCCESS
                } else {
                    descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                    gatt.writeDescriptor(descriptor)
                }

            if (writeStarted) {
                updateStatus("Activez notificările BLE...")
            } else {
                updateStatus("Nu s-a putut scrie descriptorul BLE.")
            }
        }

        override fun onDescriptorWrite(
            gatt: BluetoothGatt,
            descriptor: BluetoothGattDescriptor,
            status: Int
        ) {
            if (descriptor.uuid == CLIENT_CHARACTERISTIC_CONFIG_UUID) {
                if (status == BluetoothGatt.GATT_SUCCESS) {
                    updateStatus("Conectat. Aștept date de la ESP32...")
                } else {
                    updateStatus("Activarea notificărilor BLE a eșuat. Status: $status")
                }
            }
        }

        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray
        ) {
            if (characteristic.uuid == CHARACTERISTIC_UUID) {
                handleReceivedData(value)
            }
        }

        @Deprecated("Deprecated in Android 13, păstrat pentru compatibilitate.")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            if (characteristic.uuid == CHARACTERISTIC_UUID) {
                handleReceivedData(characteristic.value)
            }
        }
    }

    private fun handleReceivedData(value: ByteArray) {
        val message = value.toString(Charsets.UTF_8).trim()

        mainHandler.post {
            onStatusChanged?.invoke("Date primite BLE: $message")
            onDataReceived?.invoke(message)
        }
    }

    private fun updateStatus(status: String) {
        mainHandler.post {
            onStatusChanged?.invoke(status)
        }
    }
}