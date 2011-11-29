package com.mozilla.labs.idme;

import android.os.Bundle;
import com.phonegap.*;

public class IdmeActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
    }
}