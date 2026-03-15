package com.litlabs.player.disabled

// Disabled historic copy - moved package to avoid duplicate symbols. See com.example.litlabsplayerdeluxe.GodModePreset
// Simple settings container for an advanced "God Mode" playback preset.
// Kept lightweight for now; we'll expand with EQ/bass/etc. when needed.
@Deprecated("Disabled historic copy")
data class GodModePreset_Disabled(
    val name: String,
    val description: String,
    val playbackSpeed: Float = 1.0f,
    val volume: Float = 1.0f
)
