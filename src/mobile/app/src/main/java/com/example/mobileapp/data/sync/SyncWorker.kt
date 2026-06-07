package com.example.mobileapp.data.sync

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.example.mobileapp.data.local.AppDatabase
import com.example.mobileapp.network.ApiClient
import java.util.concurrent.TimeUnit

/*
 * Cerinta g: in lipsa internetului datele stau in Room (synced=false) si se
 * trimit automat cand aplicatia revine online.
 *
 * WorkManager face exact asta: cu o constrangere NetworkType.CONNECTED, Android
 * porneste worker-ul DOAR cand exista retea — chiar daca aplicatia e inchisa
 * sau telefonul a fost restartat. Daca syncul esueaza, Result.retry() reincearca
 * cu backoff.
 */
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        // Asiguram clientul initializat si in background (proces repornit).
        ApiClient.init(applicationContext)

        if (ApiClient.session.token == null) {
            // Fara token nu putem trimite; asteptam login interactiv.
            return Result.success()
        }

        val dao = AppDatabase.getDatabase(applicationContext).healthDao()
        val repository = CloudSyncRepository(dao)

        return repository.syncPending().fold(
            onSuccess = { Result.success() },
            onFailure = { Result.retry() }
        )
    }

    companion object {
        private const val PERIODIC_WORK = "sw_periodic_sync"
        private const val IMMEDIATE_WORK = "sw_immediate_sync"

        private val connectedConstraint = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        /*
         * Apeleaza o data, la pornirea aplicatiei. Verifica periodic coada
         * (minimul permis de WorkManager e 15 min) cand exista retea.
         */
        fun schedulePeriodic(context: Context) {
            val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(connectedConstraint)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                PERIODIC_WORK,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }

        /*
         * Apeleaza dupa o trimitere esuata (offline): cere un sync prompt de
         * indata ce revine reteaua, fara sa astepti ciclul periodic de 15 min.
         */
        fun requestImmediate(context: Context) {
            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(connectedConstraint)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                IMMEDIATE_WORK,
                androidx.work.ExistingWorkPolicy.REPLACE,
                request
            )
        }
    }
}