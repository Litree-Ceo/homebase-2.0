LiTLabs Player Deluxe - Local build & notes

Quick build

1. Ensure you have JDK 17 installed and available in PATH.
2. From the project root run:

```powershell
.\gradlew.bat clean assembleDebug --no-daemon --stacktrace --info
```

What I changed

- Centralized dependencies into `gradle/libs.versions.toml` and used catalog aliases in `app/build.gradle.kts`.
- Replaced deprecated kotlinOptions.jvmTarget with the Kotlin JVM toolchain (jvmToolchain(17)).
- Added Android 13+ media permissions in `app/src/main/AndroidManifest.xml` and a runtime permission/picker scaffold in `MainActivity.kt`.
- Tidied the version catalog to use consistent camelCase aliases (composeUi, composeUiToolingPreview, composeMaterial3, materialIconsExtended, media3Exoplayer, navigationCompose, etc.).

Permission and Photo Picker notes

- Android 13+ requires granular media permissions (READ_MEDIA_AUDIO / READ_MEDIA_VIDEO). For older devices (<= API 32) READ_EXTERNAL_STORAGE is used.
- For Android 13+ the app uses `ActivityResultContracts.PickMultipleVisualMedia()` as a photo picker. For older devices the app falls back to `OpenMultipleDocuments()`.
- If your app needs broad, persistent access to many photos/videos (Android 14+), read Android's "Selected Photos Access" guidance — use the Photo Picker UX instead of broad storage permissions where appropriate.

If something fails to build

- Run the gradle command above and inspect `build.log` for errors.
- If you run into unresolved `libs.*` accessors in Gradle Kotlin DSL, run `./gradlew --refresh-dependencies` and restart the IDE to regenerate accessors.

## Version catalog aliases (selected)

The project uses a version catalog (`gradle/libs.versions.toml`) with these alias -> coordinate mappings used by the app:

- `composeBom` -> androidx.compose:compose-bom:${'$'}{composeBom}
- `composeUi` -> androidx.compose.ui:ui
- `composeUiToolingPreview` -> androidx.compose.ui:ui-tooling-preview
- `composeUiTooling` -> androidx.compose.ui:ui-tooling
- `composeMaterial3` -> androidx.compose.material3:material3
- `materialIconsExtended` -> androidx.compose.material:material-icons-extended
- `activityCompose` -> androidx.activity:activity-compose:1.12.0
- `coreKtx` -> androidx.core:core-ktx:1.17.0
- `lifecycleRuntimeKtx` -> androidx.lifecycle:lifecycle-runtime-ktx:2.10.0
- `lifecycleViewModelCompose` -> androidx.lifecycle:lifecycle-viewmodel-compose:2.10.0
- `media3Exoplayer` -> androidx.media3:media3-exoplayer:1.8.0
- `media3Ui` -> androidx.media3:media3-ui:1.8.0
- `media3Session` -> androidx.media3:media3-session:1.8.0
- `navigationCompose` -> androidx.navigation:navigation-compose:2.9.6
- `coilCompose` -> io.coil-kt:coil-compose:2.4.0

If you add/remove aliases, Gradle Kotlin DSL generates `libs` accessors; if you see unresolved `libs.*` in the build script, run:

```powershell
.\gradlew.bat --refresh-dependencies
# restart IDE after the above command so the Kotlin DSL accessors are regenerated
```

## Coil usage

We use Coil Compose (`coil-compose`) for thumbnail previews in the photo picker UI. Coil handles loading URIs and caching automatically.

Contact

Reply here and I can further refine the catalog, add thumbnails for the picker, or implement persistable URI permissions.
