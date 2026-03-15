package com.example.litlabsplayerdeluxe

import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.litlabsplayerdeluxe.data.MediaItemData

@Composable
fun NowPlayingBar(
    currentItem: MediaItemData?,
    isPlaying: Boolean,
    onPlayPause: () -> Unit,
    onPrevious: () -> Unit,
    onNext: () -> Unit,
    onGodModeClick: () -> Unit
) {
    Surface(
        tonalElevation = 4.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = currentItem?.title ?: "Nothing playing",
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (currentItem != null) {
                    Text(
                        text = if (currentItem.isVideo) "Video" else (currentItem.artistOrOwner ?: ""),
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                IconButton(onClick = onGodModeClick) {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = "God Mode"
                    )
                }

                IconButton(onClick = onPrevious, enabled = currentItem != null) {
                    Icon(imageVector = Icons.Filled.SkipPrevious, contentDescription = "Previous")
                }

                IconButton(onClick = onPlayPause, enabled = currentItem != null) {
                    Icon(
                        imageVector = if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                        contentDescription = if (isPlaying) "Pause" else "Play"
                    )
                }

                IconButton(onClick = onNext, enabled = currentItem != null) {
                    Icon(imageVector = Icons.Filled.SkipNext, contentDescription = "Next")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun NowPlayingBarPreview() {
    val sample = MediaItemData(
        id = 1L,
        uri = Uri.parse("content://media/external/audio/media/1"),
        title = "Preview Song",
        artistOrOwner = "Artist",
        isVideo = false
    )
    NowPlayingBar(
        currentItem = sample,
        isPlaying = false,
        onPlayPause = {},
        onPrevious = {},
        onNext = {},
        onGodModeClick = {}
    )
}

