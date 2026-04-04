package com.serene.app

import android.content.Intent
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

    @ReactMethod
    fun startOverlay() {
        val intent = Intent(reactContext, MotionCuesService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopOverlay() {
        val intent = Intent(reactContext, MotionCuesService::class.java)
        reactContext.stopService(intent)
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
