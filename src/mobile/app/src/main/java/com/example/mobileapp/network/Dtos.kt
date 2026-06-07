package com.example.mobileapp.network

/*
 * DTO-uri pentru API-ul SeniorWatch (Spring Boot pe AWS Elastic Beanstalk).
 *
 * IMPORTANT: numele proprietatilor de mai jos devin EXACT cheile JSON trimise
 * la backend (Gson foloseste numele proprietatii Kotlin). Sunt copiate dupa
 * exemplele din documentatia de arhitectura, deci NU le redenumi fara sa
 * confirmi cu echipa Cloud.
 */

// ── AUTH ─────────────────────────────────────────────────────────────────────

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String
)

// ── MEASUREMENTS (POST /api/measurements, la fiecare 30 s) ───────────────────

data class MeasurementBatch(
    val patientId: String,        // UUID-ul pacientului, primit de la echipa Web
    val batchId: String,          // UUID unic / batch → backend ignora retrimiterea (idempotenta)
    val intervalStart: String,    // ISO-8601 UTC, ex. "2026-06-03T15:30:00Z"
    val intervalEnd: String,      // ISO-8601 UTC
    val samples: List<Sample>
)

data class Sample(
    val ts: String,               // ISO-8601 UTC, momentul masuratorii (la 10 s)
    val puls: Int,
    val temperatura: Float,
    val umiditate: Float? = null  // FLAG: confirma cu Cloud ca Sample accepta acest camp,
    // altfel umiditatea se pierde tacit la backend.
    // Mai tarziu: campuri pentru accelerometru (accX, accY, accZ) — vezi pasul urmator.
)

// ── ALERTS (POST /api/alerts, asincron, imediat la producerea alarmei) ───────

data class AlertRequest(
    val patientId: String,
    val severitate: String,       // "WARNING" sau "CRITICAL"
    val textPacient: String       // textul atasat de pacient (cerinta f)
)