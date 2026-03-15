package com.example.litlabsplayerdeluxe.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(entities = [MediaItem::class], version = 3, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun mediaDao(): MediaDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Add the new column localPath (nullable)
                database.execSQL("ALTER TABLE media_items ADD COLUMN localPath TEXT")
            }
        }

        private val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("ALTER TABLE media_items ADD COLUMN title TEXT")
                database.execSQL("ALTER TABLE media_items ADD COLUMN artist TEXT")
                // SQLite does not have boolean type; use INTEGER with default 0
                database.execSQL("ALTER TABLE media_items ADD COLUMN isVideo INTEGER NOT NULL DEFAULT 0")

                // Populate title from displayName for legacy rows when available so UI shows a sensible name
                database.execSQL("UPDATE media_items SET title = displayName WHERE title IS NULL AND displayName IS NOT NULL")
            }
        }

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "litlabs_database"
                ).addMigrations(MIGRATION_1_2, MIGRATION_2_3).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
