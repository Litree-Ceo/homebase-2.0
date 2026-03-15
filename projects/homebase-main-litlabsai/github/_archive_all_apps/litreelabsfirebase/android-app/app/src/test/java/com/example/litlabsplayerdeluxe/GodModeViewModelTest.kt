package com.example.litlabsplayerdeluxe

import android.app.Application
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.litlabsplayerdeluxe.GodModeViewModel
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class GodModeViewModelTest {

    @get:Rule
    val rule = InstantTaskExecutorRule()

    @Test
    fun selectPreset_updatesState() = runBlocking {
        val dispatcher = UnconfinedTestDispatcher()
        kotlinx.coroutines.Dispatchers.setMain(dispatcher)
        // Use a plain Application instance for JVM unit tests (no instrumentation required)
        val app = Application()
        val vm = GodModeViewModel(app, loadFromDataStore = false)

        val preset = vm.presets.find { it.name == "Club Night" }!!
        vm.selectPreset(preset)

        val current = vm.settings.value
        assertEquals(preset.name, current.activePreset.name)
        kotlinx.coroutines.Dispatchers.resetMain()
    }
}
