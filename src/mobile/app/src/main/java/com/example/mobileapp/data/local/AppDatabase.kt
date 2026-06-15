package com.example.mobileapp.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        SensorMeasurementEntity::class,
        AverageMeasurementEntity::class,
        AlertEntity::class,
        AccelBurstEntity::class,
        EcgBurstEntity::class
    ],
    version = 3
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun healthDao(): HealthDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "health_monitor_database"
                )
                    // Am adaugat tabela accel_bursts (version 1 -> 2) si ecg_bursts
                    // (version 2 -> 3). Fara o migrare scrisa manual, Room recreeaza baza
                    // la upgrade (sterge datele de test). Acceptabil pentru dezvoltare;
                    // pentru productie scrii un Migration.
                    .fallbackToDestructiveMigration()
                    .build()

                INSTANCE = instance
                instance
            }
        }
    }
}