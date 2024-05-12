package com.awesomeproject

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

class AppMonitorService : AccessibilityService() {
    private lateinit var sharedPreferences: SharedPreferences

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Inicializa as preferências compartilhadas
        sharedPreferences = getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
        Log.d("AppMonitorService", "Service connected")
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

    private fun dayOfWeekToString(dayOfWeek: Int): String {
        return arrayOf("sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday")[dayOfWeek - 1]
    }

        private fun shouldBlockApp(tasks: JSONArray, currentTime: String, packageName: String): Boolean {
            // Formata o horário atual para um objeto Date para comparação
            val currentTimeDate = SimpleDateFormat("HH:mm", Locale.getDefault()).parse(currentTime)

            for (i in 0 until tasks.length()) {
                val task = tasks.getJSONObject(i)
                val taskTime = task.getString("time")
                val accomplished = task.getBoolean("accomplished")

                // Formata o horário da tarefa para um objeto Date para comparação
                val taskTimeDate = SimpleDateFormat("HH:mm", Locale.getDefault()).parse(taskTime)

                // Verifica se o horário atual é igual ou depois do horário da tarefa e se a tarefa não foi concluída
                if (currentTimeDate.compareTo(taskTimeDate) >= 0 && !accomplished && packageName.contains("com.instagram.android")) {
                    return true
                }
            }
            return false
        }
}
