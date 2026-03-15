package com.example.litlabsplayerdeluxe.data

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class MediaDaoTest {
    private lateinit var db: AppDatabase
    private lateinit var dao: MediaDao

    @Before
    fun setup() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java).allowMainThreadQueries().build()
        dao = db.mediaDao()
    }

    @After
    fun tearDown() {
        db.close()
    }

    @Test
    fun insertAndRead() {
        val uri = "content://test/media/1"
        val id = dao.insert(MediaItem(uriString = uri))
        val all = dao.getAll()
        assertTrue(all.isNotEmpty())
        assertEquals(uri, all[0].uriString)
    }

    @Test
    fun clearWorks() {
        dao.insert(MediaItem(uriString = "content://test/media/2"))
        dao.clear()
        val all = dao.getAll()
        assertTrue(all.isEmpty())
    }
}
