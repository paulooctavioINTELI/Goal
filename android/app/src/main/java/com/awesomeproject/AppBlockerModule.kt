package com.awesomeproject

import android.app.usage.UsageStatsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod


class AppBlockerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val sharedPreferences: SharedPreferences = reactContext.getSharedPreferences("AppSettings", Context.MODE_PRIVATE)

    override fun getName(): String = "AppBlockerModule"

    @ReactMethod
    fun toggleMonitoring(promise: Promise) {
        val currentStatus = sharedPreferences.getBoolean("IsMonitoringEnabled", false)
        sharedPreferences.edit().putBoolean("IsMonitoringEnabled", !currentStatus).apply()
        promise.resolve(!currentStatus)
    }

    @ReactMethod
    fun isMonitoringEnabled(promise: Promise) {
        val isMonitoringEnabled = sharedPreferences.getBoolean("IsMonitoringEnabled", false)
        promise.resolve(isMonitoringEnabled)
    }

    @ReactMethod
    fun updateSchedule(jsonSchedule: String, promise: Promise) {
        try {
            // Salva o JSON de horários no SharedPreferences
            sharedPreferences.edit().putString("jsonSchedule", jsonSchedule).apply()
            promise.resolve("Schedule updated successfully")
        } catch (e: Exception) {
            promise.reject("Failed to update schedule", e)
        }
    }

    @ReactMethod
    fun getSchedule(promise: Promise) {
        try {
            // Recupera o JSON de horários do SharedPreferences
            val jsonSchedule = sharedPreferences.getString("jsonSchedule", "[]")
            promise.resolve(jsonSchedule)
        } catch (e: Exception) {
            promise.reject("Failed to retrieve schedule", e)
        }
    }
}
