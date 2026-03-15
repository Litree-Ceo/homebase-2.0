package com.litlabs.player.disabled

@Deprecated("Disabled historic copy")
data class GodModeSettings_Disabled(
    val activePresetName: String,
    val bassBoostLevel: Int = 0,
    val stereoWidth: Float = 1.0f,
    val visualizerEnabled: Boolean = false
)

@Deprecated("Disabled historic copy")
enum class VisualizerType_Disabled { Off, Bars, Waveform, Circle }

@Deprecated("Disabled historic copy")
enum class SmartShuffleMode_Disabled { Off, Standard, Smart }

@Deprecated("Disabled historic copy")
enum class VideoBehavior_Disabled { PauseOnBackground, ContinueAudioOnly, Stop }

@Deprecated("Disabled historic copy")
enum class SleepFadeMode_Disabled { Off, Linear, Exponential }
