package com.goal

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.util.Log
import android.provider.Settings
import android.content.SharedPreferences
import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import android.os.Handler

class AppMonitorService : AccessibilityService() {
    private lateinit var sharedPreferences: SharedPreferences
    private val handler = Handler()
    private val blockedPackages = setOf(
        "com.google.android.youtube",
        "com.instagram.android",
        "com.zhiliaoapp.musically",
        "com.netflix.mediaclient",
        "com.amazon.avod.thirdpartyclient",
        "com.disney.disneyplus",
        "com.disney.starplus",
        "com.cbs.app",
        "com.hbo.hbonow",
        "com.microsoft.xboxgaming",
        "com.android.settings",
        "com.discord",
        "com.android.vending"
    )
    private val checkUpdateTimeRunnable = object : Runnable {
        override fun run() {
            val currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
            if (currentTime == "23:59") {
                resetJsonSchedule()
            }
            // Reagendar para rodar novamente após 60000ms (1 minuto)
            handler.postDelayed(this, 60000)
        }
    }


    override fun onServiceConnected() {
        super.onServiceConnected()
        // Inicializa as preferências compartilhadas
        sharedPreferences = getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
        Log.d("AppMonitorService", "Service connected")
        handler.post(checkUpdateTimeRunnable)
    }

    private fun resetJsonSchedule() {
        val jsonSchedule = sharedPreferences.getString("jsonSchedule", "{}") ?: "{}"
        val schedule = JSONObject(jsonSchedule)
        val keys = schedule.keys()

        while (keys.hasNext()) {
            val day = keys.next()
            val tasks = schedule.getJSONArray(day)
            for (i in 0 until tasks.length()) {
                val task = tasks.getJSONObject(i)
                task.put("accomplished", false)
            }
        }
        sharedPreferences.edit().putString("jsonSchedule", schedule.toString()).apply()
        Log.d("AppMonitorService", "Reset schedule: $schedule")
    }    

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event?.let { accessibilityEvent ->
            if (accessibilityEvent.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
                try {
                    // Carrega o agendamento do SharedPreferences como JSONObject
                    val jsonSchedule = sharedPreferences.getString("jsonSchedule", "{}") ?: "{}"
                    val schedule = JSONObject(jsonSchedule)
                    Log.d("AppMonitorService", "Loaded JSON schedule: $schedule")

                    // Obtemos o dia da semana atual
                    val dayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
                    val dayString = dayOfWeekToString(dayOfWeek)
                    Log.d("AppMonitorService", "Current day of week: $dayString")

                    // Verifica se existe um agendamento para o dia atual
                    if (schedule.has(dayString)) {
                        val todayTasks = schedule.getJSONArray(dayString)
                        Log.d("AppMonitorService", "Tasks for $dayString: $todayTasks")

                        // Obtém a hora atual
                        val currentTime = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
                        Log.d("AppMonitorService", "Current time: $currentTime")

                        // Verifica se algum app deve ser bloqueado
                        if (shouldBlockApp(todayTasks, currentTime, accessibilityEvent.packageName.toString())) {
                            if (Settings.canDrawOverlays(this)) {
                                val intent = Intent(this, OverlayActivity::class.java).apply {
                                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                                }
                                startActivity(intent)
                            } else {
                                Log.w("AppMonitorService", "Overlay permission not granted")
                            }
                        }
                    } else {
                        Log.w("AppMonitorService", "No tasks scheduled for $dayString")
                    }
                } catch (e: Exception) {
                    Log.e("AppMonitorService", "Error processing event: ${e.message}")
                }
            }
        }
    }

    override fun onInterrupt() {
        Log.w("AppMonitorService", "Service interrupted")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(checkUpdateTimeRunnable)
        Log.d("AppMonitorService", "Service destroyed")
    }

    private fun dayOfWeekToString(dayOfWeek: Int): String {
        return arrayOf("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday")[dayOfWeek - 1]
    }

    private fun shouldBlockApp(tasks: JSONArray, currentTime: String, packageName: String): Boolean {
        val currentTimeDate = SimpleDateFormat("HH:mm", Locale.getDefault()).parse(currentTime)

        for (i in 0 until tasks.length()) {
            val task = tasks.getJSONObject(i)
            val taskTime = task.getString("time")
            val accomplished = task.getBoolean("accomplished")
            val taskTimeDate = SimpleDateFormat("HH:mm", Locale.getDefault()).parse(taskTime)

            if (currentTimeDate.compareTo(taskTimeDate) >= 0 && !accomplished && blockedPackages.contains(packageName)) {
                return true
            }
        }
        return false
    }
}
