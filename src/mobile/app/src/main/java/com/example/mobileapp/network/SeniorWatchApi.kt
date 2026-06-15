package com.example.mobileapp.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/*
 * Interfata Retrofit. Header-ul Authorization se adauga AUTOMAT prin
 * AuthInterceptor (vezi RetrofitClient.kt), deci nu il mai trecem ca parametru
 * pe fiecare metoda — mai curat decat varianta din documentatie, dar echivalent.
 *
 * Login-ul NU primeste token (e endpoint public), iar interceptorul il sare.
 */
interface SeniorWatchApi {

    @POST("/api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): LoginResponse

    @POST("/api/measurements")
    suspend fun sendMeasurements(@Body batch: MeasurementBatch): Response<Unit>

    @POST("/api/alerts")
    suspend fun sendAlert(@Body alert: AlertRequest): Response<Unit>

    // FLAG: confirma calea exacta cu echipa Cloud (nu e in lista documentata).
    @POST("/api/accel")
    suspend fun sendAccelBurst(@Body burst: AccelBurst): Response<Unit>

    // FLAG: confirma calea exacta cu echipa Cloud (nu e in lista documentata).
    @POST("/api/ecg")
    suspend fun sendEcgBatch(@Body batch: EcgBatch): Response<Unit>
}