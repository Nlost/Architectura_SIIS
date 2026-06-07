package com.example.mobileapp.data.sensors

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import com.example.mobileapp.network.AccelSample
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.time.Instant
import kotlin.math.abs
import kotlin.math.sqrt

/*
 * Citeste accelerometrul telefonului la exact 1 Hz (cerinta e), acumuleaza 30 de
 * mostre (= 30 s) si le livreaza ca burst intreg prin onBurstReady. Detecteaza si
 * o posibila cadere/impact ca sa coreleze cu vitalele in stabilirea alarmei.
 *
 * Nota: 1 Hz e impus de bucla cu delay(1000), nu de rata senzorului — senzorul
 * raporteaza mult mai des, noi luam doar ultima valoare o data pe secunda.
 */
class AccelCollector(context: Context) : SensorEventListener {

    private val sensorManager =
        context.applicationContext.getSystemService(SensorManager::class.java)

    private val accelerometer: Sensor? =
        sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    @Volatile private var lastX = 0f
    @Volatile private var lastY = 0f
    @Volatile private var lastZ = 0f
    @Volatile private var hasReading = false

    private var scope: CoroutineScope? = null
    private val buffer = mutableListOf<AccelSample>()
    private var intervalStart: String? = null

    /*
     * onBurstReady(samples, intervalStart, intervalEnd, fallDetected)
     * onSample(magnitude) — optional, pentru afisare live in UI.
     */
    fun start(
        onBurstReady: (List<AccelSample>, String, String, Boolean) -> Unit,
        onSample: (Float) -> Unit = {}
    ) {
        if (accelerometer == null) {
            Log.w(TAG, "Dispozitivul nu are accelerometru.")
            return
        }

        sensorManager?.registerListener(
            this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL
        )

        val s = CoroutineScope(Dispatchers.Default)
        scope = s
        s.launch {
            while (isActive) {
                delay(1000L) // 1 Hz
                if (!hasReading) continue

                val sample = AccelSample(
                    ts = Instant.now().toString(),
                    x = lastX,
                    y = lastY,
                    z = lastZ
                )
                buffer.add(sample)
                onSample(magnitude(lastX, lastY, lastZ))

                if (buffer.size == 1) intervalStart = sample.ts

                if (buffer.size >= BURST_SIZE) {
                    val burst = buffer.toList()
                    val fall = burst.any {
                        abs(magnitude(it.x, it.y, it.z) - GRAVITY) > FALL_THRESHOLD
                    }
                    val start = intervalStart ?: burst.first().ts
                    val end = burst.last().ts

                    buffer.clear()
                    intervalStart = null

                    onBurstReady(burst, start, end, fall)
                }
            }
        }
        Log.d(TAG, "Colectare accelerometru pornita (1 Hz, burst de $BURST_SIZE).")
    }

    fun stop() {
        sensorManager?.unregisterListener(this)
        scope?.cancel()
        scope = null
        buffer.clear()
        intervalStart = null
        hasReading = false
    }

    override fun onSensorChanged(event: SensorEvent) {
        lastX = event.values[0]
        lastY = event.values[1]
        lastZ = event.values[2]
        hasReading = true
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun magnitude(x: Float, y: Float, z: Float): Float =
        sqrt(x * x + y * y + z * z)

    companion object {
        private const val TAG = "AccelCollector"
        private const val BURST_SIZE = 30          // 30 mostre la 1 Hz = 30 s
        private const val GRAVITY = 9.81f
        // Deviatie fata de gravitatie (m/s^2) care indica impact/cadere.
        // Tunabil — ideal ar veni din alarm_rules (modelul medicului).
        private const val FALL_THRESHOLD = 12.0f
    }
}