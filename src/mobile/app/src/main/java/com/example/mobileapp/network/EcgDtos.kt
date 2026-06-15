package com.example.mobileapp.network

/*
 * DTO-uri pentru forma de unda ECG (caracteristica BLE FF03).
 *
 * ESP32/Arduino trimite valori ECG brute (ADC) la frecventa mare, separat de
 * batch-ul de masuratori (puls/temperatura/umiditate). Le grupam intr-un burst,
 * la fel ca la accelerometru, ca sa nu facem cate un request per mostra.
 *
 * FLAG: numele campurilor si calea endpoint-ului (/api/ecg) sunt presupuneri
 * aliniate cu coloana sensor_samples.ecg_blob din schema Cloud — CONFIRMA cu
 * echipa Cloud, pentru ca nu apar in lista de endpoint-uri documentata.
 */

data class EcgBatch(
    val patientId: String,
    val burstId: String,          // UUID unic per burst → idempotenta la retry
    val intervalStart: String,    // ISO-8601 UTC
    val intervalEnd: String,
    val sampleRateHz: Int,        // frecventa de esantionare a ECG-ului
    val samples: List<Int>        // valori ADC brute, in ordinea esantionarii
)
