package com.example.litlabsplayerdeluxe.data

import android.net.Uri
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class MediaMappersTest {

    @Test
    fun `toMediaItemData maps content uri and fields`() {
        val uriString = "content://media/external/images/media/123"
        val mediaItem = MediaItem(id = 42, uriString = uriString, displayName = "MyPic.jpg", localPath = null)

        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val dto = mediaItem.toMediaItemData(context)

        assertEquals(42, dto.id)
        assertEquals("MyPic.jpg", dto.title)
        assertEquals(Uri.parse(uriString), dto.uri)
        assertFalse(dto.isVideo)
        assertNull(dto.artistOrOwner)
    }

    @Test
    fun `toMediaItemData prefers localPath when present`() {
        val tmp = File.createTempFile("test_media", ".jpg")
        tmp.deleteOnExit()

        val mediaItem = MediaItem(id = 7, uriString = "content://dummy/7", displayName = null, localPath = tmp.absolutePath)
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val dto = mediaItem.toMediaItemData(context)

        assertEquals(7, dto.id)
        assertEquals(tmp.name, dto.title)
        assertEquals(Uri.fromFile(tmp), dto.uri)
        assertFalse(dto.isVideo)
    }

    @Test
    fun `toMediaItemData detects video by extension`() {
        val uriString = "content://media/external/video/media/99.mp4"
        val mediaItem = MediaItem(id = 8, uriString = uriString, displayName = "Movie", localPath = null)

        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        val dto = mediaItem.toMediaItemData(context)
        assertTrue(dto.isVideo)
    }
}
