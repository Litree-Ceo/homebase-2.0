package com.example.litlabsplayerdeluxe

// Simple settings container for an advanced "God Mode" playback preset.
// Kept lightweight for now; we'll expand with EQ/bass/etc. when needed.
data class GodModePreset(
    val name: String,
    val description: String,
    val playbackSpeed: Float = 1.0f,
    val volume: Float = 1.0f
    // Later: add eqBands, bassBoostLevel, stereoWidth, etc.
)

