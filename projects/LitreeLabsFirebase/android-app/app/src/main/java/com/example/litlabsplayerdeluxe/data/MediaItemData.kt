package com.example.litlabsplayerdeluxe.data

import android.net.Uri

data class MediaItemData(
    val id: Long,
    val uri: Uri,
    val title: String,
    val artistOrOwner: String?,
    val isVideo: Boolean
)

