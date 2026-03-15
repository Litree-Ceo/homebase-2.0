package com.example.litlabsplayerdeluxe.data

import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import org.junit.Test
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class MediaMappersUnitTest {

    @Test
    fun `mapper uses displayName when title is null and sets isVideo false for non-video`() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val item = MediaItem(
            id = 1L,
            uriString = "file:///storage/emulated/0/Music/song.mp3",
            displayName = "My Song",
            localPath = null,
            title = null,
            artist = null,
            isVideo = false
        )

        try {
            val dto = item.toMediaItemData(context)

            assertEquals(1L, dto.id)
            assertEquals(Uri.parse(item.uriString), dto.uri)
            assertEquals("My Song", dto.title)
            assertNull(dto.artistOrOwner)
            assertFalse(dto.isVideo)
        } catch (e: Exception) {
            e.printStackTrace()
            throw e
        }
    }
}
