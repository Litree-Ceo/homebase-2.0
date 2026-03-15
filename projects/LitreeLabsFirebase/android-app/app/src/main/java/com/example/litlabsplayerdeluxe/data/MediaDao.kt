package com.example.litlabsplayerdeluxe.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface MediaDao {
    @Query("SELECT * FROM media_items ORDER BY id DESC")
    fun getAll(): List<MediaItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    fun insert(item: MediaItem): Long

    @Query("DELETE FROM media_items")
    fun clear(): Int
}
