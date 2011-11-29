package com.mozilla.labs.idme;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.phonegap.*;

public class IdmeActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Check intent to see if invoked as a response
        // to a specific intent request.
        Intent intent = getIntent();
        String frag = "";
        Uri uri = intent.getData();

        // Convert the intent data into a fragment ID
        // passed as part of the index.html URL.
        if (uri != null) {
	        String query = uri.getEncodedQuery();
	        if (query != null) {
                frag = query;
	        }
        }

        super.loadUrl("file:///android_asset/www/index.html#" + frag);
    }
}