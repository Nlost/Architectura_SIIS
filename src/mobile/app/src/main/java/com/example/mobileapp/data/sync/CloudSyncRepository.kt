package com.example.mobileapp.data.sync

import android.util.Log
import com.example.mobileapp.data.local.AccelBurstEntity
import com.example.mobileapp.data.local.HealthDao
import com.example.mobileapp.network.AccelBurst
import com.example.mobileapp.network.AccelSample
import com.example.mobileapp.network.AlertRequest
import com.example.mobileapp.network.ApiClient
import com.example.mobileapp.network.LoginRequest
import com.example.mobileapp.network.MeasurementBatch
import com.example.mobileapp.network.Sample
import com.example.mobileapp.network.SessionManager
import com.example.mobileapp.network.SeniorWatchApi
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.util.UUID

/*
 * Orchestreaza: autentificare, golirea cozii offline (cerinta g), alerte
 * asincrone (d/f) si burst-uri de accelerometru (e), toate prin Room -> REST.
 */
class CloudSyncRepository(
    private val dao: HealthDao,
    private val api: SeniorWatchApi = ApiClient.api,
    private val session: SessionManager = ApiClient.session
) {

    private val gson = Gson()

    // ── LOGIN ────────────────────────────────────────────────────────────────

    suspend fun login(email: String, password: String): Result<Unit> = runCatching {
        val response = api.login(LoginRequest(email, password))
        session.token = response.token
        Log.d(TAG, "Login OK, token salvat.")
    }

    // ── SINCRONIZAREA COZII (g + d + e) ────────────────────────────────────────

    suspend fun syncPending(): Result<Unit> = runCatching {
        if (session.token == null) {
            Log.w(TAG, "Fara token — sar peste sync.")
            return@runCatching
        }
        syncMeasurements()
        syncAlerts()
        syncAccelBursts()
    }

    private suspend fun syncMeasurements() {
        val unsynced = dao.getUnsyncedMeasurements()
        if (unsynced.isEmpty()) return

        val patientId = session.patientId ?: run {
            Log.w(TAG, "patientId lipseste — nu pot trimite masuratori.")
            return
        }

        val samples = unsynced.map { m ->
            Sample(
                ts = isoFromTime(m.time),
                puls = m.heartRate,
                temperatura = m.temperature.toFloat(),
                umiditate = m.humidity.toFloat()
            )
        }

        val batch = MeasurementBatch(
            patientId = patientId,
            batchId = UUID.randomUUID().toString(),
            intervalStart = samples.first().ts,
            intervalEnd = samples.last().ts,
            samples = samples
        )

        val response = api.sendMeasurements(batch)
        if (response.isSuccessful) {
            dao.markMeasurementsSynced(unsynced.map { it.id })
            Log.d(TAG, "Trimis batch cu ${samples.size} sample-uri.")
        } else {
            throw RuntimeException("measurements HTTP ${response.code()}")
        }
    }

    private suspend fun syncAlerts() {
        val unsynced = dao.getUnsyncedAlerts()
        if (unsynced.isEmpty()) return

        val patientId = session.patientId ?: return

        for (alert in unsynced) {
            val request = AlertRequest(
                patientId = patientId,
                severitate = severityFor(alert.heartRate, alert.temperature),
                textPacient = alert.message
            )
            val response = api.sendAlert(request)
            if (response.isSuccessful) {
                dao.markAlertsSynced(listOf(alert.id))
            } else {
                throw RuntimeException("alert HTTP ${response.code()}")
            }
        }
    }

    private suspend fun syncAccelBursts() {
        val unsynced = dao.getUnsyncedAccelBursts()
        if (unsynced.isEmpty()) return

        val type = object : TypeToken<List<AccelSample>>() {}.type

        for (b in unsynced) {
            val samples: List<AccelSample> = gson.fromJson(b.samplesJson, type)
            val response = api.sendAccelBurst(
                AccelBurst(
                    patientId = b.patientId,
                    burstId = b.burstId,
                    intervalStart = b.intervalStart,
                    intervalEnd = b.intervalEnd,
                    samples = samples
                )
            )
            if (response.isSuccessful) {
                dao.markAccelBurstsSynced(listOf(b.id))
                Log.d(TAG, "Trimis burst accel cu ${samples.size} mostre.")
            } else {
                throw RuntimeException("accel HTTP ${response.code()}")
            }
        }
    }

    // ── COADA: pune un burst de accel in Room (cerinta e + g) ──────────────────

    suspend fun queueAccelBurst(
        samples: List<AccelSample>,
        intervalStart: String,
        intervalEnd: String,
        fallDetected: Boolean
    ) {
        val patientId = session.patientId ?: run {
            Log.w(TAG, "patientId lipseste — nu salvez burst-ul.")
            return
        }
        dao.insertAccelBurst(
            AccelBurstEntity(
                patientId = patientId,
                burstId = UUID.randomUUID().toString(),
                intervalStart = intervalStart,
                intervalEnd = intervalEnd,
                samplesJson = gson.toJson(samples),
                fallDetected = fallDetected
            )
        )
    }

    // ── ALERTA ASINCRONA IMEDIATA (d/f) ────────────────────────────────────────

    suspend fun sendAlertNow(
        heartRate: Int,
        temperature: Double,
        textPacient: String
    ): Result<Unit> = runCatching {
        val patientId = session.patientId
            ?: throw IllegalStateException("patientId lipseste")

        val response = api.sendAlert(
            AlertRequest(
                patientId = patientId,
                severitate = severityFor(heartRate, temperature),
                textPacient = textPacient.ifBlank { "Valoare anormala detectata" }
            )
        )
        if (!response.isSuccessful) throw RuntimeException("alert HTTP ${response.code()}")
    }

    // ── HELPERE ────────────────────────────────────────────────────────────────

    private fun severityFor(heartRate: Int, temperature: Double): String =
        if (heartRate > 120 || temperature > 38.5) "CRITICAL" else "WARNING"

    private fun isoFromTime(hms: String): String = try {
        val time = LocalTime.parse(hms)
        LocalDate.now()
            .atTime(time)
            .atZone(ZoneId.systemDefault())
            .toInstant()
            .toString()
    } catch (e: Exception) {
        Instant.now().atZone(ZoneOffset.UTC).toInstant().toString()
    }

    companion object {
        private const val TAG = "CloudSync"
    }
}