package com.example.mobileapp.data.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged

/*
 * Emite true/false cand dispozitivul are/pierde internet. Folosit doar pentru a
 * afisa statusul in UI ("offline — date in coada"). Re-trimiterea automata (g)
 * o face SyncWorker prin constrangerea de retea, nu acest observer.
 */
class ConnectivityObserver(context: Context) {

    private val cm =
        context.applicationContext.getSystemService(ConnectivityManager::class.java)

    fun observe(): Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) { trySend(true) }
            override fun onLost(network: Network) { trySend(false) }
        }

        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        cm.registerNetworkCallback(request, callback)

        // Starea curenta la momentul abonarii
        val current = cm.activeNetwork
            ?.let { cm.getNetworkCapabilities(it) }
            ?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
        trySend(current)

        awaitClose { cm.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()
}