var NiceUtil ={};


var b = navigator.userAgent.toLowerCase();

NiceUtil.version = "20160225";

// Figure out what browser is being used
NiceUtil.browser = {
	version: (b.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
	safari: /webkit/.test(b),
	opera: /opera/.test(b),
	msie: /msie/.test(b) || /trident/.test(b) && !/opera/.test(b),
	mozilla: /mozilla/.test(b) && !/(compatible|webkit)/.test(b)
};

NiceUtil.height = function(mode) {
	if(mode == window )
		//if ( NiceUtil.browser.opera || (NiceUtil.browser.safari && parseInt(NiceUtil.browser.version) > 520) )
		//	return self.innerHeight - ((NiceUtil.height(document).height() > self.innerHeight) ? getScrollbarWidth() : 0);
		if ( NiceUtil.browser.safari )
			return self.innerHeight;
		else
            return NiceUtil.boxModel && document.documentElement.clientHeight || document.body.clientHeight;
	if (mode == document) 
		return Math.max( (NiceUtil.boxModel && document.documentElement.scrollHeight || document.body.scrollHeight), document.body.offsetHeight );
}


NiceUtil.width = function(mode) {
	if ( mode== window )
		//if ( NiceUtil.browser.opera || (NiceUtil.browser.safari && parseInt(NiceUtil.browser.version) > 520) )
		//	return self.innerWidth - (($(document).width() > self.innerWidth) ? getScrollbarWidth() : 0);
		if ( NiceUtil.browser.safari )
			return self.innerWidth;
		else
               return NiceUtil.boxModel && document.documentElement.clientWidth || document.body.clientWidth;

	if (mode == document )
		if (NiceUtil.browser.mozilla) {
			var scrollLeft = self.pageXOffset;
			self.scrollTo(99999999, self.pageYOffset);
			var scrollWidth = self.pageXOffset;
			self.scrollTo(scrollLeft, self.pageYOffset);
			return document.body.offsetWidth + scrollWidth;
		}
		else 
			return Math.max( ((NiceUtil.boxModel && !NiceUtil.browser.safari) && document.documentElement.scrollWidth || document.body.scrollWidth), document.body.offsetWidth );
}

NiceUtil.getWindowHeight = function() {
	  var myHeight = 0;
	  if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	  }
	  return myHeight;
}

NiceUtil.getWindowWidth = function() {
	   var myWdith = 0;
	  if( typeof( window.innerWidth ) == 'number' ) {
		//Non-IE
		myWidth = window.innerWidth;
		myHeight = window.innerHeight;
	  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		//IE 6+ in 'standards compliant mode'
		myWidth = document.documentElement.clientWidth;
		myHeight = document.documentElement.clientHeight;
	  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		//IE 4 compatible
		myWidth = document.body.clientWidth;
		myHeight = document.body.clientHeight;
	  }
	  return myWidth;
}


NiceUtil.getYposition = function(){
  var scrollY = 0;
  if( typeof( window.pageYOffset ) == 'number' ) {
    scrollY = window.pageYOffset;
  } else if( document.body && ( document.body.scrollTop ) ) {
    scrollY = document.body.scrollTop;
  } else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
    scrollY = document.documentElement.scrollTop;
  }
  return scrollY ;
}

NiceUtil.getXposition = function(){
  var scrollx = 0;
  if( typeof( window.pageXOffset ) == 'number' ) {
    scrollx = window.pageXOffset;
  } else if( document.body && ( document.body.scrollTop ) ) {
    scrollx = document.body.scrollLeft;
  } else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
    scrollx = document.documentElement.scrollLeft;
  }
  return scrollx ;
}

NiceUtil.boxModel = !NiceUtil.browser.msie || document.compatMode == "CSS1Compat";

NiceUtil.setCookie = function(cKey, cValue)  
{
	var date = new Date(); 
	var validity = 1;
	date.setDate(date.getDate() + validity);
	document.cookie = cKey + '=' + escape(cValue) + ';expires=' + date.toGMTString();
}


NiceUtil.getCookie = function(cKey) {
    var allcookies = document.cookie;
    var cookies = allcookies.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var keyValues = cookies[i].split("=");
        if (keyValues[0] == cKey) {
            return unescape(keyValues[1]);
        }
    }
    return "";
}

NiceUtil.delCookie = function(cKey) {
    var date = new Date(); 
    var validity = -1;
    date.setDate(date.getDate() + validity);
    document.cookie = cKey + "=;expires=" + date.toGMTString();
}

// Flash Player Version Detection - Rev 1.6
// Detect Client Browser type
// Copyright(c) 2005-2006 Adobe Macromedia Software, LLC. All rights reserved.
var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
var isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;

function ControlVersion()
{
	var version;
	var axo;
	var e;

	// NOTE : new ActiveXObject(strFoo) throws an exception if strFoo isn't in the registry

	try {
		// version will be set for 7.X or greater players
		axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
		version = axo.GetVariable("$version");
	} catch (e) {
	}

	if (!version)
	{
		try {
			// version will be set for 6.X players only
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
			
			// installed player is some revision of 6.0
			// GetVariable("$version") crashes for versions 6.0.22 through 6.0.29,
			// so we have to be careful. 
			
			// default to the first public version
			version = "WIN 6,0,21,0";

			// throws if AllowScripAccess does not exist (introduced in 6.0r47)		
			axo.AllowScriptAccess = "always";

			// safe to call for 6.0r47 or greater
			version = axo.GetVariable("$version");

		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 4.X or 5.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = axo.GetVariable("$version");
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 3.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			version = "WIN 3,0,18,0";
		} catch (e) {
		}
	}

	if (!version)
	{
		try {
			// version will be set for 2.X player
			axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			version = "WIN 2,0,0,11";
		} catch (e) {
			version = -1;
		}
	}
	
	return version;
}

// JavaScript helper required to detect Flash Player PlugIn version information
function GetSwfVer(){
	// NS/Opera version >= 3 check for Flash plugin in plugin array
	var flashVer = -1;
	
	if (navigator.plugins != null && navigator.plugins.length > 0) {
		if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
			var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
			var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;
			var descArray = flashDescription.split(" ");
			var tempArrayMajor = descArray[2].split(".");			
			var versionMajor = tempArrayMajor[0];
			var versionMinor = tempArrayMajor[1];
			var versionRevision = descArray[3];
			if (versionRevision == "") {
				versionRevision = descArray[4];
			}
			if (versionRevision[0] == "d") {
				versionRevision = versionRevision.substring(1);
			} else if (versionRevision[0] == "r") {
				versionRevision = versionRevision.substring(1);
				if (versionRevision.indexOf("d") > 0) {
					versionRevision = versionRevision.substring(0, versionRevision.indexOf("d"));
				}
			} else if (versionRevision[0] == "b") {
				versionRevision = versionRevision.substring(1);
			}
			var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
		}
	}
	// MSN/WebTV 2.6 supports Flash 4
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
	// WebTV 2.5 supports Flash 3
	else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
	// older WebTV supports Flash 2
	else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
	else if ( isIE && isWin && !isOpera ) {
		flashVer = ControlVersion();
	}
	return flashVer;
}

// When called with reqMajorVer, reqMinorVer, reqRevision returns true if that version or greater is available
function DetectFlashVer(reqMajorVer, reqMinorVer, reqRevision)
{
	try{
		versionStr = GetSwfVer();
		if (versionStr == -1 ) {
			return false;
		} else if (versionStr != 0) {
			if(isIE && isWin && !isOpera) {
				// Given "WIN 2,0,0,11"
				tempArray         = versionStr.split(" "); 	// ["WIN", "2,0,0,11"]
				tempString        = tempArray[1];			// "2,0,0,11"
				versionArray      = tempString.split(",");	// ['2', '0', '0', '11']
			} else {
				versionArray      = versionStr.split(".");
			}
			var versionMajor      = versionArray[0];
			var versionMinor      = versionArray[1];
			var versionRevision   = versionArray[2];

				// is the major.revision >= requested major.revision AND the minor version >= requested minor
			if (versionMajor > parseFloat(reqMajorVer)) {
				return true;
			} else if (versionMajor == parseFloat(reqMajorVer)) {
				if (versionMinor > parseFloat(reqMinorVer))
					return true;
				else if (versionMinor == parseFloat(reqMinorVer)) {
					if (versionRevision >= parseFloat(reqRevision))
						return true;
				}
			}
			return false;
		}
	}catch(e){
		return true;
	}
}