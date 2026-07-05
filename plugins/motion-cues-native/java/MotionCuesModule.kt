package com.serene.app

import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class MotionCuesModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MotionCuesModule"

    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val granted = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Settings.canDrawOverlays(reactContext)
            } else {
                true
            }
            promise.resolve(if (granted) "granted" else "denied")
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_PERMISSION", e)
        }
    }

    @ReactMethod
    fun hasMotionSensor(promise: Promise) {
        try {
            val sensorManager =
                reactContext.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            val sensor =
                sensorManager?.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
            promise.resolve(sensor != null)
        } catch (e: Exception) {
            promise.reject("ERR_CHECK_SENSOR", e)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Settings.canDrawOverlays(reactContext)) {
                    promise.resolve("granted")
                    return
                }
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve("pending")
            } else {
                promise.resolve("granted")
            }
        } catch (e: Exception) {
            promise.reject("ERR_REQUEST_PERMISSION", e)
        }
    }

    /**
     * Starts the overlay in one of two animation styles:
     * - "dynamic" → [MotionFlowService] (v2, scrolling optic-flow field)
     * - anything else ("regular") → [MotionOffsetService] (v1, offset dots)
     *
     * Only one style may run at a time, so the other service is stopped first.
     * Both services read the same EXTRA_* keys.
     */
    @ReactMethod
    fun startOverlay(
        dotSizeDp: Double,
        sensitivity: Double,
        dotCount: Int,
        opacity: Double,
        style: String,
        flowParams: String,
        notifTitle: String,
        notifText: String
    ) {
        val useDynamic = style == "dynamic"
        // Stop the other style so the two overlays never stack.
        val otherClass =
            if (useDynamic) MotionOffsetService::class.java else MotionFlowService::class.java
        reactContext.stopService(Intent(reactContext, otherClass))

        val targetClass =
            if (useDynamic) MotionFlowService::class.java else MotionOffsetService::class.java
        val intent = Intent(reactContext, targetClass).apply {
            putExtra(MotionOffsetService.EXTRA_DOT_SIZE_DP, dotSizeDp.toFloat())
            putExtra(MotionOffsetService.EXTRA_SENSITIVITY, sensitivity.toFloat())
            putExtra(MotionOffsetService.EXTRA_DOT_COUNT, dotCount)
            putExtra(MotionOffsetService.EXTRA_OPACITY, opacity.toFloat())
            putExtra(MotionOffsetService.EXTRA_NOTIF_TITLE, notifTitle)
            putExtra(MotionOffsetService.EXTRA_NOTIF_TEXT, notifText)
            // Physics tuning JSON — only MotionFlowService (v2) reads it.
            putExtra(MotionFlowService.EXTRA_FLOW_PARAMS, flowParams)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopOverlay() {
        // Stop whichever style might be running.
        reactContext.stopService(Intent(reactContext, MotionOffsetService::class.java))
        reactContext.stopService(Intent(reactContext, MotionFlowService::class.java))
    }

    @ReactMethod
    fun isOverlayActive(promise: Promise) {
        promise.resolve(MotionOffsetService.isRunning || MotionFlowService.isRunning)
    }

    // Required for new architecture event emitter compatibility (even if unused)
    @ReactMethod
    fun addListener(eventName: String) {
        // No-op
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // No-op
    }
}
