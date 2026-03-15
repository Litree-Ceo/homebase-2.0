package com.example.litlabsplayerdeluxe

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "litlabs_prefs")

object DataStoreHelper {
    private val KEY_ACTIVE_PRESET = stringPreferencesKey("godmode_active_preset_name")

    fun getActivePresetNameFlow(context: Context): Flow<String?> =
        context.dataStore.data.map { prefs ->
            prefs[KEY_ACTIVE_PRESET]
        }

    suspend fun setActivePresetName(context: Context, name: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ACTIVE_PRESET] = name
        }
    }
}

