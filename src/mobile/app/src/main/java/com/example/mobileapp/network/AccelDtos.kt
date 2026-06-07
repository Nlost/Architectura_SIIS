package com.example.mobileapp.network

/*
 * DTO-uri pentru burst-ul de accelerometru (cerinta e).
 *
 * FLAG: numele campurilor (x, y, z) si calea endpoint-ului sunt presupuneri
 * bazate pe tabelele accel_bursts / accel_samples — CONFIRMA cu echipa Cloud,
 * pentru ca nu apar in lista de endpoint-uri documentata.
 */

data class AccelBurst(
    val patientId: String,
    val burstId: String,          // UUID unic per burst → idempotenta la retry
    val intervalStart: String,    // ISO-8601 UTC
    val intervalEnd: String,
    val samples: List<AccelSample>
)

data class AccelSample(
    val ts: String,               // ISO-8601 UTC, momentul mostrei (1 Hz)
    val x: Float,
    val y: Float,
    val z: Float
)