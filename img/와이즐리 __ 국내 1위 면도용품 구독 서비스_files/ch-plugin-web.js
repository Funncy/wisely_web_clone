(function() {
  var availableBrowser = function() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 11 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10) > 10;
    }
    return true;
  };

  var cookieEnabled = function() {
    if (!window.navigator.cookieEnabled) {
      return false;
    }

    // Only IE
    if (window.document.documentMode) {
      document.cookie = 'ch-session-test=1';

      if (document.cookie.split('ch-session-test=').length >= 2) {
        document.cookie = 'ch-session-test=; Max-Age=0';
        return true;
      }

      return false;
    }

    return true;
  }

  if (availableBrowser() && cookieEnabled()) {
    if (!document.getElementById('ch-plugin')) {
      var node = document.createElement('div');
      node.id = 'ch-plugin';
      document.body.appendChild(node);
    }
    var root = document.getElementById("ch-plugin");
    root.innerHTML += '<div id="ch-plugin-core"></div><div id="ch-plugin-script" style="display:none"><iframe id="ch-plugin-script-iframe" style="position:relative!important;height:100%!important;width:100%!important;border:none!important;"></iframe></div>';

    var iframe = document.getElementById('ch-plugin-script-iframe');
    var scriptIsLoaded = false;

    var loadScript = function () {
      var src = 'https://cdn.channel.io/plugin/ch-plugin-core-20200902133206.js';
      var doc = (iframe.contentDocument || iframe.contentWindow.document);
      doc.open();
      doc.write('<script async type="text/javascript" src="' + src + '" charset="UTF-8"></script>');
      doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="main"></div></body></html>');
      doc.close();
      scriptIsLoaded = true;
    }

    if (!iframe.onload) {
      loadScript();
    }

    iframe.onload = function () {
      if (!scriptIsLoaded) {
        loadScript();
      }
    }
  }
})();
