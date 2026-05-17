package com.example.mobileapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "average_measurements")
data class AverageMeasurementEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val avgHeartRate: Double,
    val avgTemperature: Double,
    val avgHumidity: Double,
    val time: String,
    val synced: Boolean = false
)