package com.example.mobileapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

/*
 * Burst ECG pentru coada offline (cerinta g), simetric cu AccelBurstEntity.
 * Mostrele (List<Int>, valori ADC brute) se stocheaza serializate JSON in
 * samplesJson, pentru ca Room nu poate persista direct o lista fara TypeConverter.
 */
@Entity(tableName = "ecg_bursts")
data class EcgBurstEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val patientId: String,
    val burstId: String,
    val intervalStart: String,
    val intervalEnd: String,
    val sampleRateHz: Int,
    val samplesJson: String,
    val synced: Boolean = false
)
