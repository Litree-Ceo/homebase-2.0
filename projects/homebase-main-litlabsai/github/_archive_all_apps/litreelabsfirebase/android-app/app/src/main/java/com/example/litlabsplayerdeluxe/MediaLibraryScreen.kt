package com.example.litlabsplayerdeluxe

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.provider.MediaStore
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.compose.ui.viewinterop.AndroidView
import android.content.ContentUris
import android.content.Context as AContext
import com.example.litlabsplayerdeluxe.data.MediaItemData
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.rememberModalBottomSheetState
import kotlinx.coroutines.launch
import androidx.compose.ui.tooling.preview.Preview
import android.net.Uri
import com.example.litlabsplayerdeluxe.ui.theme.LiTLabsPlayerDeluxeTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MediaLibraryScreen(
    exoPlayer: ExoPlayer,
    godModeViewModel: GodModeViewModel,
    checkAndRequestPermissions: () -> Unit
) {
    val context = LocalContext.current

    // Collect God Mode settings StateFlow into Compose State safely (don't read .value directly)
    val gmSettings by godModeViewModel.settings.collectAsState()
    val gmPresets = godModeViewModel.presets

    var showGodMode by remember { mutableStateOf(false) }

    var hasPermission by remember { mutableStateOf(false) }
    var mediaItems by remember { mutableStateOf<List<MediaItemData>>(emptyList()) }
    var currentItem by remember { mutableStateOf<MediaItemData?>(null) }
    var isPlaying by remember { mutableStateOf(false) }

    // Apply GodMode whenever settings change
    LaunchedEffect(gmSettings) {
        try { godModeViewModel.applyToPlayer(exoPlayer) } catch (_: Exception) { }
    }

    // Helper to play an item by index
    fun playIndex(idx: Int) {
        if (idx < 0 || idx >= mediaItems.size) return
        val item = mediaItems[idx]
        currentItem = item
        isPlaying = true
        exoPlayer.setMediaItem(MediaItem.fromUri(item.uri))
        exoPlayer.prepare()
        exoPlayer.play()
        godModeViewModel.applyToPlayer(exoPlayer)
    }

    fun playPrevious() {
        val cur = currentItem ?: return
        val idx = mediaItems.indexOfFirst { it.id == cur.id }
        if (idx > 0) playIndex(idx - 1)
    }

    fun playNext() {
        val cur = currentItem ?: return
        val idx = mediaItems.indexOfFirst { it.id == cur.id }
        if (idx >= 0 && idx < mediaItems.size - 1) playIndex(idx + 1)
    }

    // Initial permission check + request (delegated to Activity via callback)
    LaunchedEffect(Unit) {
        val perms = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            listOf(
                Manifest.permission.READ_MEDIA_AUDIO,
                Manifest.permission.READ_MEDIA_VIDEO
            )
        } else {
            listOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        val allGranted = perms.all { perm ->
            ContextCompat.checkSelfPermission(context, perm) ==
                    PackageManager.PERMISSION_GRANTED
        }

        if (!allGranted) {
            // Delegate permission request to the Activity/host via the callback
            checkAndRequestPermissions()
        } else {
            hasPermission = true
        }
    }

    LaunchedEffect(hasPermission) {
        if (hasPermission) {
            mediaItems = queryDeviceMedia(context)
        }
    }

    val sheetState = rememberModalBottomSheetState()
    val coroutineScope = rememberCoroutineScope()

    Box(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.fillMaxSize()) {
            NowPlayingBar(
                currentItem = currentItem,
                isPlaying = isPlaying,
                onPlayPause = {
                    if (currentItem == null) return@NowPlayingBar
                    if (isPlaying) {
                        exoPlayer.pause(); isPlaying = false
                    } else {
                        exoPlayer.play(); isPlaying = true
                    }
                },
                onPrevious = { playPrevious() },
                onNext = { playNext() },
                onGodModeClick = {
                    showGodMode = true
                    coroutineScope.launch { sheetState.show() }
                }
            )

            if (currentItem?.isVideo == true) {
                VideoPlayer(exoPlayer = exoPlayer)
            }

            if (!hasPermission) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Grant storage/media permission to load your songs & videos.")
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = { checkAndRequestPermissions() }) {
                            Text("Request permission")
                        }
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                ) {
                    items(mediaItems) { item ->
                        MediaRow(
                            item = item,
                            onClick = {
                                currentItem = item
                                isPlaying = true
                                exoPlayer.setMediaItem(MediaItem.fromUri(item.uri))
                                exoPlayer.prepare()
                                exoPlayer.play()
                                // apply GodMode settings when a new item starts
                                godModeViewModel.applyToPlayer(exoPlayer)
                            }
                        )
                        HorizontalDivider()
                    }
                }
            }
        }

        // Modal bottom sheet for God Mode
        if (showGodMode) {
            ModalBottomSheet(
                onDismissRequest = {
                    coroutineScope.launch {
                        sheetState.hide()
                        showGodMode = false
                    }
                },
                sheetState = sheetState
            ) {
                GodModeScreen(
                    state = gmSettings,
                    presets = gmPresets,
                    onPresetSelected = { godModeViewModel.selectPreset(it) },
                    onBassBoostChanged = { godModeViewModel.setBassBoost(it) },
                    onStereoWidthChanged = { godModeViewModel.setStereoWidth(it) },
                    onVisualizerToggle = { enabled -> godModeViewModel.setVisualizer(enabled) },
                    onVisualizerTypeChanged = { godModeViewModel.setVisualizerType(it) },
                    onShuffleModeChanged = { godModeViewModel.setShuffleMode(it) },
                    onVideoBehaviorChanged = { godModeViewModel.setVideoBehavior(it) },
                    onSleepTimerChanged = { godModeViewModel.setSleepTimer(it) },
                    onSleepFadeModeChanged = { godModeViewModel.setSleepFadeMode(it) },
                    onClose = {
                        coroutineScope.launch {
                            sheetState.hide()
                            showGodMode = false
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun MediaRow(
    item: MediaItemData,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = item.artistOrOwner ?: if (item.isVideo) "Video" else "Unknown",
                style = MaterialTheme.typography.bodySmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = if (item.isVideo) "🎬 ${item.title}" else item.title,
                style = MaterialTheme.typography.bodyLarge,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun VideoPlayer(exoPlayer: ExoPlayer) {
    AndroidView(
        factory = { ctx ->
            PlayerView(ctx).apply {
                player = exoPlayer
                useController = true
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16 / 9f)
            .padding(8.dp)
    )
}

// Reuse the MediaStore query from earlier
fun queryDeviceMedia(context: AContext): List<MediaItemData> {
    val result = mutableListOf<MediaItemData>()
    val resolver = context.contentResolver

    // Audio (music)
    val audioUri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
    val audioProjection = arrayOf(
        MediaStore.Audio.Media._ID,
        MediaStore.Audio.Media.TITLE,
        MediaStore.Audio.Media.ARTIST
    )
    resolver.query(
        audioUri,
        audioProjection,
        "${MediaStore.Audio.Media.IS_MUSIC} != 0",
        null,
        "${MediaStore.Audio.Media.TITLE} ASC"
    )?.use { cursor ->
        val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
        val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
        val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)

        while (cursor.moveToNext()) {
            val id = cursor.getLong(idCol)
            val title = cursor.getString(titleCol) ?: "Unknown"
            val artist = cursor.getString(artistCol)
            val contentUri = ContentUris.withAppendedId(audioUri, id)

            result.add(
                MediaItemData(
                    id = id,
                    uri = contentUri,
                    title = title,
                    artistOrOwner = artist,
                    isVideo = false
                )
            )
        }
    }

    // Video
    val videoUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI
    val videoProjection = arrayOf(
        MediaStore.Video.Media._ID,
        MediaStore.Video.Media.TITLE,
        MediaStore.Video.Media.ARTIST
    )
    resolver.query(
        videoUri,
        videoProjection,
        null,
        null,
        "${MediaStore.Video.Media.DATE_ADDED} DESC"
    )?.use { cursor ->
        val idCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID)
        val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.TITLE)
        val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.ARTIST)

        while (cursor.moveToNext()) {
            val id = cursor.getLong(idCol)
            val title = cursor.getString(titleCol) ?: "Video"
            val artist = cursor.getString(artistCol)
            val contentUri = ContentUris.withAppendedId(videoUri, id)

            result.add(
                MediaItemData(
                    id = id,
                    uri = contentUri,
                    title = title,
                    artistOrOwner = artist,
                    isVideo = true
                )
            )
        }
    }

    return result
}

@Preview(showBackground = true)
@Composable
fun MediaRowPreview() {
    LiTLabsPlayerDeluxeTheme {
        MediaRow(
            item = MediaItemData(
                id = 1L,
                uri = Uri.EMPTY,
                title = "An Awesome Song Title That Is Quite Long To See How It Ellipses",
                artistOrOwner = "A Very Talented Artist",
                isVideo = false
            ),
            onClick = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun MediaRowVideoPreview() {
    LiTLabsPlayerDeluxeTheme {
        MediaRow(
            item = MediaItemData(
                id = 2L,
                uri = Uri.EMPTY,
                title = "My Vacation Video",
                artistOrOwner = "Me",
                isVideo = true
            ),
            onClick = {}
        )
    }
}
