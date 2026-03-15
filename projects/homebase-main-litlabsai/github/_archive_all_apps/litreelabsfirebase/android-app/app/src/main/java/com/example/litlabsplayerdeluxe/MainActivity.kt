package com.example.litlabsplayerdeluxe

import android.Manifest
import android.app.Application
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import com.example.litlabsplayerdeluxe.ui.theme.LiTLabsPlayerDeluxeTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Tune
import androidx.media3.exoplayer.ExoPlayer
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {

    @Suppress("unused") // This property is used in setContent, but the linter can't see it.
    private val godModeViewModel: GodModeViewModel by viewModels {
        GodModeViewModelFactory(application, loadFromDataStore = true)
    }

    @Suppress("unused") // This property is used across multiple lifecycle methods.
    private lateinit var exoPlayer: ExoPlayer

    private val mediaPermissions: Array<String> by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(Manifest.permission.READ_MEDIA_AUDIO, Manifest.permission.READ_MEDIA_VIDEO)
        } else {
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // No direct state mutation here — MediaLibraryScreen will re-check on resume
        // If you want to perform immediate action, you can bridge a shared state etc.
    }

    private fun ensurePermissions() {
        val notGranted = mediaPermissions.any { perm ->
            ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED
        }
        if (notGranted) {
            permissionLauncher.launch(mediaPermissions)
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        exoPlayer = ExoPlayer.Builder(this).build()

        setContent {
            MainScreen(exoPlayer = exoPlayer, godModeViewModel = godModeViewModel) { ensurePermissions() }
        }
    }

    override fun onStop() {
        super.onStop()
        exoPlayer.playWhenReady = false
        exoPlayer.pause()
    }

    override fun onDestroy() {
        super.onDestroy()
        exoPlayer.release()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    exoPlayer: ExoPlayer,
    godModeViewModel: GodModeViewModel,
    checkAndRequestPermissions: () -> Unit
) {
    val context = LocalContext.current
    MaterialTheme {
        var showSettings by remember { mutableStateOf(false) }
        var showGodMode by remember { mutableStateOf(false) }

        // Explicitly use Compose runtime collectAsState to avoid lifecycle-compose requiring LocalLifecycleOwner
        val godModeState by godModeViewModel.settings.collectAsState()

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(text = "LiTLaBs Player") },
                    actions = {
                        Button(onClick = { context.startActivity(Intent(context, FlutterHostActivity::class.java)) }) {
                            Text("Run Flutter")
                        }
                        IconButton(onClick = { showGodMode = true }) {
                            Icon(imageVector = Icons.Default.Tune, contentDescription = "God Mode")
                        }
                        IconButton(onClick = { showSettings = true }) {
                            Icon(imageVector = Icons.Default.Settings, contentDescription = "Settings")
                        }
                    }
                )
            }
        ) { innerPadding ->
            Box(modifier = Modifier.padding(innerPadding)) {
                MediaLibraryScreen(
                    exoPlayer = exoPlayer,
                    godModeViewModel = godModeViewModel,
                    checkAndRequestPermissions = checkAndRequestPermissions
                )

                if (showGodMode) {
                    GodModeScreen(
                        state = godModeState,
                        presets = godModeViewModel.presets,
                        onPresetSelected = { godModeViewModel.selectPreset(it) },
                        onBassBoostChanged = { godModeViewModel.setBassBoost(it) },
                        onStereoWidthChanged = { godModeViewModel.setStereoWidth(it) },
                        onVisualizerToggle = { enabled -> godModeViewModel.setVisualizer(enabled) },
                        onVisualizerTypeChanged = { godModeViewModel.setVisualizerType(it) },
                        onShuffleModeChanged = { godModeViewModel.setShuffleMode(it) },
                        onVideoBehaviorChanged = { godModeViewModel.setVideoBehavior(it) },
                        onSleepTimerChanged = { godModeViewModel.setSleepTimer(it) },
                        onSleepFadeModeChanged = { godModeViewModel.setSleepFadeMode(it) },
                        onClose = { showGodMode = false }
                    )
                }

                if (showSettings) {
                    AlertDialog(
                        onDismissRequest = { showSettings = false },
                        title = { Text("Settings") },
                        text = { Text("Settings are not yet implemented.") },
                        confirmButton = {
                            TextButton(onClick = { showSettings = false }) {
                                Text("OK")
                            }
                        }
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    LiTLabsPlayerDeluxeTheme {
        val context = LocalContext.current
        val exoPlayer = remember { ExoPlayer.Builder(context).build() }
        // Use the viewModel() composable to properly get a ViewModel instance for the preview.
        val godModeViewModel: GodModeViewModel = viewModel(
            factory = GodModeViewModelFactory(
                context.applicationContext as Application,
                loadFromDataStore = false
            )
        )
        MainScreen(exoPlayer = exoPlayer, godModeViewModel = godModeViewModel, checkAndRequestPermissions = {})
    }
}
