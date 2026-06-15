package com.example.mobileapp.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface HealthDao {

    @Insert
    suspend fun insertMeasurement(measurement: SensorMeasurementEntity)

    @Insert
    suspend fun insertAverageMeasurement(average: AverageMeasurementEntity)

    @Insert
    suspend fun insertAlert(alert: AlertEntity)

    @Query("SELECT COUNT(*) FROM sensor_measurements")
    suspend fun getMeasurementCount(): Int

    @Query("SELECT COUNT(*) FROM average_measurements")
    suspend fun getAverageCount(): Int

    @Query("SELECT COUNT(*) FROM alerts")
    suspend fun getAlertCount(): Int

    @Query("SELECT COUNT(*) FROM sensor_measurements WHERE synced = 0")
    suspend fun getUnsyncedMeasurementCount(): Int

    @Query("SELECT COUNT(*) FROM average_measurements WHERE synced = 0")
    suspend fun getUnsyncedAverageCount(): Int

    @Query("SELECT COUNT(*) FROM alerts WHERE synced = 0")
    suspend fun getUnsyncedAlertCount(): Int

    @Query("DELETE FROM sensor_measurements")
    suspend fun clearMeasurements()

    @Query("DELETE FROM average_measurements")
    suspend fun clearAverages()

    @Query("DELETE FROM alerts")
    suspend fun clearAlerts()

    // ─────────────────────────────────────────────────────────────────────────
    // SINCRONIZARE CLOUD — folosite de CloudSyncRepository
    // ─────────────────────────────────────────────────────────────────────────

    @Query("SELECT * FROM sensor_measurements WHERE synced = 0 ORDER BY id ASC")
    suspend fun getUnsyncedMeasurements(): List<SensorMeasurementEntity>

    @Query("UPDATE sensor_measurements SET synced = 1 WHERE id IN (:ids)")
    suspend fun markMeasurementsSynced(ids: List<Int>)

    @Query("SELECT * FROM alerts WHERE synced = 0 ORDER BY id ASC")
    suspend fun getUnsyncedAlerts(): List<AlertEntity>

    @Query("UPDATE alerts SET synced = 1 WHERE id IN (:ids)")
    suspend fun markAlertsSynced(ids: List<Int>)

    // ── Burst accelerometru (cerinta g, offline) ──────────────────────────────

    @Insert
    suspend fun insertAccelBurst(burst: AccelBurstEntity)

    @Query("SELECT * FROM accel_bursts WHERE synced = 0 ORDER BY id ASC")
    suspend fun getUnsyncedAccelBursts(): List<AccelBurstEntity>

    @Query("UPDATE accel_bursts SET synced = 1 WHERE id IN (:ids)")
    suspend fun markAccelBurstsSynced(ids: List<Int>)

    // ── Burst ECG (forma de unda, offline) ────────────────────────────────────

    @Insert
    suspend fun insertEcgBurst(burst: EcgBurstEntity)

    @Query("SELECT * FROM ecg_bursts WHERE synced = 0 ORDER BY id ASC")
    suspend fun getUnsyncedEcgBursts(): List<EcgBurstEntity>

    @Query("UPDATE ecg_bursts SET synced = 1 WHERE id IN (:ids)")
    suspend fun markEcgBurstsSynced(ids: List<Int>)
}