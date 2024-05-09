package com.awesomeproject

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.content.ComponentName
import android.content.SharedPreferences


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
}
