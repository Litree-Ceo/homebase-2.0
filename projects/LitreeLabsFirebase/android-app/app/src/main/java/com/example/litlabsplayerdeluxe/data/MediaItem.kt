package com.example.litlabsplayerdeluxe.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "media_items")
data class MediaItem(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val uriString: String,
    val displayName: String? = null,
    val localPath: String? = null,
    val title: String? = null,
    val artist: String? = null,
    val isVideo: Boolean = false
)
