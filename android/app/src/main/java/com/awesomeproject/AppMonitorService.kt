// AppMonitorService.kt
package com.awesomeproject

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import android.provider.Settings
import android.content.SharedPreferences
import android.content.Context


class AppMonitorService : AccessibilityService() {
    private lateinit var sharedPreferences: SharedPreferences

    override fun onServiceConnected() {
        super.onServiceConnected()
        sharedPreferences = getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            if (sharedPreferences.getBoolean("IsMonitoringEnabled", false)) {
                event.packageName?.let { packageName ->
                    if (packageName.toString().contains("com.instagram.android")) {
                        if (Settings.canDrawOverlays(this)) {
                            val intent = Intent(this, OverlayActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                            startActivity(intent)
                        }
                    }
                }
            }
        }
    }

    override fun onInterrupt() {
    }
}
