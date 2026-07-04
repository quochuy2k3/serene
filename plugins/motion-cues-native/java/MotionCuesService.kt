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
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class MotionCuesService : Service(), SensorEventListener {

    private lateinit var windowManager: WindowManager
    private lateinit var sensorManager: SensorManager
    private var linearAccelerationSensor: Sensor? = null
    private var dotsView: DotsView? = null

    // Config, refreshed on every onStartCommand.
    private var dotSizeDp = DEFAULT_DOT_SIZE_DP
    private var sensitivityMultiplier = DEFAULT_SENSITIVITY_MULT
    private var dotCount = DEFAULT_DOT_COUNT
    private var opacity = DEFAULT_OPACITY

    // Notification copy, localized by the JS layer (i18next) and passed in
    // via the start intent. English fallbacks keep a bare start readable.
    private var notifTitle = DEFAULT_NOTIF_TITLE
    private var notifText = DEFAULT_NOTIF_TEXT

    // Low-pass filtered dot offset. Kept across frames so we can ease toward
    // each new sensor target instead of snapping to it.
    private var smoothedShiftX = 0f
    private var smoothedShiftY = 0f

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        linearAccelerationSensor =
            sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Refresh config + notification copy from the (re)start intent before
        // anything reads them. Fallbacks keep a bare start (missing extra)
        // rendering.
        dotSizeDp = intent?.getFloatExtra(EXTRA_DOT_SIZE_DP, dotSizeDp) ?: dotSizeDp
        sensitivityMultiplier =
            intent?.getFloatExtra(EXTRA_SENSITIVITY, sensitivityMultiplier)
                ?: sensitivityMultiplier
        dotCount = intent?.getIntExtra(EXTRA_DOT_COUNT, dotCount) ?: dotCount
        opacity = intent?.getFloatExtra(EXTRA_OPACITY, opacity) ?: opacity
        notifTitle = intent?.getStringExtra(EXTRA_NOTIF_TITLE) ?: notifTitle
        notifText = intent?.getStringExtra(EXTRA_NOTIF_TEXT) ?: notifText

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

        // Rebuild so a restart (settings change) applies the new look. Only
        // mark running / start the sensor if the overlay window actually
        // attached — otherwise the permission was revoked and we'd be draining
        // the sensor for an invisible overlay while reporting "active".
        teardown()
        if (setupOverlay()) {
            startSensor()
            isRunning = true
        } else {
            isRunning = false
            stopSelf()
        }

        // NOT_STICKY: once the overlay is gone (stopped, killed, or task
        // swiped away) the system must not silently resurrect it — the JS
        // layer owns when it turns back on.
        return START_NOT_STICKY
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        // User swiped the app out of Recents — don't leave the overlay
        // lingering on top of other apps. Tear down and stop.
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    /** Attaches the overlay window. Returns true only if it actually attached. */
    private fun setupOverlay(): Boolean {
        val positions = positionsFor(dotCount)
        val view = DotsView(this, dotSizeDp, positions)

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
            // User-configurable window alpha; floor keeps dots visible.
            alpha = opacity.coerceIn(MIN_OPACITY, 1f)
        }

        return try {
            windowManager.addView(view, params)
            dotsView = view
            true
        } catch (e: Exception) {
            // Overlay permission was likely revoked, or the device blocks it.
            Log.w(TAG, "Overlay addView failed; stopping service", e)
            false
        }
    }

    private fun startSensor() {
        linearAccelerationSensor?.let { sensor ->
            sensorManager.registerListener(
                this,
                sensor,
                SensorManager.SENSOR_DELAY_GAME
            )
        }
    }

    private fun teardown() {
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
        // Reset the filter so a restart doesn't inherit a stale offset.
        smoothedShiftX = 0f
        smoothedShiftY = 0f
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_LINEAR_ACCELERATION) return
        val view = dotsView ?: return

        val accelX = event.values[0]
        val accelY = event.values[1]

        val gain = BASE_SENSITIVITY * sensitivityMultiplier
        // Negate X: car turns right → dots shift left (matches Apple)
        val targetX = (-accelX * gain).coerceIn(-MAX_SHIFT, MAX_SHIFT)
        // Positive Y: car accelerates → dots shift down
        val targetY = (accelY * gain).coerceIn(-MAX_SHIFT, MAX_SHIFT)

        // Low-pass (EMA) filter: track sustained motion like braking or
        // turning while damping the high-frequency spikes a hard shake
        // produces, so the dots glide instead of snapping to the clamp.
        smoothedShiftX += LOW_PASS_ALPHA * (targetX - smoothedShiftX)
        smoothedShiftY += LOW_PASS_ALPHA * (targetY - smoothedShiftY)

        view.updateShift(smoothedShiftX, smoothedShiftY)
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
            .setContentTitle(notifTitle)
            .setContentText(notifText)
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        teardown()
    }

    /**
     * Draws all dots in a single overlay window. Sensor updates only mutate
     * the shift fields and request a vsync-throttled repaint, so the heavy
     * per-frame WindowManager.updateViewLayout path is gone entirely.
     */
    @SuppressLint("ViewConstructor")
    private class DotsView(
        context: Context,
        dotSizeDp: Float,
        private val positions: List<Pair<Float, Float>>
    ) : View(context) {

        private val density = resources.displayMetrics.density
        private val radiusPx = dotSizeDp * density / 2f

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
            for ((xRatio, yRatio) in positions) {
                val cx = w * xRatio + shiftX
                val cy = h * yRatio + shiftY
                canvas.drawCircle(cx, cy, radiusPx, fillPaint)
                canvas.drawCircle(cx, cy, radiusPx, strokePaint)
            }
        }
    }

    companion object {
        // True while the overlay is up. Read by the JS bridge so the UI can
        // resync its on/off state with reality (e.g. after the app is
        // reopened while the service is or isn't still running).
        @Volatile
        var isRunning = false

        private const val TAG = "MotionCuesService"

        const val NOTIF_ID = 1001
        const val CHANNEL_ID = "serene_motion_cues"

        const val EXTRA_DOT_SIZE_DP = "dotSizeDp"
        const val EXTRA_SENSITIVITY = "sensitivity"
        const val EXTRA_DOT_COUNT = "dotCount"
        const val EXTRA_OPACITY = "opacity"
        const val EXTRA_NOTIF_TITLE = "notifTitle"
        const val EXTRA_NOTIF_TEXT = "notifText"

        // Kept in sync with MOTION_CUES_CONFIG defaults (config.ts): medium
        // size = 12dp, medium sensitivity = 1.0, medium density = 8, default
        // opacity = 0.6. Only used if a start intent omits an extra.
        private const val DEFAULT_DOT_SIZE_DP = 12f
        private const val DEFAULT_SENSITIVITY_MULT = 1f
        private const val DEFAULT_DOT_COUNT = 8
        private const val DEFAULT_OPACITY = 0.6f
        private const val MIN_OPACITY = 0.2f

        // English fallbacks; the live copy is passed in localized from JS.
        private const val DEFAULT_NOTIF_TITLE = "Serene — Motion Cues active"
        private const val DEFAULT_NOTIF_TEXT = "Helping reduce motion sickness"

        private const val BASE_SENSITIVITY = 6f
        private const val MAX_SHIFT = 40f
        // EMA weight for a new sensor sample (~100ms time constant at
        // SENSOR_DELAY_GAME). Lower = smoother but laggier.
        private const val LOW_PASS_ALPHA = 0.2f

        private val LOW_POSITIONS = listOf(
            0.25f to 0.04f,
            0.75f to 0.04f,
            0.25f to 0.96f,
            0.75f to 0.96f
        )

        private val MEDIUM_POSITIONS = listOf(
            0.25f to 0.04f,   // top-left
            0.75f to 0.04f,   // top-right
            0.04f to 0.25f,   // left-top
            0.04f to 0.75f,   // left-bottom
            0.96f to 0.25f,   // right-top
            0.96f to 0.75f,   // right-bottom
            0.25f to 0.96f,   // bottom-left
            0.75f to 0.96f    // bottom-right
        )

        private val HIGH_POSITIONS = MEDIUM_POSITIONS + listOf(
            0.50f to 0.04f,   // top-mid
            0.50f to 0.96f,   // bottom-mid
            0.04f to 0.50f,   // left-mid
            0.96f to 0.50f    // right-mid
        )

        private fun positionsFor(count: Int): List<Pair<Float, Float>> =
            when (count) {
                4 -> LOW_POSITIONS
                12 -> HIGH_POSITIONS
                else -> MEDIUM_POSITIONS
            }
    }
}
