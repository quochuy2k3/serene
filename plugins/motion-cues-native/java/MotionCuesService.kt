package com.serene.app

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PixelFormat
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class MotionCuesService : Service(), SensorEventListener {

    private lateinit var windowManager: WindowManager
    private lateinit var sensorManager: SensorManager
    private var linearAccelerationSensor: Sensor? = null
    private var dotsView: DotsView? = null

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
        val view = DotsView(this)

        // One full-screen, non-touchable overlay window. We never call
        // updateViewLayout per frame — the view repaints itself instead,
        // so WindowManager is not hammered (which would starve other apps).
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            // Window-level alpha keeps the system from forcing it down (and
            // silences the FLAG_NOT_TOUCHABLE alpha warning).
            alpha = 0.85f
        }

        try {
            windowManager.addView(view, params)
            dotsView = view
        } catch (_: Exception) {
            // Permission may have been revoked or device doesn't support it
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
        val view = dotsView ?: return

        val accelX = event.values[0]
        val accelY = event.values[1]

        // Negate X: car turns right → dots shift left (matches Apple)
        val shiftX = (-accelX * SENSITIVITY).coerceIn(-MAX_SHIFT, MAX_SHIFT)
        // Positive Y: car accelerates → dots shift down
        val shiftY = (accelY * SENSITIVITY).coerceIn(-MAX_SHIFT, MAX_SHIFT)

        // Coalesced to the display vsync (~60fps) — no WindowManager traffic.
        view.updateShift(shiftX, shiftY)
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
        dotsView?.let { view ->
            try {
                windowManager.removeView(view)
            } catch (_: Exception) {
                // Ignore
            }
        }
        dotsView = null
    }

    /**
     * Draws all 8 dots in a single overlay window. Sensor updates only mutate
     * the shift fields and request a vsync-throttled repaint, so the heavy
     * per-frame WindowManager.updateViewLayout path is gone entirely.
     */
    @SuppressLint("ViewConstructor")
    private class DotsView(context: Context) : View(context) {

        private val density = resources.displayMetrics.density
        private val radiusPx = DOT_SIZE_DP * density / 2f

        private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#E6FFFFFF")
            style = Paint.Style.FILL
        }
        private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#33000000")
            style = Paint.Style.STROKE
            strokeWidth = density // 1dp
        }

        private var shiftX = 0f
        private var shiftY = 0f

        fun updateShift(x: Float, y: Float) {
            shiftX = x
            shiftY = y
            postInvalidateOnAnimation()
        }

        override fun onDraw(canvas: Canvas) {
            val w = width.toFloat()
            val h = height.toFloat()
            for ((xRatio, yRatio) in DOT_POSITIONS) {
                val cx = w * xRatio + shiftX
                val cy = h * yRatio + shiftY
                canvas.drawCircle(cx, cy, radiusPx, fillPaint)
                canvas.drawCircle(cx, cy, radiusPx, strokePaint)
            }
        }
    }

    companion object {
        const val NOTIF_ID = 1001
        const val CHANNEL_ID = "serene_motion_cues"

        private const val DOT_SIZE_DP = 12f
        private const val SENSITIVITY = 6f
        private const val MAX_SHIFT = 40f

        // 8 dot positions as ratios of screen width/height
        private val DOT_POSITIONS = listOf(
            0.25f to 0.04f,   // top-left
            0.75f to 0.04f,   // top-right
            0.04f to 0.25f,   // left-top
            0.04f to 0.75f,   // left-bottom
            0.96f to 0.25f,   // right-top
            0.96f to 0.75f,   // right-bottom
            0.25f to 0.96f,   // bottom-left
            0.75f to 0.96f    // bottom-right
        )
    }
}
