package com.example.mobileapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "alerts")
data class AlertEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val heartRate: Int,
    val temperature: Double,
    val humidity: Int,
    val ecgStatus: String,
    val message: String,
    val time: String,
    val synced: Boolean = false
)