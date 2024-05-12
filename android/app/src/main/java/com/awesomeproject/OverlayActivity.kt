package com.goal

import android.app.Activity
import android.os.Bundle
import android.view.WindowManager
import android.widget.TextView

class OverlayActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.overlay_activity)

        window.apply {
            addFlags(WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE)
            addFlags(WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE)
            addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            addFlags(WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH)
            setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY)
        }
    }
}
