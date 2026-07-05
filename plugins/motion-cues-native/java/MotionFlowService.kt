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
import org.json.JSONObject
import kotlin.math.abs

/**
 * Motion Cues v2 — the "Dynamic" style.
 *
 * Maps device acceleration to the scroll velocity of a peripheral dot field:
 * the field flows opposite the motion while the device accelerates, eases to
 * rest when it stops, and reverses only slightly (a small, tunable "brake"
 * factor) so a stop does not spring back. See docs/apple-motion-cues-method.md.
 *
 * All physics/look constants come from [Tuning], which is overridden per start
 * by the [EXTRA_FLOW_PARAMS] JSON — so it can be tuned from JS with Fast Refresh
 * and no native rebuild. v1 ([MotionOffsetService]) is left untouched; the JS
 * bridge chooses which service runs from the user's motionStyle setting.
 */
class MotionFlowService : Service(), SensorEventListener {

    private lateinit var windowManager: WindowManager
    private lateinit var sensorManager: SensorManager
    private var linearAccelerationSensor: Sensor? = null
    private var flowView: FlowView? = null

    // Appearance/config, refreshed on every onStartCommand from the intent.
    private var dotSizeDp = DEFAULT_DOT_SIZE_DP
    private var sensitivityMultiplier = DEFAULT_SENSITIVITY_MULT
    private var dotCount = DEFAULT_DOT_COUNT
    private var opacity = DEFAULT_OPACITY
    private var notifTitle = DEFAULT_NOTIF_TITLE
    private var notifText = DEFAULT_NOTIF_TEXT

    private val tuning = Tuning()

    // Motion filter state.
    private var accelFilteredX = 0f          // low-passed acceleration (m/s²)
    private var accelFilteredY = 0f
    private var scrollVelX = 0f              // dot scroll velocity (px/s)
    private var scrollVelY = 0f
    private var offsetX = 0f                 // accumulated scroll offset (px), wraps in view
    private var offsetY = 0f
    private var lastTimestampNs = 0L

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        linearAccelerationSensor =
            sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        dotSizeDp = intent?.getFloatExtra(EXTRA_DOT_SIZE_DP, dotSizeDp) ?: dotSizeDp
        sensitivityMultiplier =
            intent?.getFloatExtra(EXTRA_SENSITIVITY, sensitivityMultiplier)
                ?: sensitivityMultiplier
        dotCount = intent?.getIntExtra(EXTRA_DOT_COUNT, dotCount) ?: dotCount
        opacity = intent?.getFloatExtra(EXTRA_OPACITY, opacity) ?: opacity
        notifTitle = intent?.getStringExtra(EXTRA_NOTIF_TITLE) ?: notifTitle
        notifText = intent?.getStringExtra(EXTRA_NOTIF_TEXT) ?: notifText
        tuning.applyJson(intent?.getStringExtra(EXTRA_FLOW_PARAMS))

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

        teardown()
        if (setupOverlay()) {
            startSensor()
            isRunning = true
        } else {
            isRunning = false
            stopSelf()
        }

        return START_NOT_STICKY
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        stopSelf()
        super.onTaskRemoved(rootIntent)
    }

    /** Attaches the overlay window. Returns true only if it actually attached. */
    private fun setupOverlay(): Boolean {
        val view = FlowView(
            this,
            dotSizeDp,
            dotCount,
            tuning.bandDp,
            tuning.fadeDp,
            tuning.fillAlpha,
            tuning.strokeAlpha
        )

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
            alpha = opacity.coerceIn(MIN_OPACITY, 1f)
        }

        return try {
            windowManager.addView(view, params)
            flowView = view
            true
        } catch (e: Exception) {
            Log.w(TAG, "Overlay addView failed; stopping service", e)
            false
        }
    }

    private fun startSensor() {
        linearAccelerationSensor?.let { sensor ->
            sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
        }
    }

    private fun teardown() {
        try {
            sensorManager.unregisterListener(this)
        } catch (_: Exception) {
        }
        flowView?.let { view ->
            try {
                windowManager.removeView(view)
            } catch (_: Exception) {
            }
        }
        flowView = null
        // Reset motion state so a restart doesn't inherit stale offset/velocity.
        accelFilteredX = 0f
        accelFilteredY = 0f
        scrollVelX = 0f
        scrollVelY = 0f
        offsetX = 0f
        offsetY = 0f
        lastTimestampNs = 0L
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_LINEAR_ACCELERATION) return
        val view = flowView ?: return

        // Seconds since the previous sample, from the sensor's own clock. Skip
        // the first sample (no baseline); clamp so a stall can't fling the field.
        val now = event.timestamp
        if (lastTimestampNs == 0L) {
            lastTimestampNs = now
            return
        }
        val dt = ((now - lastTimestampNs) / 1_000_000_000f).coerceIn(0f, tuning.maxDt)
        lastTimestampNs = now
        if (dt <= 0f) return

        // Deadband away idle shimmer, then low-pass to strip hand jitter.
        var accelX = event.values[0]
        var accelY = event.values[1]
        if (abs(accelX) < tuning.deadband) accelX = 0f
        if (abs(accelY) < tuning.deadband) accelY = 0f
        accelFilteredX += tuning.accLp * (accelX - accelFilteredX)
        accelFilteredY += tuning.accLp * (accelY - accelFilteredY)

        // Drive the scroll velocity opposite the acceleration. X is negated; Y
        // is kept positive because the sensor's Y points up while the screen's Y
        // points down (so both counter on screen).
        val gain = tuning.gain * sensitivityMultiplier
        scrollVelX = stepScrollVelocity(scrollVelX, -accelFilteredX * gain)
        scrollVelY = stepScrollVelocity(scrollVelY, accelFilteredY * gain)
        offsetX += scrollVelX * dt
        offsetY += scrollVelY * dt

        view.updateOffset(offsetX, offsetY)
    }

    /**
     * Ease one axis' scroll velocity toward [drive].
     *
     * When the drive OPPOSES the current flow — a deceleration that would spring
     * the dots back — it is scaled down by [Tuning.brakeFactor], so a stop keeps
     * most of its displacement instead of swinging home. When it ALIGNS (speeding
     * up) it applies in full. The test is memoryless (sign of drive vs. current
     * velocity), so there is no latch to get stuck, and a move from rest
     * (|scrollVel| ≈ 0) is never braked.
     */
    private fun stepScrollVelocity(scrollVel: Float, drive: Float): Float {
        val reversing = drive * scrollVel < 0f && abs(scrollVel) > tuning.scrollEps
        val target = if (reversing) drive * tuning.brakeFactor else drive
        return scrollVel + tuning.smooth * (target - scrollVel)
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
     * Mutable tuning, seeded with the DEF_* defaults and optionally overridden
     * from the JS-supplied JSON. Each [applyJson] key is optional — a missing key
     * keeps its current (default) value, mirroring `resolveFlowTuning` in JS.
     */
    private class Tuning {
        var gain = DEF_GAIN
        var brakeFactor = DEF_BRAKE_FACTOR
        var accLp = DEF_ACC_LP
        var deadband = DEF_DEADBAND
        var smooth = DEF_SMOOTH
        var scrollEps = DEF_SCROLL_EPS
        var maxDt = DEF_MAX_DT
        var bandDp = DEF_BAND_DP
        var fadeDp = DEF_FADE_DP
        var fillAlpha = DEF_FILL_ALPHA
        var strokeAlpha = DEF_STROKE_ALPHA

        fun applyJson(json: String?) {
            if (json.isNullOrEmpty()) return
            val o = try {
                JSONObject(json)
            } catch (e: Exception) {
                Log.w(TAG, "Bad flow params; using defaults", e)
                return
            }
            gain = o.optDouble("gain", gain.toDouble()).toFloat()
            brakeFactor = o.optDouble("brakeFactor", brakeFactor.toDouble()).toFloat()
            accLp = o.optDouble("accLp", accLp.toDouble()).toFloat()
            deadband = o.optDouble("deadband", deadband.toDouble()).toFloat()
            smooth = o.optDouble("smooth", smooth.toDouble()).toFloat()
            scrollEps = o.optDouble("scrollEps", scrollEps.toDouble()).toFloat()
            maxDt = o.optDouble("maxDt", maxDt.toDouble()).toFloat()
            bandDp = o.optDouble("bandDp", bandDp.toDouble()).toFloat()
            fadeDp = o.optDouble("fadeDp", fadeDp.toDouble()).toFloat()
            fillAlpha = o.optInt("fillAlpha", fillAlpha)
            strokeAlpha = o.optInt("strokeAlpha", strokeAlpha)
        }
    }

    /**
     * A staggered field of dots confined to the left/right edge bands, translated
     * by a wrapping scroll offset so it appears to flow endlessly. Each sample
     * only mutates the offset + requests a vsync-throttled repaint.
     */
    @SuppressLint("ViewConstructor")
    private class FlowView(
        context: Context,
        dotSizeDp: Float,
        dotCount: Int,
        bandDp: Float,
        fadeDp: Float,
        private val fillAlpha: Int,
        private val strokeAlpha: Int
    ) : View(context) {

        private val density = resources.displayMetrics.density
        private val radiusPx = dotSizeDp * density / 2f

        // Cell spacing scales inversely with density: dotCount 4/8/12 → ~112/88/72
        // dp, kept sparse so the field reads as a few calm dots.
        private val cellPx = ((120f - dotCount * 4f).coerceIn(64f, 120f)) * density

        // Edge zone: full strength within bandPx of an edge, fading to nothing
        // over the next fadePx toward centre.
        private val bandPx = bandDp * density
        private val fadePx = fadeDp * density

        private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        }
        private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            strokeWidth = density // 1dp
        }

        private var offsetX = 0f
        private var offsetY = 0f

        fun updateOffset(x: Float, y: Float) {
            offsetX = x
            offsetY = y
            postInvalidateOnAnimation()
        }

        override fun onDraw(canvas: Canvas) {
            val w = width.toFloat()
            val h = height.toFloat()
            val ox = floorMod(offsetX, cellPx)
            // Wrap Y by two cells so row parity — and the stagger — stays stable
            // as the field scrolls.
            val yPeriod = 2f * cellPx
            val oy = floorMod(offsetY, yPeriod)

            var row = -2
            val maxRow = ((h + yPeriod) / cellPx).toInt() + 2
            while (row <= maxRow) {
                val gy = row * cellPx + oy - yPeriod
                // Brick stagger: shift every other row half a cell.
                val rowShift = if ((row and 1) == 0) 0f else cellPx / 2f
                var gx = -cellPx + ox + rowShift
                while (gx < w + cellPx) {
                    // Mask keeps dots in the left/right bands and gives them a soft
                    // breathing appear/disappear as they scroll.
                    val mask = edgeMaskX(gx, w)
                    if (mask > 0.01f) {
                        val r = radiusPx * mask
                        fillPaint.alpha = (mask * fillAlpha).toInt()
                        strokePaint.alpha = (mask * strokeAlpha).toInt()
                        canvas.drawCircle(gx, gy, r, fillPaint)
                        canvas.drawCircle(gx, gy, r, strokePaint)
                    }
                    gx += cellPx
                }
                row++
            }
        }

        /** 1 within the edge band, smoothstep-fading to 0 over the next fadePx. */
        private fun edgeMaskX(x: Float, w: Float): Float {
            val d = minOf(x, w - x)
            if (d <= bandPx) return 1f
            if (d >= bandPx + fadePx) return 0f
            val t = 1f - (d - bandPx) / fadePx
            return t * t * (3f - 2f * t) // smoothstep
        }

        private fun floorMod(a: Float, b: Float): Float {
            val r = a % b
            return if (r < 0f) r + b else r
        }
    }

    companion object {
        // True while the v2 overlay is up. Read by the JS bridge so the UI can
        // resync its on/off state with reality.
        @Volatile
        var isRunning = false

        private const val TAG = "MotionFlowService"

        // Distinct notification id from v1 so the two services never collide.
        const val NOTIF_ID = 1002
        const val CHANNEL_ID = "serene_motion_cues"

        const val EXTRA_DOT_SIZE_DP = "dotSizeDp"
        const val EXTRA_SENSITIVITY = "sensitivity"
        const val EXTRA_DOT_COUNT = "dotCount"
        const val EXTRA_OPACITY = "opacity"
        const val EXTRA_NOTIF_TITLE = "notifTitle"
        const val EXTRA_NOTIF_TEXT = "notifText"
        // JSON blob of flow tuning (see Tuning.applyJson); ignored by v1.
        const val EXTRA_FLOW_PARAMS = "flowParams"

        private const val DEFAULT_DOT_SIZE_DP = 12f
        private const val DEFAULT_SENSITIVITY_MULT = 1f
        private const val DEFAULT_DOT_COUNT = 8
        private const val DEFAULT_OPACITY = 0.6f
        private const val MIN_OPACITY = 0.2f

        private const val DEFAULT_NOTIF_TITLE = "Serene — Motion Cues active"
        private const val DEFAULT_NOTIF_TEXT = "Helping reduce motion sickness"

        // Flow tuning defaults — must mirror FLOW_TUNING_DEFAULTS in config.ts.
        private const val DEF_GAIN = 120f          // scroll px/s per m/s²
        private const val DEF_BRAKE_FACTOR = 0.25f // reverse kept while stopping
        private const val DEF_ACC_LP = 0.2f        // acceleration low-pass weight
        private const val DEF_DEADBAND = 0.12f     // ignore |accel| below (m/s²)
        private const val DEF_SMOOTH = 0.2f        // scroll-velocity easing weight
        private const val DEF_SCROLL_EPS = 8f      // "no active flow" below (px/s)
        private const val DEF_MAX_DT = 0.1f        // per-sample dt clamp (s)
        private const val DEF_BAND_DP = 24f        // full-strength edge band (dp)
        private const val DEF_FADE_DP = 60f        // fade ramp past band (dp)
        private const val DEF_FILL_ALPHA = 230     // dot fill alpha (0–255)
        private const val DEF_STROKE_ALPHA = 51    // dot outline alpha (0–255)
    }
}
