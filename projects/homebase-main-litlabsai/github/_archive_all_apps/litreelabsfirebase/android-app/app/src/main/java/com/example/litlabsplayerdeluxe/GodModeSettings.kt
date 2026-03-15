package com.example.litlabsplayerdeluxe

/**
 * Simple settings holder used by GodModeViewModel.
 * Keep defaults conservative so creating a settings instance is easy.
 */

data class GodModeSettings(
    val activePreset: GodModePreset,
    val bassBoostLevel: Int = 0,           // 0..100
    val stereoWidth: Float = 1.0f,         // 0f..1.5f
    val visualizerEnabled: Boolean = false,
    val visualizerType: VisualizerType = VisualizerType.Off,
    val shuffleMode: SmartShuffleMode = SmartShuffleMode.Off,
    val videoBehavior: VideoBehavior = VideoBehavior.PauseOnBackground,
    val sleepTimerMinutes: Int? = null,
    val sleepFadeMode: SleepFadeMode = SleepFadeMode.Off
)

// Lightweight enums used by the ViewModel and UI. Expand later as needed.
enum class VisualizerType {
    Off,
    Bars,
    Waveform,
    Circle
}

enum class SmartShuffleMode {
    Off,
    Standard,
    Smart
}

enum class VideoBehavior {
    PauseOnBackground,   // stop/resume playback when app backgrounded
    ContinueAudioOnly,   // keep audio playing, hide video surface
    Stop                 // stop playback when backgrounded
}

enum class SleepFadeMode {
    Off,
    Linear,
    Exponential
}

