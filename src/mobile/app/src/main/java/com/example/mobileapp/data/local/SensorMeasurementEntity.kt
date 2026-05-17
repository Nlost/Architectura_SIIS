package com.example.mobileapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sensor_measurements")
data class SensorMeasurementEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val heartRate: Int,
    val temperature: Double,
    val humidity: Int,
    val ecgStatus: String,
    val time: String,
    val synced: Boolean = false
)