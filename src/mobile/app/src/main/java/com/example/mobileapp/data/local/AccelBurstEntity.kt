package com.example.mobileapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/*
 * Burst de accelerometru pentru coada offline (cerinta g).
 * Mostrele (List<AccelSample>) se stocheaza serializate JSON in samplesJson,
 * pentru ca Room nu poate persista direct o lista fara TypeConverter.
 */
@Entity(tableName = "accel_bursts")
data class AccelBurstEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val patientId: String,
    val burstId: String,
    val intervalStart: String,
    val intervalEnd: String,
    val samplesJson: String,
    val fallDetected: Boolean,
    val synced: Boolean = false
)