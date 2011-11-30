# idme

An example of using [BrowserID](https://browserid.org) with mobile/device apps
built with [Phonegap](http://www.phonegap.com/). There is a
[short video demo of it running in iOS](http://vimeo.com/32890370).

These examples require [a branch of browserid](https://github.com/jrburke/browserid/tree/appscheme)
that has some changes to support app <--> browser jumping via app protocol/scheme
URLs.

[Here is a comparison of the changes with browserid master](https://github.com/jrburke/browserid/compare/mozilla:dev...jrburke:appscheme?w=1).

This repo contains an Android and iOS project that is based on a basic Phonegap
app, but adds in some extra hooks to navigate out to http://browserid.org to
get a user's verified email address.

This code is using `http://10.0.1.21:10002` instead of `https://browserid.org`
because I was running the appscheme branch of the browserid code on that local
IP address, so in the places where `http://10.0.1.21:10002` is referenced,
use `https://browserid.org` if this kind of app protocol support lands in
browserid.

This app also uses the `idme` as the app protocol. Change this value to a unique
app protocol value appropriate for your app. Similarly, change references to
`com.mozilla.labs.idme` to an appropriate value for your app.

## Changes to a stock phonegap app

The [index.html](https://github.com/jrburke/idme/blob/master/android/assets/www/index.html)
and index.js file used in the phonegap app are the same for Android an iOS in
this example. The main work is done by index.js

**[index.js](https://github.com/jrburke/idme/blob/master/android/assets/www/index.js)**

It listens for clicks on the sign in button and asks the device to go BrowserID,
passing an appScheme to BrowserID:

```url
    http://10.0.1.21:10002/sign_in#appScheme=idme
```

That goes to the modified browserid server. It does not use a postMessage frame
communication with the relying party, but instead does the user flow and at the
end just does a

```javascript
    location.href = idme://?assertion=[data]
```

This triggers a jump back to the app.

Then, in the index.js in the app, for Android, it looks for a querystring
that has the assertion=[data]. On iOS, the Phonegap code comes wired to call
a calls a global function named `handleOpenURL` with the `idme://?assertion=[data]`
URL.

Both of those pathways are fed into an `onAppQuery` function that uses
XMLHttpRequest to contact the BrowserID /verify service to convert the assertion
data into the JSON blob with the email address.

This could be improved to do the verfication in the app code.

The demo app then just shows the JSON blob in a text area output to show the
assertion was verified.

The native app parts that were modified:

* [Android](#android)
* [iOS](#ios)

## Android <a name="android"></name>

The changes done in the android project:

**[android/AndroidManifest.xml](https://github.com/jrburke/idme/blob/master/android/AndroidManifest.xml)**

Add the following as a child to the `<activity>` tag:

```xml
    <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="idme" />
    </intent-filter>
```

**[android/src/com/mozilla/labs/idme/IdmeActivity.java](https://github.com/jrburke/idme/blob/master/android/src/com/mozilla/labs/idme/IdmeActivity.java)**

In the main "Activity" class, grab the data for the app when it is called
as an intent triggered by a protocol URL jump to the app:

```java
    // Check intent to see if invoked as a response
    // to a specific intent request.
    Intent intent = getIntent();
    String query = "";
    Uri uri = intent.getData();

    // Convert the intent data into a fragment ID
    // passed as part of the index.html URL.
    if (uri != null) {
            query = uri.getEncodedQuery();
            if (query == null) {
            query = "";
            } else {
                query = "?" + query;
            }
    }

    super.loadUrl("file:///android_asset/www/index.html" + query);
```

## iOS <a name="ios"></name>

**[ios/idme/PhoneGap.plist](https://github.com/jrburke/idme/blob/master/ios/idme/PhoneGap.plist)**

Add an entry into the `ExternalHosts` to allow the XMLHttpRequest call to /verify
to work:

```xml
    <key>ExternalHosts</key>
    <array>
            <string>10.0.1.21</string>
    </array>
```

**[ios/idme/idme-Info.plist](https://github.com/jrburke/idme/blob/master/ios/idme/idme-Info.plist)**

Indicate that the app will handle idme:// URLs:

```xml
    <key>CFBundleURLTypes</key>
    <array>
            <dict>
                    <key>CFBundleURLName</key>
                    <string>com.mozilla.labs.idme</string>
                    <key>CFBundleURLSchemes</key>
                    <array>
                            <string>idme</string>
                    </array>
            </dict>
    </array>
```

## TODOs

Things to think about:

Should there be a specialized flow for apps? For instance, maybe have a quick
link to launch the mail app on the device to check for verification email for that flow?

Looking at the security suggestions for BrowserID it mentions "always verify on server".
What does that mean for apps? Maybe just always suggest local, in-app verification
instead of calling /verify.

The assertion generation takes a while, to the point where it looks like it is
not working. Probably best to have some sort of status/"thinking..." message.

We probably want to send a cachebust/querystring to the /sign_in URL when the app
calls it, to make sure the page reloads to get the new appScheme. Either that
or have the page poll for fragment ID changes, but this has to be be aware of
the clearing of the fragment ID the code does today.

For the BrowserID server code, make sure the certassertion.js makes sense,
and does not need to be narrowed more for app:// URLs.
