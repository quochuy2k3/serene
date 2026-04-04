package com.serene.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class MotionCuesService : Service(), SensorEventListener {

    private lateinit var windowManager: WindowManager
    private lateinit var sensorManager: SensorManager
    private var linearAccelerationSensor: Sensor? = null
    private val dots = mutableListOf<View>()
    private val mainHandler = Handler(Looper.getMainLooper())

    // 8 dot positions as ratios of screen width/height
    private val dotPositions = listOf(
        0.25f to 0.04f,   // top-left
        0.75f to 0.04f,   // top-right
        0.04f to 0.25f,   // left-top
        0.04f to 0.75f,   // left-bottom
        0.96f to 0.25f,   // right-top
        0.96f to 0.75f,   // right-bottom
        0.25f to 0.96f,   // bottom-left
        0.75f to 0.96f    // bottom-right
    )

    private val dotSizeDp = 12
    private val sensitivity = 6f
    private val maxShift = 40

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIF_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIF_ID, notification)
        }

        setupOverlay()
        startSensor()

        return START_STICKY
    }

    private fun setupOverlay() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val metrics = resources.displayMetrics
        val dotSizePx = (dotSizeDp * metrics.density).toInt()

        dotPositions.forEach { (xRatio, yRatio) ->
            val dot = View(this).apply {
                setBackgroundResource(R.drawable.motion_cue_dot)
                alpha = 0.85f
            }
            val params = WindowManager.LayoutParams(
                dotSizePx,
                dotSizePx,
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.TOP or Gravity.START
                x = (metrics.widthPixels * xRatio - dotSizePx / 2).toInt()
                y = (metrics.heightPixels * yRatio - dotSizePx / 2).toInt()
            }

            try {
                windowManager.addView(dot, params)
                dots.add(dot)
            } catch (_: Exception) {
                // Permission may have been revoked or device doesn't support it
            }
        }
    }

    private fun startSensor() {
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        linearAccelerationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
        linearAccelerationSensor?.let { sensor ->
            sensorManager.registerListener(
                this,
                sensor,
                SensorManager.SENSOR_DELAY_GAME
            )
        }
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_LINEAR_ACCELERATION) return
        if (dots.isEmpty()) return

        val accelX = event.values[0]
        val accelY = event.values[1]

        // Negate X: car turns right → dots shift left (matches Apple)
        val shiftX = (-accelX * sensitivity).toInt().coerceIn(-maxShift, maxShift)
        // Positive Y: car accelerates → dots shift down
        val shiftY = (accelY * sensitivity).toInt().coerceIn(-maxShift, maxShift)

        val metrics = resources.displayMetrics
        val dotSizePx = (dotSizeDp * metrics.density).toInt()

        mainHandler.post {
            dots.forEachIndexed { index, dot ->
                val (xRatio, yRatio) = dotPositions[index]
                val params = dot.layoutParams as? WindowManager.LayoutParams ?: return@forEachIndexed
                params.x = (metrics.widthPixels * xRatio - dotSizePx / 2 + shiftX).toInt()
                params.y = (metrics.heightPixels * yRatio - dotSizePx / 2 + shiftY).toInt()
                try {
                    windowManager.updateViewLayout(dot, params)
                } catch (_: Exception) {
                    // View may have been detached
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    private fun buildNotification(): Notification {
        val notificationManager = getSystemService(NotificationManager::class.java)
        if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Motion Cues",
                NotificationManager.IMPORTANCE_MIN
            ).apply {
                description = "Shows when motion cues overlay is active"
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Serene — Motion Cues active")
            .setContentText("Helping reduce motion sickness")
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            sensorManager.unregisterListener(this)
        } catch (_: Exception) {
            // Ignore
        }
        dots.forEach { dot ->
            try {
                windowManager.removeView(dot)
            } catch (_: Exception) {
                // Ignore
            }
        }
        dots.clear()
    }

    companion object {
        const val NOTIF_ID = 1001
        const val CHANNEL_ID = "serene_motion_cues"
    }
}
