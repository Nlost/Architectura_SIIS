package com.example.mobileapp.network

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/*
 * URL-ul backend-ului live (Elastic Beanstalk). Atentie: e http://, nu https,
 * deci ai nevoie de network_security_config.xml (vezi instructiunile din chat).
 * Resursele AWS se opresc 23:00–09:00 (auto-shutdown) → in afara intervalului
 * primesti connection refused, nu e bug de cod.
 */
const val BASE_URL =
    "http://seniorwatch-dev.eba-g2g95ywt.eu-central-1.elasticbeanstalk.com"

/*
 * Tine token-ul JWT si patientId-ul. Le persista in SharedPreferences ca sa fie
 * disponibile si pentru SyncWorker (care ruleaza in background, posibil dupa ce
 * procesul a fost omorat). Token-ul expira dupa 24h: daca un request da 401,
 * coada ramane nesincronizata pana la urmatorul login interactiv.
 *
 * Nota: pentru un proiect de productie, foloseste EncryptedSharedPreferences
 * (androidx.security:security-crypto) in loc de SharedPreferences simplu.
 */
class SessionManager(context: Context) {

    private val prefs =
        context.applicationContext.getSharedPreferences("sw_session", Context.MODE_PRIVATE)

    var token: String?
        get() = prefs.getString("jwt_token", null)
        set(value) = prefs.edit().putString("jwt_token", value).apply()

    // UUID-ul pacientului, primit de la echipa Web. Seteaza-l o data dupa login.
    var patientId: String?
        get() = prefs.getString("patient_id", null)
        set(value) = prefs.edit().putString("patient_id", value).apply()

    val isLoggedIn: Boolean
        get() = token != null

    fun clear() = prefs.edit().clear().apply()
}

/*
 * Adauga automat "Authorization: Bearer <token>" la toate request-urile,
 * mai putin la /api/auth/login (care e public).
 */
class AuthInterceptor(private val session: SessionManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()

        if (original.url.encodedPath.contains("/api/auth/login")) {
            return chain.proceed(original)
        }

        val token = session.token
        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }

        return chain.proceed(request)
    }
}

/*
 * Singleton-ul care construieste Retrofit. Apeleaza ApiClient.init(context) o
 * singura data (ex. in Application sau la pornirea MainActivity), apoi folosesti
 * ApiClient.api si ApiClient.session.
 */
object ApiClient {

    lateinit var session: SessionManager
        private set

    lateinit var api: SeniorWatchApi
        private set

    fun init(context: Context) {
        if (::api.isInitialized) return

        session = SessionManager(context)

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY // pune NONE pentru release
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(session))
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        api = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SeniorWatchApi::class.java)
    }
}