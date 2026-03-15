package com.example.litlabsplayerdeluxe

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.litlabsplayerdeluxe.ui.theme.LiTLabsPlayerDeluxeTheme

// Correctly define a list of presets for the preview.
private val previewPresets = listOf(
    GodModePreset("Default", "The standard, unmodified experience."),
    GodModePreset("Club Boost", "Emphasizes bass and stereo width for a party feel.", playbackSpeed = 1.05f),
    GodModePreset("Acoustic", "Focuses on vocal clarity and natural sound.", playbackSpeed = 0.98f),
    GodModePreset("Spoken Word", "Optimized for podcasts and audiobooks.", volume = 1.1f)
)

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun GodModeScreen(
    state: GodModeSettings,
    presets: List<GodModePreset>,
    onPresetSelected: (GodModePreset) -> Unit,
    onBassBoostChanged: (Int) -> Unit,
    onStereoWidthChanged: (Float) -> Unit,
    onVisualizerToggle: (Boolean) -> Unit,
    onVisualizerTypeChanged: (VisualizerType) -> Unit,
    onShuffleModeChanged: (SmartShuffleMode) -> Unit,
    onVideoBehaviorChanged: (VideoBehavior) -> Unit,
    onSleepTimerChanged: (Int?) -> Unit,
    onSleepFadeModeChanged: (SleepFadeMode) -> Unit,
    onClose: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("God Mode") },
                actions = {
                    TextButton(onClick = onClose) {
                        Text("Close")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // ---- Presets ----
            Text(
                text = "Presets",
                style = MaterialTheme.typography.titleMedium
            )
            FlowRowWithChips(
                items = presets,
                isSelected = { it.name == state.activePreset.name },
                label = { it.name },
                onClick = onPresetSelected
            )
            Text(
                text = state.activePreset.description,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            HorizontalDivider()

            // ---- 808 / Bass section ----
            Text("808 / Bass", style = MaterialTheme.typography.titleMedium)
            Text("Bass Boost: ${state.bassBoostLevel}")
            Slider(
                value = state.bassBoostLevel.toFloat(),
                onValueChange = { onBassBoostChanged(it.toInt()) },
                valueRange = 0f..100f
            )

            Text("Stereo Width")
            Slider(
                value = state.stereoWidth,
                onValueChange = { onStereoWidthChanged(it) },
                valueRange = 0f..1.5f
            )

            HorizontalDivider()

            // ---- Visuals ----
            Text("Visuals", style = MaterialTheme.typography.titleMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Visualizer")
                Switch(
                    checked = state.visualizerEnabled,
                    onCheckedChange = { onVisualizerToggle(it) }
                )
            }
            FlowRowWithChips(
                items = VisualizerType.entries.toList(),
                isSelected = { it == state.visualizerType },
                label = { it.name },
                onClick = { onVisualizerTypeChanged(it) }
            )

            HorizontalDivider()

            // ---- Library Brain ----
            Text("Library Brain", style = MaterialTheme.typography.titleMedium)
            Text("Shuffle Mode")
            FlowRowWithChips(
                items = SmartShuffleMode.entries.toList(),
                isSelected = { it == state.shuffleMode },
                label = { it.name },
                onClick = { onShuffleModeChanged(it) } // Fixed typo here
            )

            HorizontalDivider()

            // ---- Video ----
            Text("Video Behavior", style = MaterialTheme.typography.titleMedium)
            FlowRowWithChips(
                items = VideoBehavior.entries.toList(),
                isSelected = { it == state.videoBehavior },
                label = { it.name },
                onClick = { onVideoBehaviorChanged(it) }
            )

            HorizontalDivider()

            // ---- Automation ----
            Text("Automation", style = MaterialTheme.typography.titleMedium)
            Text("Sleep timer (minutes)")
            FlowRowWithChips(
                items = listOf(null, 15, 30, 60),
                isSelected = { it == state.sleepTimerMinutes },
                label = { if (it == null) "Off" else "${it}m" },
                onClick = { onSleepTimerChanged(it) }
            )

            Text("Sleep fade")
            FlowRowWithChips(
                items = SleepFadeMode.entries.toList(),
                isSelected = { it == state.sleepFadeMode },
                label = { it.name },
                onClick = { onSleepFadeModeChanged(it) }
            )

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun <T> FlowRowWithChips(
    items: List<T>,
    isSelected: (T) -> Boolean,
    label: (T) -> String,
    onClick: (T) -> Unit
) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items.forEach { item ->
            FilterChip(
                selected = isSelected(item),
                onClick = { onClick(item) },
                label = {
                    Text(
                        text = label(item),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GodModeScreenPreview() {
    LiTLabsPlayerDeluxeTheme {
        GodModeScreen(
            state = GodModeSettings(activePreset = previewPresets.first()),
            presets = previewPresets,
            onPresetSelected = {},
            onBassBoostChanged = {},
            onStereoWidthChanged = {},
            onVisualizerToggle = {},
            onVisualizerTypeChanged = {},
            onShuffleModeChanged = {},
            onVideoBehaviorChanged = {},
            onSleepTimerChanged = {},
            onSleepFadeModeChanged = {},
            onClose = {}
        )
    }
}
