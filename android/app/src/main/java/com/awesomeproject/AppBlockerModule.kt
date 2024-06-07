package com.goal

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
import android.net.Uri


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

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (!Settings.canDrawOverlays(reactContext)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                )
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.reject("Failed to request overlay permission", e)
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            val componentName = ComponentName(reactContext, AppMonitorService::class.java)
            intent.putExtra("extra_fragment_arg_key", componentName.flattenToString())
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("Failed to request accessibility permission", e)
        }
    }
}
