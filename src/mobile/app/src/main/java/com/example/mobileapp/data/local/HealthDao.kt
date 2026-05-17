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
}