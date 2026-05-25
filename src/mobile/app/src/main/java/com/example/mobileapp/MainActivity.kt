package com.example.mobileapp

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mobileapp.data.bluetooth.BleManager
import com.example.mobileapp.data.local.AlertEntity
import com.example.mobileapp.data.local.AppDatabase
import com.example.mobileapp.data.local.AverageMeasurementEntity
import com.example.mobileapp.data.local.SensorMeasurementEntity
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY
// ─────────────────────────────────────────────────────────────────────────────

class MainActivity : ComponentActivity() {

    private val bluetoothPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestBluetoothPermissions()
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
    val spo2: Int,
    val ecgStatus: String,
    val time: String
)

data class AverageMeasurement(
    val avgHeartRate: Double,
    val avgTemperature: Double,
    val avgSpo2: Double,
    val time: String
)

fun getCurrentTime(): String {
    val formatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    return formatter.format(Date())
}

fun parseBleMessageToMeasurement(message: String): SensorMeasurement? {
    return try {
        val parts = message.trim().replace(",", ".").split(";")
        if (parts.size < 4) return null
        SensorMeasurement(
            heartRate   = parts[0].trim().toDouble().toInt(),
            temperature = parts[1].trim().toDouble(),
            spo2        = parts[2].trim().toDouble().toInt(),
            ecgStatus   = parts[3].trim(),
            time        = getCurrentTime()
        )
    } catch (e: Exception) { null }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    var username      by remember { mutableStateOf("") }
    var password      by remember { mutableStateOf("") }
    var errorMessage  by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val VALID_USER = "admin"
    val VALID_PASS = "1234"

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
            Text("MobileHealth", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("Autentificare", fontSize = 16.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Utilizator", color = Color.Gray) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor   = Color(0xFF4CAF50),
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor     = Color.White,
                    unfocusedTextColor   = Color.White
                )
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Parolă", color = Color.Gray) },
                singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None
                else PasswordVisualTransformation(),
                trailingIcon = {
                    androidx.compose.material3.IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Default.Info else Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color.Gray
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                    focusedBorderColor   = Color(0xFF4CAF50),
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor     = Color.White,
                    unfocusedTextColor   = Color.White
                )
            )

            if (errorMessage.isNotEmpty()) {
                Text(text = errorMessage, color = Color.Red, fontSize = 14.sp)
            }

            Button(
                onClick = {
                    if (username == VALID_USER && password == VALID_PASS) onLoginSuccess()
                    else errorMessage = "Utilizator sau parolă incorectă."
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
            ) {
                Text("Intră în aplicație", color = Color.White, fontSize = 16.sp)
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ECG WAVEFORM
// ─────────────────────────────────────────────────────────────────────────────

private fun generateEcgCycle(): List<Float> {
    fun gaussian(x: Float, mean: Float, sigma: Float, amplitude: Float) =
        amplitude * kotlin.math.exp(-((x - mean) * (x - mean)) / (2 * sigma * sigma))

    return (0 until 200).map { i ->
        val t = i / 200f
        var v = 0f
        v += gaussian(t, 0.10f, 0.025f, 0.12f)   // P wave
        v -= gaussian(t, 0.22f, 0.007f, 0.08f)   // Q
        v += gaussian(t, 0.25f, 0.010f, 0.95f)   // R
        v -= gaussian(t, 0.28f, 0.008f, 0.15f)   // S
        v += gaussian(t, 0.42f, 0.040f, 0.20f)   // T wave
        v
    }
}

@Composable
fun EcgWaveformCard(ecgStatus: String?) {
    val isAnormal = ecgStatus.equals("Anormal", ignoreCase = true)
    val isWaiting = ecgStatus == null

    val displayPoints = remember { mutableStateListOf<Float>() }
    val ecgCycle      = remember { generateEcgCycle() }
    var cycleIndex    by remember { mutableStateOf(0) }

    LaunchedEffect(Unit) {
        repeat(180) { displayPoints.add(0f) }
        while (true) {
            delay(25L)
            val nextPoint = when {
                isWaiting  -> 0f
                isAnormal  -> ecgCycle[cycleIndex % ecgCycle.size] + (Math.random().toFloat() - 0.5f) * 0.15f
                else       -> ecgCycle[cycleIndex % ecgCycle.size]
            }
            displayPoints.add(nextPoint)
            if (displayPoints.size > 180) displayPoints.removeAt(0)
            cycleIndex++
        }
    }

    val lineColor = when {
        isWaiting -> Color(0xFF607D8B)
        isAnormal -> Color(0xFFFF5252)
        else      -> Color(0xFF4CAF50)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A2E)),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Favorite,
                        contentDescription = null,
                        tint = lineColor,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.size(6.dp))
                    Text(
                        text = "ECG — Electrocardiogramă",
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 15.sp
                    )
                }
                var dotVisible by remember { mutableStateOf(true) }
                LaunchedEffect(Unit) { while (true) { delay(600); dotVisible = !dotVisible } }
                Text(
                    text = if (dotVisible && !isWaiting) "● LIVE" else "  LIVE",
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
                    drawLine(gridColor, Offset(0f, h * line), Offset(w, h * line), strokeWidth = 1f)
                }
                for (col in 1..5) {
                    drawLine(gridColor, Offset(w * col / 6f, 0f), Offset(w * col / 6f, h), strokeWidth = 1f)
                }

                if (displayPoints.size < 2) return@Canvas

                val path = Path()
                displayPoints.forEachIndexed { idx, v ->
                    val x = idx / (displayPoints.size - 1f) * w
                    val y = midY - v * amplitude
                    if (idx == 0) path.moveTo(x, y) else path.lineTo(x, y)
                }
                drawPath(path, lineColor, style = Stroke(width = 2.5f, cap = StrokeCap.Round, join = StrokeJoin.Round))
                drawPath(path, lineColor.copy(alpha = 0.15f), style = Stroke(width = 8f, cap = StrokeCap.Round))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = when {
                        isWaiting -> "Aștept semnal ECG..."
                        isAnormal -> "⚠ Ritm neregulat detectat"
                        else      -> "✓ Ritm sinusal normal"
                    },
                    color = lineColor, fontSize = 13.sp, fontWeight = FontWeight.Medium
                )
                Text(text = "25 mm/s", color = Color(0xFF607D8B), fontSize = 11.sp)
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
    val prefs = remember { context.getSharedPreferences("auth_prefs", android.content.Context.MODE_PRIVATE) }
    var isLoggedIn by remember { mutableStateOf(prefs.getBoolean("is_logged_in", false)) }

    if (!isLoggedIn) {
        LoginScreen(onLoginSuccess = {
            prefs.edit().putBoolean("is_logged_in", true).apply()
            isLoggedIn = true
        })
        return
    }

    val database     = remember { AppDatabase.getDatabase(context) }
    val dao          = database.healthDao()
    val coroutineScope = rememberCoroutineScope()
    val bleManager   = remember { BleManager(context) }

    var bleStatus          by remember { mutableStateOf("Bluetooth: neconectat") }
    var lastBleMessage     by remember { mutableStateOf("Niciun mesaj BLE primit.") }
    var selectedScreen     by remember { mutableStateOf(Screen.Dashboard) }
    var hasReceivedSensorData by remember { mutableStateOf(false) }
    var heartRate          by remember { mutableStateOf<Int?>(null) }
    var temperature        by remember { mutableStateOf<Double?>(null) }
    var spo2               by remember { mutableStateOf<Int?>(null) }
    var ecgStatus          by remember { mutableStateOf<String?>(null) }
    var alarmMessage       by remember { mutableStateOf("") }

    val recentMeasurements  = remember { mutableStateListOf<SensorMeasurement>() }
    val measurementBuffer   = remember { mutableStateListOf<SensorMeasurement>() }

    var lastAverage     by remember { mutableStateOf<AverageMeasurement?>(null) }
    var lastSyncMessage by remember { mutableStateOf("Nu există date primite încă de la senzori.") }

    val hasAlert = heartRate != null && heartRate!! > 100

    fun processMeasurement(measurement: SensorMeasurement) {
        hasReceivedSensorData = true
        heartRate   = measurement.heartRate
        temperature = measurement.temperature
        spo2        = measurement.spo2
        ecgStatus   = measurement.ecgStatus

        recentMeasurements.add(0, measurement)
        if (recentMeasurements.size > 6) recentMeasurements.removeAt(recentMeasurements.lastIndex)

        measurementBuffer.add(measurement)

        val isAlarm = measurement.heartRate > 100 ||
                measurement.spo2 < 92 ||
                measurement.temperature > 37.5 ||
                measurement.ecgStatus.equals("Anormal", ignoreCase = true)

        coroutineScope.launch {
            dao.insertMeasurement(
                SensorMeasurementEntity(
                    heartRate   = measurement.heartRate,
                    temperature = measurement.temperature,
                    humidity    = measurement.spo2,
                    ecgStatus   = measurement.ecgStatus,
                    time        = measurement.time,
                    synced      = false
                )
            )
        }

        if (measurementBuffer.size == 3) {
            val avgHeartRate   = measurementBuffer.map { it.heartRate }.average()
            val avgTemperature = measurementBuffer.map { it.temperature }.average()
            val avgSpo2        = measurementBuffer.map { it.spo2 }.average()
            val averageTime    = getCurrentTime()

            lastAverage    = AverageMeasurement(avgHeartRate, avgTemperature, avgSpo2, averageTime)
            lastSyncMessage = "Medie calculată pentru 30 secunde la $averageTime."
            measurementBuffer.clear()

            coroutineScope.launch {
                dao.insertAverageMeasurement(
                    AverageMeasurementEntity(
                        avgHeartRate   = avgHeartRate,
                        avgTemperature = avgTemperature,
                        avgHumidity    = avgSpo2,
                        time           = averageTime,
                        synced         = false
                    )
                )
            }
        }

        if (isAlarm) {
            lastSyncMessage = "Alarmă salvată local și pregătită pentru cloud la ${measurement.time}."
            coroutineScope.launch {
                dao.insertAlert(
                    AlertEntity(
                        heartRate   = measurement.heartRate,
                        temperature = measurement.temperature,
                        humidity    = measurement.spo2,
                        ecgStatus   = measurement.ecgStatus,
                        message     = alarmMessage.ifBlank { "Fără mesaj atașat" },
                        time        = measurement.time,
                        synced      = false
                    )
                )
            }
        }
    }

    MaterialTheme {
        Scaffold(
            bottomBar = {
                BottomMenu(selectedScreen = selectedScreen, onScreenSelected = { selectedScreen = it })
            }
        ) { paddingValues ->
            Surface(
                modifier = Modifier.fillMaxSize().padding(paddingValues),
                color = Color(0xFFF4F7FB)
            ) {
                when (selectedScreen) {
                    Screen.Dashboard -> DashboardScreen(
                        hasReceivedSensorData  = hasReceivedSensorData,
                        heartRate              = heartRate,
                        temperature            = temperature,
                        spo2                   = spo2,
                        ecgStatus              = ecgStatus,
                        hasAlert               = hasAlert,
                        recentMeasurements     = recentMeasurements,
                        lastAverage            = lastAverage,
                        lastSyncMessage        = lastSyncMessage,
                        bleStatus              = bleStatus,
                        lastBleMessage         = lastBleMessage,
                        onConnectBluetooth     = {
                            bleManager.startScan(
                                onStatusChanged = { status -> bleStatus = status },
                                onDataReceived  = { message ->
                                    lastBleMessage = message
                                    val measurement = parseBleMessageToMeasurement(message)
                                    if (measurement != null) {
                                        processMeasurement(measurement)
                                        bleStatus = "Mesaj BLE primit și procesat la ${measurement.time}: $message"
                                    } else {
                                        bleStatus = "Mesaj BLE primit, dar format invalid: $message"
                                    }
                                }
                            )
                        },
                        onDisconnectBluetooth  = {
                            bleManager.disconnect()
                            bleStatus = "Bluetooth: deconectat manual"
                        },
                        onClearDisplayedData   = {
                            hasReceivedSensorData = false
                            heartRate   = null; temperature = null; spo2 = null; ecgStatus = null
                            alarmMessage = ""
                            recentMeasurements.clear(); measurementBuffer.clear()
                            lastAverage     = null
                            lastSyncMessage = "Nu există date primite încă de la senzori."
                            lastBleMessage  = "Niciun mesaj BLE primit."
                        }
                    )
                    Screen.Activities       -> ActivitiesScreen()
                    Screen.Recommendations  -> RecommendationsScreen()
                    Screen.Alerts           -> AlertsScreen(
                        heartRate            = heartRate,
                        temperature          = temperature,
                        spo2                 = spo2,
                        ecgStatus            = ecgStatus,
                        hasAlert             = hasAlert,
                        alarmMessage         = alarmMessage,
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

enum class Screen(val title: String, val icon: ImageVector) {
    Dashboard("Monitorizare", Icons.Default.Favorite),
    Activities("Activități", Icons.Default.DateRange),
    Recommendations("Recomandări", Icons.Default.Info),
    Alerts("Avertizări", Icons.Default.Notifications)
}

@Composable
fun BottomMenu(selectedScreen: Screen, onScreenSelected: (Screen) -> Unit) {
    NavigationBar(containerColor = Color.White) {
        Screen.entries.forEach { screen ->
            NavigationBarItem(
                selected = selectedScreen == screen,
                onClick  = { onScreenSelected(screen) },
                icon     = { Icon(screen.icon, contentDescription = screen.title) },
                label    = { Text(screen.title, fontSize = 11.sp) },
                colors   = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color(0xFF1565C0),
                    selectedTextColor = Color(0xFF1565C0),
                    indicatorColor    = Color(0xFFE3F2FD)
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
    spo2: Int?,
    ecgStatus: String?,
    hasAlert: Boolean,
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
            title    = "Monitorizare pacient",
            subtitle = "Date primite de la modulul inteligent prin Bluetooth"
        )

        if (!hasReceivedSensorData) {
            InfoCard(
                title       = "Aștept date de la senzori",
                description = "Conectează ESP32-ul prin Bluetooth. Valorile vor fi afișate doar după ce aplicația primește primul mesaj BLE."
            )
        }

        if (hasAlert && heartRate != null) {
            AlertCard(
                title       = "Avertizare activă",
                description = "A fost detectată o valoare în afara limitelor normale. Verifică pulsul, SpO2, temperatura sau statusul ECG."
            )
        }

        // ── Rând 1: Puls + Temperatură ──────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MeasurementCard(
                title     = "Puls",
                value     = heartRate?.toString() ?: "Aștept",
                unit      = if (heartRate != null) "bpm" else "",
                modifier  = Modifier.weight(1f),
                isWarning = heartRate != null && heartRate > 100
            )
            MeasurementCard(
                title     = "Temperatură",
                value     = temperature?.let { String.format("%.1f", it) } ?: "Aștept",
                unit      = if (temperature != null) "°C" else "",
                modifier  = Modifier.weight(1f),
                isWarning = temperature != null && temperature > 37.5
            )
        }

        // ── Rând 2: SpO2 + ECG status ────────────────────────────────
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MeasurementCard(
                title     = "SpO2",
                value     = spo2?.toString() ?: "Aștept",
                unit      = if (spo2 != null) "%" else "",
                modifier  = Modifier.weight(1f),
                isWarning = spo2 != null && spo2 < 92
            )
            MeasurementCard(
                title     = "ECG",
                value     = ecgStatus ?: "Aștept",
                unit      = "",
                modifier  = Modifier.weight(1f),
                isWarning = ecgStatus.equals("Anormal", ignoreCase = true)
            )
        }

        // ── Graf ECG animat ──────────────────────────────────────────
        EcgWaveformCard(ecgStatus = ecgStatus)

        // ── Card Bluetooth ───────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape    = RoundedCornerShape(18.dp),
            colors   = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("Conexiune Bluetooth ESP32", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1565C0))
                Text(bleStatus,         fontSize = 14.sp, color = Color.DarkGray)
                Text("Ultimul mesaj primit: $lastBleMessage", fontSize = 14.sp, color = Color.DarkGray)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Button(
                        onClick  = onConnectBluetooth,
                        modifier = Modifier.weight(1f),
                        colors   = ButtonDefaults.buttonColors(containerColor = Color(0xFF1565C0))
                    ) {
                        Text("Conectează ESP32", fontSize = 14.sp, color = Color.White)
                    }
                    OutlinedButton(
                        onClick  = onDisconnectBluetooth,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Deconectează", fontSize = 14.sp)
                    }
                }
            }
        }

        OutlinedButton(onClick = onClearDisplayedData, modifier = Modifier.fillMaxWidth()) {
            Text("Șterge datele afișate", fontSize = 16.sp)
        }

        StatusCard(
            title = "Status sistem",
            lines = listOf(
                bleStatus,
                "Cloud: simulare sincronizare",
                if (hasReceivedSensorData) "Date senzori: primite" else "Date senzori: în așteptare",
                if (hasAlert) "Status pacient: avertizare activă" else "Status pacient: fără avertizare activă"
            )
        )

        StatusCard(
            title = "Sincronizare cloud simulată",
            lines = listOf(
                lastSyncMessage,
                "Date normale: medie trimisă la 30 secunde",
                "Date anormale: alarmă trimisă imediat"
            )
        )

        if (lastAverage != null) {
            StatusCard(
                title = "Ultima medie calculată pentru 30 secunde",
                lines = listOf(
                    "Ora calculului: ${lastAverage.time}",
                    "Puls mediu: ${String.format("%.1f", lastAverage.avgHeartRate)} bpm",
                    "Temperatură medie: ${String.format("%.1f", lastAverage.avgTemperature)} °C",
                    "SpO2 mediu: ${String.format("%.1f", lastAverage.avgSpo2)} %"
                )
            )
        }

        if (recentMeasurements.isNotEmpty()) {
            StatusCard(
                title = "Ultimele măsurători primite prin Bluetooth",
                lines = recentMeasurements.map {
                    "${it.time} - Puls: ${it.heartRate} bpm, Temp: ${
                        String.format("%.1f", it.temperature)
                    } °C, SpO2: ${it.spo2} %, ECG: ${it.ecgStatus}"
                }
            )
        }

        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun ActivitiesScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(title = "Activități și calendar", subtitle = "Activitățile recomandate pacientului")
        InfoCard("09:00", "Măsurare puls și temperatură")
        InfoCard("11:00", "Plimbare ușoară 15 minute")
        InfoCard("14:00", "Administrare tratament")
        InfoCard("18:00", "Exerciții de respirație")
    }
}

@Composable
fun RecommendationsScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(title = "Recomandările medicului", subtitle = "Indicații primite prin componenta cloud")
        InfoCard("Recomandare 1", "Evitați efortul fizic intens.")
        InfoCard("Recomandare 2", "Respectați tratamentul conform programului.")
        InfoCard("Recomandare 3", "Contactați medicul dacă apar amețeli sau dureri în piept.")
    }
}

@Composable
fun AlertsScreen(
    heartRate: Int?,
    temperature: Double?,
    spo2: Int?,
    ecgStatus: String?,
    hasAlert: Boolean,
    alarmMessage: String,
    onAlarmMessageChange: (String) -> Unit
) {
    var temporaryMessage by remember { mutableStateOf(alarmMessage) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        HeaderSection(title = "Avertizări", subtitle = "Alerte generate pe baza valorilor anormale")

        if (hasAlert && heartRate != null && temperature != null && spo2 != null && ecgStatus != null) {
            AlertCard(
                title       = "Avertizare activă",
                description = "A fost detectată o valoare anormală. Verifică pulsul, SpO2, temperatura sau statusul ECG."
            )
            StatusCard(
                title = "Date asociate avertizării",
                lines = listOf(
                    "Puls: $heartRate bpm",
                    "Temperatură: ${String.format("%.1f", temperature)} °C",
                    "SpO2: $spo2 %",
                    "ECG: $ecgStatus",
                    "Tip trimitere: asincron, imediat după producerea alarmei"
                )
            )
            OutlinedTextField(
                value         = temporaryMessage,
                onValueChange = { temporaryMessage = it },
                modifier      = Modifier.fillMaxWidth(),
                label         = { Text("Mesaj pacient") },
                placeholder   = { Text("Exemplu: Mă simt amețit sau am făcut efort.") },
                minLines      = 3
            )
            Button(
                onClick   = { onAlarmMessageChange(temporaryMessage) },
                modifier  = Modifier.fillMaxWidth(),
                colors    = ButtonDefaults.buttonColors(containerColor = Color(0xFF1565C0))
            ) {
                Text("Atașează mesaj la alarmă", fontSize = 16.sp, color = Color.White)
            }
            if (alarmMessage.isNotBlank()) {
                InfoCard(title = "Mesaj atașat alarmei", description = alarmMessage)
            }
            Spacer(modifier = Modifier.height(20.dp))
        } else {
            AlertCard(
                title       = "Nu există avertizări active",
                description = "Nu a fost primită nicio valoare anormală de la senzori sau ultimele valori sunt în limite normale."
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun HeaderSection(title: String, subtitle: String) {
    Column {
        Text(title,    fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0D47A1))
        Spacer(modifier = Modifier.height(6.dp))
        Text(subtitle, fontSize = 15.sp, color = Color.DarkGray)
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
        modifier  = modifier.height(130.dp),
        shape     = RoundedCornerShape(20.dp),
        colors    = CardDefaults.cardColors(containerColor = if (isWarning) Color(0xFFFFF3E0) else Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(title, fontSize = 15.sp, color = Color.Gray)
            Column {
                Text(
                    text       = value,
                    fontSize   = if (value == "Aștept") 20.sp else 28.sp,
                    fontWeight = FontWeight.Bold,
                    color      = if (isWarning) Color(0xFFE65100) else Color(0xFF1565C0)
                )
                if (unit.isNotEmpty()) Text(unit, fontSize = 14.sp, color = Color.DarkGray)
            }
        }
    }
}

@Composable
fun StatusCard(title: String, lines: List<String>) {
    Card(
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(20.dp),
        colors    = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1565C0))
            lines.forEach { line -> Text(line, fontSize = 14.sp, color = Color.DarkGray) }
        }
    }
}

@Composable
fun InfoCard(title: String, description: String) {
    Card(
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(18.dp),
        colors    = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(title,       fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1565C0))
            Spacer(modifier = Modifier.height(6.dp))
            Text(description, fontSize = 15.sp, color = Color.DarkGray)
        }
    }
}

@Composable
fun AlertCard(title: String, description: String) {
    Card(
        modifier  = Modifier.fillMaxWidth(),
        shape     = RoundedCornerShape(18.dp),
        colors    = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0)),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .background(Color(0xFFFFB74D), RoundedCornerShape(50)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White)
            }
            Spacer(modifier = Modifier.size(12.dp))
            Column {
                Text(title,       fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE65100))
                Spacer(modifier = Modifier.height(4.dp))
                Text(description, fontSize = 14.sp, color = Color.DarkGray)
            }
        }
    }
}