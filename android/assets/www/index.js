/*jslint strict: false */
/*global document, location: true */

document.addEventListener("DOMContentLoaded", function (evt) {
    //Check the URL fragment ID (hash) to see if we got an assertion.
    //If so, show it in the body.
    var frag = location.href.split('#')[1];
    if (frag) {
        document.getElementById('output').innerHTML = frag;
    }

    //Listen for button clicks to launch BrowserID
    document.getElementById('signIn').addEventListener('click', function (evt) {
        evt.preventDefault();

        //Ask for an URL, this triggers the browser on the device.
        //Go to BrowserID, passing appScheme. The value for appScheme
        //needs to match the value used in AndroidManifest.xml's intent
        //that has the android:scheme attribute.
        location.href = 'http://10.0.1.21:10002/sign_in#appScheme=idme';
    }, false);
}, false);
