package com.example.mobileapp

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mobileapp.data.bluetooth.BleManager
import com.example.mobileapp.data.local.AlertEntity
import com.example.mobileapp.data.local.AppDatabase
import com.example.mobileapp.data.local.AverageMeasurementEntity
import com.example.mobileapp.data.local.SensorMeasurementEntity
import com.example.mobileapp.data.sync.CloudSyncRepository
import com.example.mobileapp.data.sync.ConnectivityObserver
import com.example.mobileapp.data.sync.SyncWorker
import com.example.mobileapp.network.ApiClient
import com.example.mobileapp.network.LoginRequest
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.compose.runtime.DisposableEffect
import com.example.mobileapp.data.sensors.AccelCollector
import com.example.mobileapp.network.AccelBurst
import java.util.UUID

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

/*
 * UUID-ul pacientului, primit de la echipa Web (din POST /api/patients).
 * INLOCUIESTE cu UUID-ul real inainte de testare.
 */
private const val PATIENT_ID_FROM_WEB = "TODO-paste-UUID-pacient-aici"

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY
// ─────────────────────────────────────────────────────────────────────────────

class MainActivity : ComponentActivity() {

    private val bluetoothPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestBluetoothPermissions()
        ApiClient.init(this)
        SyncWorker.schedulePeriodic(this)
        setContent { MobileHealthApp() }
    }

    private fun requestBluetoothPermissions() {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            arrayOf(
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        } else {
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION)
        }

        bluetoothPermissionLauncher.launch(permissions)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA MODELS
// ─────────────────────────────────────────────────────────────────────────────

data class SensorMeasurement(
    val heartRate: Int,
    val temperature: Double,
    val humidity: Double,
    val time: String
)

data class AverageMeasurement(
    val avgHeartRate: Double,
    val avgTemperature: Double,
    val avgHumidity: Double,
    val time: String
)

fun getCurrentTime(): String {
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return formatter.format(Date())
}

/*
    ESP32 trimite prin BLE mesaj de forma:

    82;27.0;60.0

    Unde:
    parts[0] = puls, bpm
    parts[1] = temperatura, gradeC
    parts[2] = umiditate, %
*/
fun parseBleMessageToMeasurement(message: String): SensorMeasurement? {
    return try {
        val normalized = message.trim()

        val parts = normalized
            .split(";")
            .map { it.trim().replace(",", ".") }

        if (parts.size < 3) {
            android.util.Log.w("BLE_PARSE", "Format invalid, parti: ${parts.size} -> $normalized")
            return null
        }

        SensorMeasurement(
            heartRate = parts[0].toDouble().toInt(),
            temperature = parts[1].toDouble(),
            humidity = parts[2].toDouble(),
            time = getCurrentTime()
        )
    } catch (e: Exception) {
        android.util.Log.e("BLE_PARSE", "Eroare parsare: ${e.message}, mesaj: $message")
        null
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN — autentificare reala la API-ul SeniorWatch
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Favorite,
                contentDescription = null,
                tint = Color(0xFF4CAF50),
                modifier = Modifier.size(64.dp)
            )

            Text(
                text = "MobileHealth",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "Autentificare",
                fontSize = 16.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email", color = Color.Gray) },
                singleLine = true,
                enabled = !isLoading,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth(),
                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF4CAF50),
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Parola", color = Color.Gray) },
                singleLine = true,
                enabled = !isLoading,
                visualTransformation = if (passwordVisible) {
                    VisualTransformation.None
                } else {
                    PasswordVisualTransformation()
                },
                trailingIcon = {
                    androidx.compose.material3.IconButton(
                        onClick = { passwordVisible = !passwordVisible }
                    ) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Info else Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color.Gray
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF4CAF50),
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = Color.Red,
                    fontSize = 14.sp
                )
            }

            Button(
                onClick = {
                    errorMessage = ""
                    isLoading = true
                    scope.launch {
                        // Login-ul e pur retea — nu are nevoie de DAO.
                        val result = runCatching {
                            ApiClient.api.login(LoginRequest(email.trim(), password))
                        }
                        isLoading = false
                        result.onSuccess { response ->
                            ApiClient.session.token = response.token
                            ApiClient.session.patientId = PATIENT_ID_FROM_WEB
                            onLoginSuccess()
                        }.onFailure {
                            errorMessage =
                                "Email sau parola incorecta " +
                                        "(sau backend-ul e oprit 23:00-09:00)."
                        }
                    }
                },
                enabled = !isLoading && email.isNotBlank() && password.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF4CAF50)
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = "Intra in aplicatie",
                        color = Color.White,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ECG WAVEFORM
// ─────────────────────────────────────────────────────────────────────────────

private fun generateEcgCycle(): List<Float> {
    fun gaussian(x: Float, mean: Float, sigma: Float, amplitude: Float): Float {
        return amplitude * kotlin.math.exp(
            -((x - mean) * (x - mean)) / (2 * sigma * sigma)
        )
    }

    return (0 until 200).map { i ->
        val t = i / 200f
        var v = 0f

        v += gaussian(t, 0.10f, 0.025f, 0.12f)   // P
        v -= gaussian(t, 0.22f, 0.007f, 0.08f)   // Q
        v += gaussian(t, 0.25f, 0.010f, 0.95f)   // R
        v -= gaussian(t, 0.28f, 0.008f, 0.15f)   // S
        v += gaussian(t, 0.42f, 0.040f, 0.20f)   // T

        v
    }
}

/*
    Momentan acest card afiseaza o forma ECG animata.
    Arduino-ul tau trimite valorile ECG brute separat pe characteristic-ul FF03.
    Ca sa afisam ECG real, trebuie modificat si BleManager.kt ca sa citeasca FF03.
*/
@Composable
fun EcgWaveformCard(isReceivingData: Boolean) {
    val displayPoints = remember { mutableStateListOf<Float>() }
    val ecgCycle = remember { generateEcgCycle() }
    var cycleIndex by remember { mutableStateOf(0) }

    LaunchedEffect(isReceivingData) {
        displayPoints.clear()
        repeat(180) { displayPoints.add(0f) }

        while (true) {
            delay(25L)

            val nextPoint = if (isReceivingData) {
                ecgCycle[cycleIndex % ecgCycle.size]
            } else {
                0f
            }

            displayPoints.add(nextPoint)

            if (displayPoints.size > 180) {
                displayPoints.removeAt(0)
            }

            cycleIndex++
        }
    }

    val lineColor = if (isReceivingData) {
        Color(0xFF4CAF50)
    } else {
        Color(0xFF607D8B)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF1A1A2E)
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = null,
                        tint = lineColor,
                        modifier = Modifier.size(18.dp)
                    )

                    Spacer(modifier = Modifier.size(6.dp))

                    Text(
                        text = "ECG — Electrocardiograma",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 15.sp
                    )
                }

                var dotVisible by remember { mutableStateOf(true) }

                LaunchedEffect(Unit) {
                    while (true) {
                        delay(600)
                        dotVisible = !dotVisible
                    }
                }

                Text(
                    text = if (dotVisible && isReceivingData) "LIVE" else "  LIVE",
                    color = lineColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp)
                    .background(Color(0xFF0D0D1A), RoundedCornerShape(10.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp)
            ) {
                val w = size.width
                val h = size.height
                val midY = h / 2f
                val amplitude = h * 0.42f
                val gridColor = Color(0xFF1E3A1E)

                for (line in listOf(0.25f, 0.5f, 0.75f)) {
                    drawLine(
                        color = gridColor,
                        start = Offset(0f, h * line),
                        end = Offset(w, h * line),
                        strokeWidth = 1f
                    )
                }

                for (col in 1..5) {
                    drawLine(
                        color = gridColor,
                        start = Offset(w * col / 6f, 0f),
                        end = Offset(w * col / 6f, h),
                        strokeWidth = 1f
                    )
                }

                if (displayPoints.size < 2) {
                    return@Canvas
                }

                val path = Path()

                displayPoints.forEachIndexed { idx, v ->
                    val x = idx / (displayPoints.size - 1f) * w
                    val y = midY - v * amplitude

                    if (idx == 0) {
                        path.moveTo(x, y)
                    } else {
                        path.lineTo(x, y)
                    }
                }

                drawPath(
                    path = path,
                    color = lineColor,
                    style = Stroke(
                        width = 2.5f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                    )
                )

                drawPath(
                    path = path,
                    color = lineColor.copy(alpha = 0.15f),
                    style = Stroke(
                        width = 8f,
                        cap = StrokeCap.Round
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = if (isReceivingData) {
                        "Semnal ECG activ"
                    } else {
                        "Astept semnal ECG..."
                    },
                    color = lineColor,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )

                Text(
                    text = "25 mm/s",
                    color = Color(0xFF607D8B),
                    fontSize = 11.sp
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun MobileHealthApp() {
    val context = LocalContext.current

    // Poarta de login se bazeaza acum pe sesiunea reala (token JWT), nu pe prefs.
    var isLoggedIn by remember { mutableStateOf(ApiClient.session.isLoggedIn) }

    if (!isLoggedIn) {
        LoginScreen(
            onLoginSuccess = { isLoggedIn = true }
        )
        return
    }

    val database = remember { AppDatabase.getDatabase(context) }
    val dao = database.healthDao()
    val coroutineScope = rememberCoroutineScope()
    val bleManager = remember { BleManager(context) }
    val repository = remember { CloudSyncRepository(dao) }
    val accelCollector = remember { AccelCollector(context) }
    var accelStatus by remember { mutableStateOf("Accelerometru: inactiv") }
    var fallDetected by remember { mutableStateOf(false) }

    // Status conexiune internet (cerinta g) — pentru afisare in UI.
    val connectivityObserver = remember { ConnectivityObserver(context) }
    val isOnline by connectivityObserver.observe().collectAsState(initial = true)

    var bleStatus by remember { mutableStateOf("Bluetooth: neconectat") }
    var lastBleMessage by remember { mutableStateOf("Niciun mesaj BLE primit.") }
    var selectedScreen by remember { mutableStateOf(Screen.Dashboard) }

    var hasReceivedSensorData by remember { mutableStateOf(false) }
    var heartRate by remember { mutableStateOf<Int?>(null) }
    var temperature by remember { mutableStateOf<Double?>(null) }
    var humidity by remember { mutableStateOf<Double?>(null) }

    var alarmMessage by remember { mutableStateOf("") }

    val recentMeasurements = remember { mutableStateListOf<SensorMeasurement>() }
    val measurementBuffer = remember { mutableStateListOf<SensorMeasurement>() }

    var lastAverage by remember { mutableStateOf<AverageMeasurement?>(null) }
    var lastSyncMessage by remember {
        mutableStateOf("Nu exista date primite inca de la senzori.")
    }

    // Corelare accel + vitale: caderea (fallDetected) intra in conditia de alarma.
    val hasAlert =
        fallDetected ||
                heartRate != null && heartRate!! > 100 ||
                temperature != null && temperature!! > 37.5 ||
                humidity != null && (humidity!! < 30.0 || humidity!! > 80.0)

    fun processMeasurement(measurement: SensorMeasurement) {
        hasReceivedSensorData = true

        heartRate = measurement.heartRate
        temperature = measurement.temperature
        humidity = measurement.humidity

        recentMeasurements.add(0, measurement)

        if (recentMeasurements.size > 6) {
            recentMeasurements.removeAt(recentMeasurements.lastIndex)
        }

        measurementBuffer.add(measurement)

        val isAlarm =
            measurement.heartRate > 100 ||
                    measurement.temperature > 37.5 ||
                    measurement.humidity < 30.0 ||
                    measurement.humidity > 80.0

        // Marcajul de 30 secunde = al 3-lea sample (3 x 10 s).
        val reached30s = measurementBuffer.size == 3

        if (reached30s) {
            val avgHeartRate = measurementBuffer.map { it.heartRate }.average()
            val avgTemperature = measurementBuffer.map { it.temperature }.average()
            val avgHumidity = measurementBuffer.map { it.humidity }.average()
            val averageTime = getCurrentTime()

            lastAverage = AverageMeasurement(
                avgHeartRate = avgHeartRate,
                avgTemperature = avgTemperature,
                avgHumidity = avgHumidity,
                time = averageTime
            )

            lastSyncMessage =
                "Medie pe 30 s la $averageTime — se trimite batch-ul la cloud."
            measurementBuffer.clear()

            coroutineScope.launch {
                dao.insertAverageMeasurement(
                    AverageMeasurementEntity(
                        avgHeartRate = avgHeartRate,
                        avgTemperature = avgTemperature,
                        avgHumidity = avgHumidity,
                        time = averageTime,
                        synced = false
                    )
                )
            }
        }

        // Inseram masuratoarea bruta; la marcajul de 30 s, sincronizam batch-ul.
        coroutineScope.launch {
            dao.insertMeasurement(
                SensorMeasurementEntity(
                    heartRate = measurement.heartRate,
                    temperature = measurement.temperature,
                    humidity = measurement.humidity.toInt(),
                    ecgStatus = "ECG transmis separat",
                    time = measurement.time,
                    synced = false
                )
            )

            if (reached30s) {
                repository.syncPending().onFailure {
                    SyncWorker.requestImmediate(context)
                    lastSyncMessage =
                        "Offline — datele raman in coada si se trimit automat la revenirea internetului."
                }
            }
        }

        // Alarma: trimitere ASINCRONA, imediat (cerintele d/f).
        if (isAlarm) {
            lastSyncMessage =
                "Alarma la ${measurement.time} — trimitere asincrona la cloud."

            coroutineScope.launch {
                dao.insertAlert(
                    AlertEntity(
                        heartRate = measurement.heartRate,
                        temperature = measurement.temperature,
                        humidity = measurement.humidity.toInt(),
                        ecgStatus = "ECG transmis separat",
                        message = alarmMessage.ifBlank { "Fara mesaj atasat" },
                        time = measurement.time,
                        synced = false
                    )
                )

                repository.syncPending().onFailure {
                    SyncWorker.requestImmediate(context)
                }
            }
        }
    }

    DisposableEffect(Unit) {
        accelCollector.start(
            onBurstReady = { samples, start, end, fall ->
                fallDetected = fall
                accelStatus = "Accel: burst de ${samples.size} mostre la ${getCurrentTime()}" +
                        if (fall) " — POSIBILA CADERE" else ""

                coroutineScope.launch {
                    // Persistam burst-ul in Room (synced=false), apoi incercam trimiterea.
                    repository.queueAccelBurst(samples, start, end, fall)
                    repository.syncPending().onFailure { SyncWorker.requestImmediate(context) }
                }

                if (fall) {
                    coroutineScope.launch {
                        dao.insertAlert(
                            AlertEntity(
                                heartRate = heartRate ?: 0,
                                temperature = temperature ?: 0.0,
                                humidity = (humidity ?: 0.0).toInt(),
                                ecgStatus = "ECG transmis separat",
                                message = "Posibila cadere detectata (accelerometru)",
                                time = getCurrentTime(),
                                synced = false
                            )
                        )
                        repository.syncPending().onFailure { SyncWorker.requestImmediate(context) }
                    }
                }
            }
        )
        onDispose { accelCollector.stop() }
    }

    MaterialTheme {
        @OptIn(ExperimentalMaterial3Api::class)
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = "MobileHealth",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    },
                    actions = {
                        OutlinedButton(
                            onClick = {
                                ApiClient.session.clear()
                                isLoggedIn = false
                            },
                            modifier = Modifier.padding(end = 8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFFE53935)
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )

                            Spacer(modifier = Modifier.size(4.dp))

                            Text(
                                text = "Iesire",
                                fontSize = 13.sp
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.White,
                        titleContentColor = Color(0xFF0D47A1)
                    )
                )
            },
            bottomBar = {
                BottomMenu(
                    selectedScreen = selectedScreen,
                    onScreenSelected = { selectedScreen = it }
                )
            }
        ) { paddingValues ->
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                color = Color(0xFFF4F7FB)
            ) {
                when (selectedScreen) {
                    Screen.Dashboard -> DashboardScreen(
                        hasReceivedSensorData = hasReceivedSensorData,
                        heartRate = heartRate,
                        temperature = temperature,
                        humidity = humidity,
                        hasAlert = hasAlert,
                        isOnline = isOnline,
                        accelStatus = accelStatus,
                        recentMeasurements = recentMeasurements,
                        lastAverage = lastAverage,
                        lastSyncMessage = lastSyncMessage,
                        bleStatus = bleStatus,
                        lastBleMessage = lastBleMessage,
                        onConnectBluetooth = {
                            bleManager.startScan(
                                onStatusChanged = { status ->
                                    bleStatus = status
                                },
                                onDataReceived = { message ->
                                    lastBleMessage = message

                                    val measurement =
                                        parseBleMessageToMeasurement(message)

                                    if (measurement != null) {
                                        processMeasurement(measurement)
                                        bleStatus =
                                            "Mesaj BLE primit si procesat la ${measurement.time}: $message"
                                    } else {
                                        bleStatus =
                                            "Mesaj BLE primit, dar format invalid: $message"
                                    }
                                }
                            )
                        },
                        onDisconnectBluetooth = {
                            bleManager.disconnect()
                            bleStatus = "Bluetooth: deconectat manual"
                        },
                        onClearDisplayedData = {
                            hasReceivedSensorData = false
                            heartRate = null
                            temperature = null
                            humidity = null
                            alarmMessage = ""
                            recentMeasurements.clear()
                            measurementBuffer.clear()
                            lastAverage = null
                            fallDetected = false
                            accelStatus = "Accelerometru: inactiv"
                            lastSyncMessage =
                                "Nu exista date primite inca de la senzori."
                            lastBleMessage = "Niciun mesaj BLE primit."
                        }
                    )

                    Screen.Activities -> ActivitiesScreen()

                    Screen.Recommendations -> RecommendationsScreen()

                    Screen.Alerts -> AlertsScreen(
                        heartRate = heartRate,
                        temperature = temperature,
                        humidity = humidity,
                        hasAlert = hasAlert,
                        alarmMessage = alarmMessage,
                        onAlarmMessageChange = { alarmMessage = it }
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

enum class Screen(
    val title: String,
    val icon: ImageVector
) {
    Dashboard("Monitorizare", Icons.Default.Favorite),
    Activities("Activitati", Icons.Default.DateRange),
    Recommendations("Recomandari", Icons.Default.Info),
    Alerts("Avertizari", Icons.Default.Notifications)
}

@Composable
fun BottomMenu(
    selectedScreen: Screen,
    onScreenSelected: (Screen) -> Unit
) {
    NavigationBar(
        containerColor = Color.White
    ) {
        Screen.entries.forEach { screen ->
            NavigationBarItem(
                selected = selectedScreen == screen,
                onClick = { onScreenSelected(screen) },
                icon = {
                    Icon(
                        imageVector = screen.icon,
                        contentDescription = screen.title
                    )
                },
                label = {
                    Text(
                        text = screen.title,
                        fontSize = 11.sp
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color(0xFF1565C0),
                    selectedTextColor = Color(0xFF1565C0),
                    indicatorColor = Color(0xFFE3F2FD)
                )
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun DashboardScreen(
    hasReceivedSensorData: Boolean,
    heartRate: Int?,
    temperature: Double?,
    humidity: Double?,
    hasAlert: Boolean,
    isOnline: Boolean,
    accelStatus: String,
    recentMeasurements: List<SensorMeasurement>,
    lastAverage: AverageMeasurement?,
    lastSyncMessage: String,
    bleStatus: String,
    lastBleMessage: String,
    onConnectBluetooth: () -> Unit,
    onDisconnectBluetooth: () -> Unit,
    onClearDisplayedData: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(
            title = "Monitorizare pacient",
            subtitle = "Date primite de la modulul inteligent prin Bluetooth"
        )

        if (!hasReceivedSensorData) {
            InfoCard(
                title = "Astept date de la senzori",
                description = "Conecteaza ESP32-ul prin Bluetooth. Valorile vor fi afisate doar dupa ce aplicatia primeste primul mesaj BLE."
            )
        }

        if (hasAlert) {
            AlertCard(
                title = "Avertizare activa",
                description = "A fost detectata o valoare in afara limitelor normale (puls, temperatura, umiditate) sau o posibila cadere."
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MeasurementCard(
                title = "Puls",
                value = heartRate?.toString() ?: "Astept",
                unit = if (heartRate != null) "bpm" else "",
                modifier = Modifier.weight(1f),
                isWarning = heartRate != null && heartRate > 100
            )

            MeasurementCard(
                title = "Temperatura",
                value = temperature?.let { String.format("%.1f", it) } ?: "Astept",
                unit = if (temperature != null) "gradeC" else "",
                modifier = Modifier.weight(1f),
                isWarning = temperature != null && temperature > 37.5
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MeasurementCard(
                title = "Umiditate",
                value = humidity?.let { String.format("%.1f", it) } ?: "Astept",
                unit = if (humidity != null) "%" else "",
                modifier = Modifier.weight(1f),
                isWarning = humidity != null && (humidity < 30.0 || humidity > 80.0)
            )

            MeasurementCard(
                title = "ECG",
                value = if (hasReceivedSensorData) "Live" else "Astept",
                unit = "",
                modifier = Modifier.weight(1f),
                isWarning = false
            )
        }

        EcgWaveformCard(
            isReceivingData = hasReceivedSensorData
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(
                defaultElevation = 3.dp
            )
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Conexiune Bluetooth ESP32",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1565C0)
                )

                Text(
                    text = bleStatus,
                    fontSize = 14.sp,
                    color = Color.DarkGray
                )

                Text(
                    text = "Ultimul mesaj primit: $lastBleMessage",
                    fontSize = 14.sp,
                    color = Color.DarkGray
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick = onConnectBluetooth,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF1565C0)
                        )
                    ) {
                        Text(
                            text = "Conecteaza ESP32",
                            fontSize = 14.sp,
                            color = Color.White
                        )
                    }

                    OutlinedButton(
                        onClick = onDisconnectBluetooth,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "Deconecteaza",
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }

        OutlinedButton(
            onClick = onClearDisplayedData,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = "Sterge datele afisate",
                fontSize = 16.sp
            )
        }

        StatusCard(
            title = "Status sistem",
            lines = listOf(
                bleStatus,
                if (isOnline) "Internet: online" else "Internet: OFFLINE — date in coada locala",
                "Cloud: sincronizare REST catre backend",
                accelStatus,
                if (hasReceivedSensorData) {
                    "Date senzori: primite"
                } else {
                    "Date senzori: in asteptare"
                },
                if (hasAlert) {
                    "Status pacient: avertizare activa"
                } else {
                    "Status pacient: fara avertizare activa"
                }
            )
        )

        StatusCard(
            title = "Sincronizare cloud",
            lines = listOf(
                lastSyncMessage,
                "Date normale: batch (medie pe 30 s) trimis la 30 secunde",
                "Date anormale: alarma trimisa asincron, imediat",
                "Accelerometru: burst de 30 mostre (1 Hz) la 30 secunde"
            )
        )

        if (lastAverage != null) {
            StatusCard(
                title = "Ultima medie calculata pentru 30 secunde",
                lines = listOf(
                    "Ora calculului: ${lastAverage.time}",
                    "Puls mediu: ${String.format("%.1f", lastAverage.avgHeartRate)} bpm",
                    "Temperatura medie: ${String.format("%.1f", lastAverage.avgTemperature)} gradeC",
                    "Umiditate medie: ${String.format("%.1f", lastAverage.avgHumidity)} %"
                )
            )
        }

        if (recentMeasurements.isNotEmpty()) {
            StatusCard(
                title = "Ultimele masuratori primite prin Bluetooth",
                lines = recentMeasurements.map {
                    "${it.time} - Puls: ${it.heartRate} bpm, Temp: ${
                        String.format("%.1f", it.temperature)
                    } gradeC, Umiditate: ${String.format("%.1f", it.humidity)} %"
                }
            )
        }

        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun ActivitiesScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(
            title = "Activitati si calendar",
            subtitle = "Activitatile recomandate pacientului"
        )

        InfoCard("09:00", "Masurare puls si temperatura")
        InfoCard("11:00", "Plimbare usoara 15 minute")
        InfoCard("14:00", "Administrare tratament")
        InfoCard("18:00", "Exercitii de respiratie")
    }
}

@Composable
fun RecommendationsScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(
            title = "Recomandarile medicului",
            subtitle = "Indicatii primite prin componenta cloud"
        )

        InfoCard("Recomandare 1", "Evitati efortul fizic intens.")
        InfoCard("Recomandare 2", "Respectati tratamentul conform programului.")
        InfoCard("Recomandare 3", "Contactati medicul daca apar ameteli sau dureri in piept.")
    }
}

@Composable
fun AlertsScreen(
    heartRate: Int?,
    temperature: Double?,
    humidity: Double?,
    hasAlert: Boolean,
    alarmMessage: String,
    onAlarmMessageChange: (String) -> Unit
) {
    var temporaryMessage by remember {
        mutableStateOf(alarmMessage)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(
            title = "Avertizari",
            subtitle = "Alerte generate pe baza valorilor anormale"
        )

        if (hasAlert && heartRate != null && temperature != null && humidity != null) {
            AlertCard(
                title = "Avertizare activa",
                description = "A fost detectata o valoare anormala. Verifica pulsul, temperatura sau umiditatea."
            )

            StatusCard(
                title = "Date asociate avertizarii",
                lines = listOf(
                    "Puls: $heartRate bpm",
                    "Temperatura: ${String.format("%.1f", temperature)} gradeC",
                    "Umiditate: ${String.format("%.1f", humidity)} %",
                    "ECG: transmis separat ca valori brute ADC",
                    "Tip trimitere: asincron, imediat dupa producerea alarmei"
                )
            )

            OutlinedTextField(
                value = temporaryMessage,
                onValueChange = { temporaryMessage = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Mesaj pacient") },
                placeholder = {
                    Text("Exemplu: Ma simt ametit sau am facut efort.")
                },
                minLines = 3
            )

            Button(
                onClick = {
                    onAlarmMessageChange(temporaryMessage)
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1565C0)
                )
            ) {
                Text(
                    text = "Ataseaza mesaj la alarma",
                    fontSize = 16.sp,
                    color = Color.White
                )
            }

            if (alarmMessage.isNotBlank()) {
                InfoCard(
                    title = "Mesaj atasat alarmei",
                    description = alarmMessage
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        } else {
            AlertCard(
                title = "Nu exista avertizari active",
                description = "Nu a fost primita nicio valoare anormala de la senzori sau ultimele valori sunt in limite normale."
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun HeaderSection(
    title: String,
    subtitle: String
) {
    Column {
        Text(
            text = title,
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF0D47A1)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = subtitle,
            fontSize = 15.sp,
            color = Color.DarkGray
        )
    }
}

@Composable
fun MeasurementCard(
    title: String,
    value: String,
    unit: String,
    modifier: Modifier = Modifier,
    isWarning: Boolean = false
) {
    Card(
        modifier = modifier.height(130.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isWarning) {
                Color(0xFFFFF3E0)
            } else {
                Color.White
            }
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = title,
                fontSize = 15.sp,
                color = Color.Gray
            )

            Column {
                Text(
                    text = value,
                    fontSize = if (value == "Astept") 20.sp else 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isWarning) {
                        Color(0xFFE65100)
                    } else {
                        Color(0xFF1565C0)
                    }
                )

                if (unit.isNotEmpty()) {
                    Text(
                        text = unit,
                        fontSize = 14.sp,
                        color = Color.DarkGray
                    )
                }
            }
        }
    }
}

@Composable
fun StatusCard(
    title: String,
    lines: List<String>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1565C0)
            )

            lines.forEach { line ->
                Text(
                    text = line,
                    fontSize = 14.sp,
                    color = Color.DarkGray
                )
            }
        }
    }
}

@Composable
fun InfoCard(
    title: String,
    description: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 3.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(18.dp)
        ) {
            Text(
                text = title,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1565C0)
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = description,
                fontSize = 15.sp,
                color = Color.DarkGray
            )
        }
    }
}

@Composable
fun AlertCard(
    title: String,
    description: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFFF3E0)
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 3.dp
        )
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(
                        Color(0xFFFFB74D),
                        RoundedCornerShape(50)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = null,
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.size(12.dp))

            Column {
                Text(
                    text = title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFE65100)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.DarkGray
                )
            }
        }
    }
}