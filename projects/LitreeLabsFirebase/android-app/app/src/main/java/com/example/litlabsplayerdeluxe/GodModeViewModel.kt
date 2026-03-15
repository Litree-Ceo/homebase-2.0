package com.example.litlabsplayerdeluxe

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.PlaybackParameters
import androidx.media3.exoplayer.ExoPlayer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class GodModeViewModel(
    application: Application,
    private val loadFromDataStore: Boolean = true
) : AndroidViewModel(application) {

    // Base presets you can show as chips
    val presets: List<GodModePreset> = listOf(
        GodModePreset(
            name = "Off",
            description = "Flat playback, no boost",
            playbackSpeed = 1.0f,
            volume = 1.0f
        ),
        GodModePreset(
            name = "Trunk 808",
            description = "Slight slow + heavy feel (ideal for 808 cruising)",
            playbackSpeed = 0.95f,
            volume = 1.0f
        ),
        GodModePreset(
            name = "Club Night",
            description = "Slightly faster, hype vibe",
            playbackSpeed = 1.05f,
            volume = 1.0f
        ),
        GodModePreset(
            name = "Chill Couch",
            description = "Slowed, relaxed, storytelling",
            playbackSpeed = 0.9f,
            volume = 0.9f
        )
    )

    private val _settings = MutableStateFlow(
        GodModeSettings(
            activePreset = presets.first()
        )
    )
    val settings: StateFlow<GodModeSettings> = _settings.asStateFlow()

    init {
        if (loadFromDataStore) {
            // Load saved preset name from DataStore and apply if found
            viewModelScope.launch {
                val context = getApplication<Application>().applicationContext
                DataStoreHelper.getActivePresetNameFlow(context).collect { name ->
                    name?.let {
                        presets.find { p -> p.name == it }?.let { preset ->
                            _settings.update { s -> s.copy(activePreset = preset) }
                        }
                    }
                }
            }
        }
    }

    // ---- Update functions ----

    fun selectPreset(preset: GodModePreset) {
        _settings.update { it.copy(activePreset = preset) }
        // persist
        viewModelScope.launch {
            DataStoreHelper.setActivePresetName(getApplication(), preset.name)
        }
    }

    fun setBassBoost(level: Int) {
        val clamped = level.coerceIn(0, 100)
        _settings.update { it.copy(bassBoostLevel = clamped) }
    }

    fun setStereoWidth(width: Float) {
        val clamped = width.coerceIn(0f, 1.5f)
        _settings.update { it.copy(stereoWidth = clamped) }
    }

    fun setVisualizer(enabled: Boolean, type: VisualizerType? = null) {
        _settings.update {
            it.copy(
                visualizerEnabled = enabled,
                visualizerType = type ?: it.visualizerType
            )
        }
    }

    fun setVisualizerType(type: VisualizerType) {
        _settings.update {
            it.copy(
                visualizerType = type,
                visualizerEnabled = type != VisualizerType.Off
            )
        }
    }

    fun setShuffleMode(mode: SmartShuffleMode) {
        _settings.update { it.copy(shuffleMode = mode) }
    }

    fun setVideoBehavior(behavior: VideoBehavior) {
        _settings.update { it.copy(videoBehavior = behavior) }
    }

    fun setSleepTimer(minutes: Int?) {
        _settings.update { it.copy(sleepTimerMinutes = minutes) }
    }

    fun setSleepFadeMode(mode: SleepFadeMode) {
        _settings.update { it.copy(sleepFadeMode = mode) }
    }

    /**
     * Apply whatever parts of God Mode we actually support *right now*
     * directly to the ExoPlayer.
     */
    fun applyToPlayer(exoPlayer: ExoPlayer) {
        val preset = _settings.value.activePreset
        exoPlayer.playbackParameters = PlaybackParameters(preset.playbackSpeed)
        exoPlayer.volume = preset.volume
    }
}

class GodModeViewModelFactory(
    private val application: Application,
    private val loadFromDataStore: Boolean = true
) : androidx.lifecycle.ViewModelProvider.Factory {
    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return if (modelClass.isAssignableFrom(GodModeViewModel::class.java)) {
            GodModeViewModel(application, loadFromDataStore) as T
        } else {
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}

