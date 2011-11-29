/*jslint strict: false, indent: 2 */
/*global document, XMLHttpRequest, location: true */

(function () {
  // The value for scheme needs to match the value used in the
  // AndroidManifest.xml's intent that has the android:scheme attribute.
  var scheme = 'idme',
      // For the real BrowserID, this would be 'https://browserid.org'
      browserIdHost = 'http://10.0.1.21:10002';

  // Converts a query string to a JS object. DOES NOT take into account
  // multi-value properties.
  function queryAsObject(query) {
    var separator = query.indexOf('&amp;') === -1 ? '&' : '&amp;',
        parts = query.split(separator),
        obj = {};

    parts.forEach(function (pair) {
      pair = pair.split('=');
      obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    });

    return obj;
  }

  function output(message) {
    var node = document.getElementById('output');
    node.value += message + '\n';
  }

  document.addEventListener("DOMContentLoaded", function (evt) {
    // Check the URL fragment ID (hash) to see if we got an assertion.
    // If so, show it in the body.
    var frag = location.href.split('#')[1],
        args, xhr, body;

    if (frag) {
      args = queryAsObject(frag);

      if (args.assertion) {
        // It's go time! Verify the assertion.
        // TODO: also look at just doing verification client-side.
        body = 'assertion=' + encodeURIComponent(args.assertion) +
               '&audience=' + encodeURIComponent(scheme + '://');


        xhr = new XMLHttpRequest();
        xhr.open('POST', browserIdHost + '/verify', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function (evt) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var verifiedData = JSON.parse(xhr.responseText);
              output(JSON.stringify(verifiedData, null, '  '));
            } else {
              output('Error: ' + xhr.statusText);
            }
          }
        };
        xhr.send(body);
      }
    }

    // Listen for button clicks to launch BrowserID
    document.getElementById('signIn').addEventListener('click', function (evt) {
      evt.preventDefault();

      // Ask for an URL, this triggers the browser on the device.
      // Go to BrowserID, passing appScheme.
      location.href = browserIdHost + '/sign_in#appScheme=' + encodeURIComponent(scheme);
    }, false);
  }, false);

}());
