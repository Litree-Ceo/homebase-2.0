package com.example.litlabsplayerdeluxe.data

import android.content.Context
import android.net.Uri
import java.io.File
import android.webkit.MimeTypeMap
import com.example.litlabsplayerdeluxe.data.MediaItemData

// ...existing code...

fun MediaItem.toMediaItemData(context: Context): MediaItemData {
    try {
        // Defensive null handling for fields that should be non-null in runtime but may be null in tests
        val localPathSafe: String = this.localPath ?: ""
        val uriStringSafe: String = this.uriString ?: ""

        // Determine resolved Uri: prefer a local file path if present, otherwise parse the stored uriString
        val resolvedUri: Uri = try {
            if (localPathSafe.isNotBlank()) {
                Uri.fromFile(File(localPathSafe))
            } else {
                try {
                    Uri.parse(uriStringSafe)
                } catch (ex: Throwable) {
                    Uri.EMPTY
                }
            }
        } catch (e: Throwable) {
            // If anything goes wrong, fall back to an empty Uri to avoid throwing in UI code
            Uri.EMPTY
        }

        // Determine MIME type via ContentResolver if possible, otherwise via extension
        var mime: String? = null
        try {
            val scheme = resolvedUri.scheme
            if (scheme == "content") {
                // Access contentResolver defensively because unit tests may pass a Mockito mock Context
                val cr = kotlin.runCatching { context.contentResolver }.getOrNull()
                if (cr != null) {
                    mime = cr.getType(resolvedUri)
                } else {
                    // fallback to extension-based detection below
                }
            } else if (scheme == "file") {
                val ext = MimeTypeMap.getFileExtensionFromUrl(resolvedUri.toString())
                if (!ext.isNullOrBlank()) {
                    mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.lowercase())
                }
            } else {
                val ext = MimeTypeMap.getFileExtensionFromUrl(uriStringSafe)
                if (!ext.isNullOrBlank()) {
                    mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.lowercase())
                }
            }
        } catch (_: Exception) {
            mime = null
        }

        val derivedIsVideo = mime?.startsWith("video/") == true || run {
            val lower = uriStringSafe.lowercase()
            listOf(".mp4", ".mkv", ".mov", ".webm", ".3gp").any { lower.endsWith(it) }
        }

        val finalIsVideo = this.isVideo || derivedIsVideo
        val finalTitle = this.title ?: this.displayName ?: File(resolvedUri.path ?: "").name.ifBlank { "Unknown" }
        val finalArtist = this.artist

        return MediaItemData(
            id = this.id,
            uri = resolvedUri,
            title = finalTitle,
            artistOrOwner = finalArtist,
            isVideo = finalIsVideo
        )
    } catch (e: Throwable) {
        e.printStackTrace()
        throw e
    }
}

// ...existing code...
