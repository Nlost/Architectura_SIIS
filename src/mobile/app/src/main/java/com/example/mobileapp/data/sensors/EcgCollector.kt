package com.example.mobileapp.data.sensors

import android.util.Log
import java.time.Instant

/*
 * Acumuleaza forma de unda ECG primita prin BLE (caracteristica FF03) si o
 * livreaza in burst-uri, la fel ca AccelCollector — dar ECG-ul nu e citit la o
 * cadenta fixa de noi, ci este "impins" de ESP32 prin notificari BLE. De aceea
 * colectorul nu are bucla cu timer: doar tamponeaza mostrele si emite cand
 * tamponul atinge BURST_SIZE.
 *
 * FLAG: SAMPLE_RATE_HZ trebuie confirmat cu firmware-ul ESP32 (rata reala de
 * esantionare a AD8232). E folosit doar ca metadata pentru Cloud, nu schimba
 * logica de tamponare.
 */
class EcgCollector(
    private val sampleRateHz: Int = SAMPLE_RATE_HZ,
    private val burstSize: Int = BURST_SIZE
) {
    private val buffer = mutableListOf<Int>()
    private var intervalStart: String? = null
    private var onBurstReady: ((List<Int>, String, String, Int) -> Unit)? = null

    /*
     * onBurstReady(samples, intervalStart, intervalEnd, sampleRateHz)
     */
    fun start(onBurstReady: (List<Int>, String, String, Int) -> Unit) {
        this.onBurstReady = onBurstReady
        Log.d(TAG, "Colectare ECG pornita (burst de $burstSize, $sampleRateHz Hz).")
    }

    /*
     * Apelat din BleManager (prin MainActivity) ori de cate ori soseste o
     * notificare FF03 cu una sau mai multe mostre ECG. @Synchronized pentru ca
     * notificarile BLE vin pe thread-ul de binder, nu pe UI.
     */
    @Synchronized
    fun addSamples(values: List<Int>) {
        val callback = onBurstReady ?: return
        if (values.isEmpty()) return

        if (buffer.isEmpty()) intervalStart = Instant.now().toString()
        buffer.addAll(values)

        if (buffer.size >= burstSize) {
            val burst = buffer.toList()
            val start = intervalStart ?: Instant.now().toString()
            val end = Instant.now().toString()

            buffer.clear()
            intervalStart = null

            callback(burst, start, end, sampleRateHz)
        }
    }

    @Synchronized
    fun stop() {
        buffer.clear()
        intervalStart = null
        onBurstReady = null
    }

    companion object {
        private const val TAG = "EcgCollector"
        private const val BURST_SIZE = 250    // ~1 s la 250 Hz
        private const val SAMPLE_RATE_HZ = 250
    }
}
