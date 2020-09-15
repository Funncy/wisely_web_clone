var NicePayCommon = {};
var NicePayStd = {};

var merchantForm;
var existSubmitUrl;
var existTarget;
var hasFrame = false;
var documentBody;

//-------------------------------------------
//Flex Variables
//-------------------------------------------
var cdn_url = "http://cdn.";

if(document.location.protocol=="https:"){
	cdn_url = "https://web.";	
}

document.write("<script src='"+cdn_url+"nicepay.co.kr/flex/js/niceUtil.js' language='javascript'></script>");

var fileUrl = cdn_url+'nicepay.co.kr/flex/';
var formName = '';
var payMethod = '';
var nAgt= navigator.userAgent;
var proxyURL = "";
var callflash = 0;
var merchantForm;
var client = "IE";
var ieVerOffset=nAgt.indexOf("MSIE");
var ieVersion;
var merchantActionURL = "";
var installHelpTime;
var isHiddenNicePay = false;
var disableScrollYN = "N";

var npNiceLayerZIdx = 9999;
var npBgLayerZIdx = 9998;
var npPopupLayerZIdx = 9997;

var nicepayDomain = "https://web.nicepay.co.kr";

// direct call option
var POPUP = "POPUP";

//dummy
function NicePayUpdate(){}

function goPay(payForm){
	
	merchantForm = payForm;
	existSubmitUrl = payForm.action;
	
	// scroll prevention
	if(payForm.NPDisableScroll){
		disableScrollYN = payForm.NPDisableScroll.value;
	}

	if(payForm.NpZIdxHigher && payForm.NpZIdxHigher.value == "Y"){
		npNiceLayerZIdx = 11001;
		npBgLayerZIdx = 11000;
		npPopupLayerZIdx = 10999;
	}
		
	if(top!=self && self.name!="") {
		//hasFrame = true;
		//NicePayCommon.errorReport("IN01", "THIS MERCHANT HAS FRAME", "LOG");
	}
	
	if(hasFrame){
		documentBody = parent.document.body || parent.document.documentElement;
	}else{
		documentBody = document.body || document.documentElement;
	}
	
	try{
		if(!document.body){
			NicePayCommon.errorReport("noBody", "noBody", "");
		}
		if(payForm.encoding.indexOf("multipart") > -1){
			NicePayCommon.errorReport("multipart", "multipart", "");
			goPayFlex(payForm);
			return;
		}
		
		var browser = NicePayStd.uaMatch(nAgt);
		if(browser.msie && browser.version < 9){
			alert("사용하시는 브라우저는 MicroSoft사의 보안지원이 종료된 버전입니다. \n 안전한 결제를 위해 Internet Explorer 9.0 이상 또는 크롬 등의 다른 브라우저 사용 요청 드립니다.");
			NicePayCommon.errorReport("MJ02", browser.name+browser.version, "");
			return false;
		}
		
		if(browser.msedge){
			// edge confirm check
			if(payForm.DisableEdgeChk && payForm.DisableEdgeChk.value == "Y"){
				// do nothing ~
			}else{
				if(browser.version < 17){
					var str_comfirm = "Win10 Edge 환경 결제 안내 \n\n Win10 Edge 환경에서는 결제가 원할 하지 않을 수 있습니다. \n\n"
						+ "결제를 이용하시려면 about:flags 창을 띄운 후 \n"
						+ "개발자 설정 > Microsoft 호환성 목록 사용 항목을 체크 해제로 \n"
						+ "설정하시면 결제를 진행하실 수 있습니다. \n\n"
						+ "해제를 설정하러 가시려면 '확인'을 \n"
						+ "결제를 진행하시려면 '취소'를 눌러주시기 바랍니다. \n\n";
					
					if(confirm(str_comfirm)){
						window.open("about:flags","optionWindow","width=500 , height=750");
						return;
					}
				}
			}
		}
		
		
		NicePayStd.setListener();
		
		
		if(payForm.TransType) {
			if(payForm.TransType.value == "1"){
				
				var tempPayMethod = payForm.PayMethod.value.split(",");
				var isEscrow = true;
				var possible = "CARD,BANK,VBANK,";
					
				for(var i=0; i<tempPayMethod.length; i++){
					if(tempPayMethod[i] == ""){
						isEscrow = false;
						break;
					}
					if(possible.indexOf(tempPayMethod[i]+",") < 0){
						isEscrow = false;
						break;
					}
				}
				
				if(!isEscrow){
					alert("에스크로 서비스는 신용카드,계좌이체,가상계좌이체만 가능합니다.");
					return;
				}
			}
		}
		
		var niceForm = payForm;
		if(payForm.encoding.indexOf("multipart") > -1){
			creatNiceFormInfo();
			niceForm = document.getElementsByName("nice_form")[0];
		}
		
		NicePayCommon.setFormData(niceForm, "VerifySType","S");
		
		// CHK: CITI, HANA/KEB
		var CHKWindowInfo = {
				"size": ['644','480'],
				"card_code" : ['11', '03', '16'],
				"call_type" : ""
		};
		
		//  Woori
		var WooriWindowInfo = {
				"size": ['644','510'],
				"card_code" : ['15'],
				"call_type" : ""
		};
		
		// LOTTE
		var LotteWindowInfo = {
				"size": ['644','489'],
				"card_code" : '08',
				"call_type" : ""
		};
		
		// KAKAOBANK
		var KakaoWindowInfo = {
				"size": ['500','456'],
				"card_code" : '37',
				"call_type" : ""
		};
		
		// KB
		var KBWindowInfo = {
				"size": ['459','456'],
				"card_code" : '02',
				"call_type" : ""
		};
		
		// SSG
		var SSGWindowInfo = {
				"size": ['0','0'],
				"card_code" : ['SSG', 'SSG_MONEY', 'SSGPAY_MONEY'],
				"call_type" : POPUP
		};		
		
		// Bankpay
		var BANKWindowInfo = {
				"size": ["0", "0"],
				"call_type" : POPUP
		};
		
		// KbLiiv
		var KbLiivBankWindowInfo = {
				"size": ["0", "0"],
				"call_type" : POPUP
		};
		
		// Cellphone
		var CELLPHONEWindowInfo = {
				"size": ["0", "0"],
				"call_type" : POPUP
		};
		
		// ETC
		var ETCWindowInfo = {
				"size": ["440", "456"],
				"call_type" : ""
		};
		
		//SamsungPay
		var SamsungPayWindowInfo = {
				"size": ["440", "630"],
				"call_type" : ""
		};
		
		//Payco
		var PaycoWindowInfo = {
				"size": ["0", "0"],
				"call_type" : POPUP
		};
		
		//KakaoPay
		var KakaoPayWindowInfo = {
				"size": ["0", "0"],
				"call_type" : POPUP
		};
		
		// Default
		var DefaultWindowInfo = {
				"size": ["660", "505"],
				"call_type" : ""
		};
		
		var DirectShowOpt	= payForm.DirectShowOpt;
		var TransType		= payForm.TransType;
		var SelectCardCode	= payForm.SelectCardCode;
		var PayMethod		= payForm.PayMethod;
		var NicepayReserved = payForm.NicepayReserved;
		var NpDirectEasyBank	= payForm.DirectEasyBank;
		var PayMethodValue	= "";
		
		var WindowWidth		= DefaultWindowInfo.size[0];
		var WindowHeight	= DefaultWindowInfo.size[1];
		var CallType		= DefaultWindowInfo.call_type;
		
		var ReqSubPath		= "/webstd/payment.jsp";
		var InterfacePath	= "/webstd/interfaceURL.jsp";
		
		var UnusedFlag		= true;	
		var EscrowFlag		= false;
		var DirectFlag		= false;
		var SSGFlag			= false;
		var CardFlag		= false;
		var SamsungpayFlag		= false;
		var PaycoFlag		= false;
		var KakaoPayFlag	= false;
		
		var KbLiivFlag		= false;
		
		// 에스크로 체크
		if(TransType) {
			if(TransType.value == "1") {
				EscrowFlag = true;
			}
		}

		// PayMethod 빈 값 체크
		if(PayMethod) {
			PayMethodValue = PayMethod.value;
			PayMethodArray = PayMethodValue.split(",");
			// 결제수단이 여러개일 경우 확인
			if(PayMethodArray.length > 1 || PayMethodValue == "") {
				PayMethodValue = "";
			}
		} else {
			PayMethodValue = "";
		}
		
		// DirectShowOpt 검증
		if(DirectShowOpt && !EscrowFlag && PayMethodValue != "") {
			var DirectShowArray = DirectShowOpt.value.split("|");
			// 최대 9개까지 처리하도록
			if(DirectShowArray.length > 0 && DirectShowArray.length < 10) {
				for(var i = 0; i < DirectShowArray.length; i++) {
					// 같을 경우
					if(DirectShowArray[i] == PayMethodValue) {
						if(PayMethodValue == "CARD" && SelectCardCode) {
							DirectFlag = true;
							CardFlag = true;
							break;
						} else if(PayMethodValue == "SSG_BANK"){
							SSGFlag = true;
							DirectFlag = true;
							if(CardFlag) {
								break;
							}
						} else {
							DirectFlag = true;
							break;
						}
					}
					
					if(DirectShowArray[i] == "GIFT_SSG" && PayMethodValue == "CARD" && SelectCardCode) {
						SSGFlag = true;
						DirectFlag = true;
						if(CardFlag) {
							break;
						}
					} 
				}
			} 
		}//end of if

		//NicepayReserved : SamsungPay Direct Show vertify
		if(NicepayReserved){
			var NiceReservedArr = NicepayReserved.value.split("|");
			if(NiceReservedArr.length >0){
				for(var i=0;i<NiceReservedArr.length; i++){
					var ReservedParamArr = NiceReservedArr[i].split("=");
					if(ReservedParamArr[0] == "DirectSamsungPay" && ReservedParamArr[1] == "Y"){
						SamsungpayFlag = true;
						break;
					}
					
					if(ReservedParamArr[0] == "DirectPayco" && ReservedParamArr[1] == "Y"){
						PaycoFlag = true;
						break;
					}
					
					if(ReservedParamArr[0] == "DirectKakao" && ReservedParamArr[1] == "Y"){
						KakaoPayFlag = true;
						break;
					}
				}
			}
		}
		
		if(DirectFlag) {
			if(PayMethodValue == "CARD") {
				if(CardFlag) {
					//CHK
					for(var i = 0; i < CHKWindowInfo.card_code.length; i++) {
						if(CHKWindowInfo.card_code[i] == SelectCardCode.value) {
							WindowWidth		= CHKWindowInfo.size[0];
							WindowHeight	= CHKWindowInfo.size[1];
							CallType		= CHKWindowInfo.call_type;
							UnusedFlag = false;
							break;
						}
					}
					//woori
					for(var i = 0; i < WooriWindowInfo.card_code.length; i++) {
						if(WooriWindowInfo.card_code[i] == SelectCardCode.value) {
							WindowWidth		= WooriWindowInfo.size[0];
							WindowHeight	= WooriWindowInfo.size[1];
							CallType		= WooriWindowInfo.call_type;
							UnusedFlag = false;
							break;
						}
					}
					
					//롯데
					if(UnusedFlag && SelectCardCode.value == LotteWindowInfo.card_code) {
						WindowWidth		= LotteWindowInfo.size[0];
						WindowHeight	= LotteWindowInfo.size[1];
						CallType		= LotteWindowInfo.call_type;
						UnusedFlag = false;
					}

					//KAKAO
					if(UnusedFlag && SelectCardCode.value == KakaoWindowInfo.card_code) {
						WindowWidth		= KakaoWindowInfo.size[0];
						WindowHeight	= KakaoWindowInfo.size[1];
						CallType		= KakaoWindowInfo.call_type;
						UnusedFlag = false;
					}

					//KB
					if(UnusedFlag && SelectCardCode.value == KBWindowInfo.card_code) {
						WindowWidth		= KBWindowInfo.size[0];
						WindowHeight	= KBWindowInfo.size[1];
						CallType		= KBWindowInfo.call_type;
						UnusedFlag = false;
					}
				}
				
				//SSG
				if(SSGFlag) {
					for(var i = 0; i < SSGWindowInfo.card_code.length; i++) {
						if(SSGWindowInfo.card_code[i] == SelectCardCode.value) {
							WindowWidth		= SSGWindowInfo.size[0];
							WindowHeight	= SSGWindowInfo.size[1];
							CallType		= SSGWindowInfo.call_type;
							UnusedFlag = false;
							break;
						}
					}
				}
				
				//SamsungPay
				if(SamsungpayFlag){
					WindowWidth		= SamsungPayWindowInfo.size[0];
					WindowHeight	= SamsungPayWindowInfo.size[1];
					CallType		= SamsungPayWindowInfo.call_type;
					UnusedFlag = false;
				}
				
				//Payco
				if(PaycoFlag){
					WindowWidth		= PaycoWindowInfo.size[0];
					WindowHeight	= PaycoWindowInfo.size[1];
					CallType		= PaycoWindowInfo.call_type;
					ReqSubPath = InterfacePath;
					UnusedFlag = false;
				}
				
				//KakaoPay
				if(KakaoPayFlag){
					WindowWidth		= KakaoPayWindowInfo.size[0];
					WindowHeight	= KakaoPayWindowInfo.size[1];
					CallType		= KakaoPayWindowInfo.call_type;
					ReqSubPath = InterfacePath;
					UnusedFlag = false;
				}
				
				//그 외
				if(UnusedFlag && CardFlag){
					WindowWidth		= ETCWindowInfo.size[0];
					WindowHeight	= ETCWindowInfo.size[1];
					CallType		= ETCWindowInfo.call_type;
					UnusedFlag = false;
				}
				
				if(!UnusedFlag) {
					ReqSubPath = InterfacePath;
				} else {
					DirectShowOpt.value = "";
				}
			} else if(PayMethodValue == "BANK") {
				UnusedFlag = false;
				
				//NpDirectEasyBank : easybank Direct Show verify
				if(NpDirectEasyBank && NpDirectEasyBank.value != ""){
					if(NpDirectEasyBank.value == "E019"){
						KbLiivFlag = true;
					}else{
						UnusedFlag = true;	
					}
				}
				
				if(!UnusedFlag) {
					WindowWidth		= BANKWindowInfo.size[0];
					WindowHeight	= BANKWindowInfo.size[1];
					CallType		= BANKWindowInfo.call_type;
					if(KbLiivFlag){
						WindowWidth		= KbLiivBankWindowInfo.size[0];
						WindowHeight	= KbLiivBankWindowInfo.size[1];
						CallType		= KbLiivBankWindowInfo.call_type;
					}
					ReqSubPath = InterfacePath;
				} else {
					DirectShowOpt.value = "";
				}
			} else if(PayMethodValue == "CELLPHONE") {
				WindowWidth		= CELLPHONEWindowInfo.size[0];
				WindowHeight	= CELLPHONEWindowInfo.size[1];
				CallType		= CELLPHONEWindowInfo.call_type;
				ReqSubPath = InterfacePath;
				UnusedFlag = false;
			} else if(PayMethodValue == "SSG_BANK") {
				//SSG
				if(SSGFlag) {
					WindowWidth		= SSGWindowInfo.size[0];
					WindowHeight	= SSGWindowInfo.size[1];
					CallType		= SSGWindowInfo.call_type;
					ReqSubPath = InterfacePath;
					UnusedFlag = false;
				}
			} else {
				// 카드, 계좌이체, 휴대폰을 제외한 결제수단은 일반 결제창 호출
				WindowWidth		= DefaultWindowInfo.size[0];
				WindowHeight	= DefaultWindowInfo.size[1];
				CallType		= DefaultWindowInfo.call_type;
				UnusedFlag = false;
			}
		} else {
			// 바로호출이 아닐 경우 초기화
			if(DirectShowOpt) {
				DirectShowOpt.value = "";
			}
		}//end of if-else
		
		// 창크기가 안 정해졌을 경우
		if(UnusedFlag) {
			// 디폴트
			WindowWidth		= DefaultWindowInfo.size[0];
			WindowHeight	= DefaultWindowInfo.size[1];
			CallType		= DefaultWindowInfo.call_type;
		}
		
		NicePayStd.creatLayer(WindowWidth, WindowHeight, CallType);
		niceForm.action = nicepayDomain+ReqSubPath;
		NicePayCommon.disableScroll();
		
		//페이지 레이어 설정
		existTarget = payForm.target;
		niceForm.target = 'nice_frame';
		
		NicePayCommon.setFormData(niceForm, "EncGoodsName", escape(niceForm.GoodsName.value));
		NicePayCommon.setFormData(niceForm, "EncBuyerName", escape(niceForm.BuyerName.value));
		NicePayCommon.setFormData(niceForm, "JsVer", "nicepay_tr_utf");
		NicePayCommon.setFormData(niceForm, "DeployedVer", "1.1.1");
		NicePayCommon.setFormData(niceForm, "DeployedDate", 190708);
		NicePayCommon.setFormData(niceForm, "DeployedFileName", "nicepay_tr_utf");
		
		niceForm.submit();	
	}catch(e){
		NicePayCommon.errorReport("goPayError", e.message, "");
		goPayFlex(payForm);
	}
};

function creatNiceFormInfo() {
	try {
		if(document.getElementById("nice_form")==null){
			var newForm = document.createElement('form');
			newForm.id = "nice_form";
			newForm.name = "nice_form";
			newForm.method = "post";
			document.body.appendChild(newForm);
		}
		
		var name;
		var value;
		var inputValue;
		var niceForm = document.getElementsByName("nice_form")[0];
				
		for(var i = 0 ; i < merchantForm.elements.length ; i++) {
			name = merchantForm.elements[i].name;
			value = merchantForm.elements[i].value;
			inputValue = "";
			if(name != '' && name != null) {
				if(merchantForm.elements[i].type=="radio"){
					if(merchantForm.elements[i].checked==true) inputValue = value;	
				}else if(merchantForm.elements[i].type=="checkbox"){
					if(merchantForm.elements[i].checked==true) inputValue = value;	
				}else{
					inputValue = value;
				}
				if(inputValue){
					if(!eval("niceForm."+name)){
						var newInput = document.createElement('input');
						newInput.name = name;
						newInput.id = name;
						newInput.type = "hidden";
						niceForm.appendChild(newInput);
					}
					eval("niceForm."+name).value = inputValue;
				}
			}
		}
		
	} catch(e) {

	}
}

function checkedButtonValue(objName) {
	var checkVal = '';
	var checkObj = document.getElementsByName(objName);
	
	if(checkObj != null) {	
		for(var i = 0; i < checkObj.length; i++) {
			if(checkObj[i].checked) {
				checkVal += checkObj[i].value+',';
			}
		}
	}
	
	if(checkVal.length > 1) checkVal = checkVal.substr(0,checkVal.length-1);
	return checkVal;
}

function deleteLayer(){
	NicePayStd.deleteLayer();
}

/////////////////////////////////////////////////////////////////////
// NicePay Common Function
/////////////////////////////////////////////////////////////////////

NicePayCommon.createDivElement = function(frameID, zindex){
	if(document.getElementById(frameID)==null){
		var newDiv = (hasFrame==false) ? document.createElement('div') : parent.document.createElement('div');
		
		newDiv.id = frameID;
		newDiv.style.position = "absolute";
		newDiv.style.zIndex = zindex;
		newDiv.style.clear = "both";
		newDiv.style.top = 0;
		newDiv.style.left = 0;
		documentBody.appendChild(newDiv);
	}
}

NicePayCommon.disableScroll = function(){
	if(disableScrollYN == "Y"){
		if( document.body  && document.body.scrollTop) {
		 	document.body.style.overflowX = ""; 
		} else if( document.documentElement ) {
			document.documentElement.style.overflowX  = ""; 
		}
		documentBody.style.overflow = "hidden"; 
	}else{
		if( document.body  && document.body.scrollTop) {
		 	document.body.style.overflowX = "hidden"; 
		} else if( document.documentElement ) {
			document.documentElement.style.overflowX  = "hidden"; 
		}
	} 
}
NicePayCommon.enableScroll = function(){
	if(disableScrollYN == "Y"){
		if( document.body && document.body.style.overflow) {
			document.body.style.overflowX  = ""; 
		} else if( document.documentElement && document.documentElement.style.overflow ) {
			document.documentElement.style.overflowX  = ""; 
		}
		documentBody.style.overflow  = "auto";
	}else{
		if( document.body && document.body.style.overflow) {
			document.body.style.overflowX  = "auto"; 
		} else if( document.documentElement && document.documentElement.style.overflow ) {
			document.documentElement.style.overflowX  = "auto"; 
		}
	}
}

NicePayCommon.setFormData = function(f, key, value){
	if(f[key]){
		f[key].value = value;
	}else{
		var input = document.createElement("input");
		input.type = "hidden";
		input.name = key;
		input.value =  value;
		f.appendChild(input);
	}
}

NicePayCommon.errorReport = function(errorCd, errorMsg, logOpt){
	try{
		var newForm = document.createElement('form');
		newForm.id = "error_report";
		newForm.name = "error_report";
		newForm.method = "post";
		newForm.target = "error_frame";
		newForm.action = nicepayDomain + "/common/errorReport.jsp";
		documentBody.appendChild(newForm);
		
		var newIframe = document.createElement('iframe');
		newIframe.id = "error_frame";
		newIframe.name = "error_frame";
		newIframe.width = "0px";
		newIframe.height = "0px";
		documentBody.appendChild(newIframe);
		
		var errorMsg = {
			"MID" : merchantForm.MID.value,
			"URL" : window.location.href,
			"ERR_CD" : errorCd,
			"ERR_MSG" : escape(errorMsg),
			"BuyerName" : escape(merchantForm.BuyerName.value),
			"PayMethod" : merchantForm.PayMethod.value,
			"Worker" : "WEBSTD",
			"Amt" : merchantForm.Amt.value,
			"LogOpt" : logOpt
		};
		
		for(var key in errorMsg){
			var newInput = document.createElement('input');
			newInput.name = key;
			newInput.id = key;
			newInput.value = errorMsg[key];
			newInput.type = "hidden";
			newForm.appendChild(newInput);
		}
		newForm.submit();
		
		setTimeout(function() {
			documentBody.removeChild(document.getElementById("error_report"));
			documentBody.removeChild(document.getElementById("error_frame"));
		}, 100);
	}catch(e){

	}
}

/////////////////////////////////////////////////////////////////////
// WEB STD Function
/////////////////////////////////////////////////////////////////////

NicePayStd.receiveMessageValue = function(e) {
	merchantForm.action = existSubmitUrl;
	merchantForm.target = existTarget;
	
	if (window.postMessage) {
		//var obj = JSON.parse(e.data);
		var obj = e.data;
		if (obj.code) {
			// obj.success is defined. We received the response via postMessage
			// as an object, and we are using a browser that supports
			// postMessage objects (not IE8/9).
			NicePayStd.resultMessage(obj);
		} else {
			// We received the response via postMessage as a string. This works
			// for all browsers that support postMessage, including IE8/9.
			var str = eval("(" + obj + ")");
			NicePayStd.resultMessage(str);
		}
	} else {
		//alert('postMessage not supported');
		NicePayStd.resultMessage({"code" : "1", "message" : "postMessage not supported"});
	}
}

NicePayStd.resultMessage = function(obj){
	switch(obj.code){
		case "0" :
			//success
			if(obj.result){
				if(obj.result.TrKey || obj.result.TrKey1){
					NicePayCommon.setFormData(merchantForm, "PayMethod", obj.result.PayMethod);
					NicePayCommon.setFormData(merchantForm, "AuthResultCode", "0000");
					NicePayCommon.setFormData(merchantForm, "AuthResultMsg", "인증 성공");
					if(obj.result.PayMethod == "MULTI"){
						NicePayCommon.setFormData(merchantForm, "MultiCnt", "2");
						NicePayCommon.setFormData(merchantForm, "TrKey1", obj.result.TrKey1);
						NicePayCommon.setFormData(merchantForm, "TrKey2", obj.result.TrKey2);
						NicePayCommon.setFormData(merchantForm, "TrKeyAmt1", obj.result.TrKeyAmt1);
						NicePayCommon.setFormData(merchantForm, "TrKeyAmt2", obj.result.TrKeyAmt2);
					}else{
						NicePayCommon.setFormData(merchantForm, "TrKey", obj.result.TrKey);
					}
					NicePayCommon.setFormData(merchantForm, "BuyerEmail", obj.result.BuyerEmail);
					NicePayCommon.setFormData(merchantForm, "TID", obj.result.TID);
					if(obj.result.TxTid){
						NicePayCommon.setFormData(merchantForm, "TxTid", obj.result.TxTid);
					}
					NicePayCommon.setFormData(merchantForm, "EncodeKey", obj.result.TID);
					if(obj.result.NpCardBin){
						NicePayCommon.setFormData(merchantForm, "NpCardBin", obj.result.NpCardBin);
					}

					NicePayCommon.setFormData(merchantForm, "EncGoodsName", "");
					NicePayCommon.setFormData(merchantForm, "EncBuyerName", "");
					
					if(obj.result.PayMethod == "VBANK" && obj.result.VbankAccountName){
						NicePayCommon.setFormData(merchantForm, "VbankAccountName", unescape(obj.result.VbankAccountName));
					}

					//AuthOnly 설정이 있으면
					if(obj.result.AuthOnly && obj.result.AuthType && obj.result.CardInfo){
						if(obj.result.AuthType == "02"){ //ISP
							NicePayCommon.setFormData(merchantForm, "KVP_CARDCODE", obj.result.CardInfo.KVP_CARDCODE);
							NicePayCommon.setFormData(merchantForm, "KVP_SESSIONKEY", obj.result.CardInfo.KVP_SESSIONKEY);
							NicePayCommon.setFormData(merchantForm, "KVP_ENCDATA", obj.result.CardInfo.KVP_ENCDATA);
							NicePayCommon.setFormData(merchantForm, "KVP_QUOTA", obj.result.CardInfo.KVP_QUOTA);
							NicePayCommon.setFormData(merchantForm, "KVP_CARD_PREFIX", obj.result.CardInfo.KVP_CARD_PREFIX);
							niceIspSubmit();
						}else{ //Visa3D
							NicePayCommon.setFormData(merchantForm, "cardno", obj.result.CardInfo.cardno);
							NicePayCommon.setFormData(merchantForm, "eci", obj.result.CardInfo.eci);
							NicePayCommon.setFormData(merchantForm, "xid", obj.result.CardInfo.xid);
							NicePayCommon.setFormData(merchantForm, "cavv", obj.result.CardInfo.cavv);
							niceVisaSubmit();
						}
					}else{
						nicepaySubmit();
					}
					NicePayStd.deletePayment();
				}
			}else{
				resultMessage({"code" : "1", "message" : "not result value"});
			}
			break;
		case "1" :
			//iframe 삭제
			NicePayStd.deleteLayer();
			//cancel
			try{
				nicepayClose();
			}catch(e){
			}
			break;
		case "2" :
			//iframe 삭제
			NicePayStd.deleteLayer();
			try{
				nicepayClose();
			}catch(e){
			}
			break;
		case "10" :
			var payLayer = (hasFrame == false) ? document.getElementById("nice_layer") : parent.document.getElementById("nice_layer");
			payLayer.style.width = obj.width + "px";
			break;
		default :
			//코드별 에러 처리
			//obj.code
			//obj.message
			break;
	}
}

//레이어생성
NicePayStd.creatLayer = function(w, h, opt){
	//************** 레이어 동적생성 *********************//
	NicePayCommon.createDivElement("nice_layer", npNiceLayerZIdx);
	NicePayCommon.createDivElement("bg_layer", npBgLayerZIdx);
	
	//iframe 동적 생성
	var html = "";
	html += "<div style=\"width:100%;text-align:center;padding:95px 0 0 0;\">";
	
	if(opt != POPUP) {
		html += "	<div><span style=\"color:#FFF;font-size:15px;\">Please, wait...</span></div>";
		html += "	<div style=\"position: relative;top: -180px;\"><img src=\""+nicepayDomain+"/webstd/images/loading.gif\" style=\"width: 344px;\"></div>";
	} else {
		html += "	<div style=\"position: relative;top: -400px;left:-200px;\"><img src=\""+nicepayDomain+"/webstd/images/loading.gif\" style=\"width: 344px;\"></div>";
	}
	html += "</div>";
	
	html += "<div id=\"payment_layer\" style=\"position: absolute; width: 100%; top: 0;\">";
	html += "	<iframe name=\"nice_frame\" id=\"nice_frame\" src=\"\" width=\"100%\" height=\""+h+"px\" scrolling=\"no\" frameborder=\"no\"></iframe>";
	html += "</div>";
	
	var payLayer = (hasFrame == false) ? document.getElementById("nice_layer") : parent.document.getElementById("nice_layer");
	var bgLayer = (hasFrame == false) ? document.getElementById("bg_layer") : parent.document.getElementById("bg_layer");
	
	payLayer.innerHTML = html;
	if(payLayer!=null){
		payLayer.style.top = (NicePayStd.getWindowHeight() - h) / 2 + NicePayStd.getYposition() + "px";
		payLayer.style.left = (NicePayStd.getWindowWidth() - w) / 2 + NicePayStd.getXposition() + "px";
	}
	
	payLayer.style.width = w + "px";
	payLayer.style.height = h + "px";
	
	bgLayer.style.width = "100%";
	bgLayer.style.height = documentBody.scrollHeight +"px";
	bgLayer.style.background = "#4c4c4c";

	var opacity = 65;
	if(merchantForm.Opacity && merchantForm.Opacity.value != ""){
		opacity = merchantForm.Opacity.value;
	}
	bgLayer.style.filter="alpha(opacity="+opacity+")";
	bgLayer.style.opacity = opacity/100;
	
	try{
		if(merchantForm.OptionList!=null && merchantForm.OptionList!="undefined"){
		var optionVal = merchantForm.OptionList.value;
			if(optionVal.indexOf("hidden")!=-1){
				nice_layer.style.filter="alpha(opacity=0)";
				bgLayer.style.filter="alpha(opacity=0)";
			}
		}
	}catch(e){

	}
}

//레이어 동적생성삭제
NicePayStd.deleteLayer = function(){
	NicePayCommon.enableScroll();
	
	if(hasFrame){
		documentBody.removeChild(parent.document.getElementById("nice_layer"));
		documentBody.removeChild(parent.document.getElementById("bg_layer"));
	}else{
		documentBody.removeChild(document.getElementById("nice_layer"));
		documentBody.removeChild(document.getElementById("bg_layer"));
	}
	NicePayStd.removeListener();
}

NicePayStd.deletePayment = function(){
	var nicelayer = (hasFrame==false) ? document.getElementById("nice_layer") : parent.document.getElementById("nice_layer");
	if(hasFrame){
		nicelayer.removeChild(parent.document.getElementById("payment_layer"));
	}else{
		nicelayer.removeChild(document.getElementById("payment_layer"));
	}
	NicePayStd.removeListener();
}

NicePayStd.getYposition = function(){
	  var scrollY = 0;
	  if(hasFrame){
		  if( typeof( parent.window.pageYOffset ) == 'number' ) {
			  scrollY = parent.window.pageYOffset;
		  } else if( parent.document.body && ( parent.document.body.scrollTop ) ) {
			  scrollY =  parent.document.body.scrollTop;
		  } else if( parent.document.documentElement && ( parent.document.documentElement.scrollTop ) ) {
			  scrollY =  parent.document.documentElement.scrollTop;
		  }
	  }else{
		  if( typeof( window.pageYOffset ) == 'number' ) {
			  scrollY = window.pageYOffset;
		  } else if( document.body && ( document.body.scrollTop ) ) {
			  scrollY = (hasFrame==false) ?  document.body.scrollTop : parent.document.body.scrollTop;
		  } else if( document.documentElement && ( document.documentElement.scrollTop ) ) {
			  scrollY = (hasFrame==false) ? document.documentElement.scrollTop : parent.document.documentElement.scrollTop;
		  }
	  }
  
	  return scrollY ;
}

NicePayStd.getXposition = function(){
	var scrollX = 0;
	if(hasFrame){
		if( typeof( parent.window.pageXOffset ) == 'number' ) {
			scrollX = parent.window.pageXOffset;
		} else if( parent.document.body && ( parent.document.body.scrollLeft ) ) {
			scrollX =  parent.document.body.scrollLeft;
		} else if( parent.document.documentElement && ( parent.document.documentElement.scrollLeft ) ) {
			scrollX =  parent.document.documentElement.scrollLeft;
		}
	}else{
		if( typeof( window.pageXOffset ) == 'number' ) {
			scrollX = window.pageXOffset;
		} else if( document.body && ( document.body.scrollLeft ) ) {
			scrollX = (hasFrame==false) ?  document.body.scrollLeft : parent.document.body.scrollLeft;
		} else if( document.documentElement && ( document.documentElement.scrollLeft ) ) {
			scrollX = (hasFrame==false) ? document.documentElement.scrollLeft : parent.document.documentElement.scrollLeft;
		}
	}
	return scrollX ;
}

NicePayStd.getWindowHeight = function() {
	  var myHeight = 0;
	  if(hasFrame){
		  if( typeof( parent.window.innerWidth ) == 'number' ) {
			  //Non-IE
			  myHeight = parent.window.innerHeight;
		  } else if( parent.document.documentElement && parent.document.documentElement.clientHeight ) {
			  //IE 6+ in 'standards compliant mode'
			  myHeight = parent.document.documentElement.clientHeight;
		  } else if( parent.document.body && parent.document.body.clientHeight ) {
			  //IE 4 compatible
			  myHeight = parent.document.body.clientHeight;
		  }
	  }else{
		  if( typeof( window.innerWidth ) == 'number' ) {
			  //Non-IE
			  myHeight = window.innerHeight;
		  } else if( document.documentElement && document.documentElement.clientHeight ) {
			  //IE 6+ in 'standards compliant mode'
			  myHeight = document.documentElement.clientHeight;
		  } else if( document.body && document.body.clientHeight ) {
			  //IE 4 compatible
			  myHeight = document.body.clientHeight;
		  }
	  }
	  return myHeight;
}

NicePayStd.getWindowWidth = function() {
	var myWidth = 0;
	if(hasFrame){
		if( typeof( parent.window.innerWidth ) == 'number' ) {
			//Non-IE
			myWidth = parent.window.innerWidth;
		} else if( parent.document.documentElement && parent.document.documentElement.clientWidth ) {
			//IE 6+ in 'standards compliant mode'
			myWidth = parent.document.documentElement.clientWidth;
		} else if( parent.document.body && parent.document.body.clientWidth ) {
			//IE 4 compatible
			myWidth = parent.document.body.clientWidth;
		}
	}else{
		if( typeof( window.innerWidth ) == 'number' ) {
			//Non-IE
			myWidth = window.innerWidth;
		} else if( document.documentElement && document.documentElement.clientWidth ) {
			//IE 6+ in 'standards compliant mode'
			myWidth = document.documentElement.clientWidth;
		} else if( document.body && document.body.clientWidth ) {
			//IE 4 compatible
			myWidth = document.body.clientWidth;
		}
	}
	return myWidth;
}

NicePayStd.niceLayerHandler = function(){
	try{
		var nicelayer = (hasFrame==false) ? document.getElementById("nice_layer") : parent.document.getElementById("nice_layer");
		if(nicelayer!=null){
			nicelayer.style.top = (NicePayStd.getWindowHeight() - nicelayer.style.height.replace("px",""))/2 + NicePayStd.getYposition() +"px";
			nicelayer.style.left = (NicePayStd.getWindowWidth() - nicelayer.style.width.replace("px",""))/2 + NicePayStd.getXposition() +"px";
		}
	}catch(e){

	}
}

NicePayStd.setListener = function(){
	if(hasFrame){
		if (parent.window.addEventListener) {  // all browsers except IE before version 9
			parent.window.addEventListener("message", NicePayStd.receiveMessageValue, false);
		} else {
			if (parent.window.attachEvent) {   // IE before version 9
				parent.window.attachEvent("onmessage", NicePayStd.receiveMessageValue);     // Internet Explorer from version 8
			}
		}
		if(typeof parent.window.addEventListener != "undefined")	parent.window.addEventListener("resize",NicePayStd.niceLayerHandler, false);
		if(typeof parent.window.attachEvent != "undefined" )	parent.window.attachEvent("onresize",NicePayStd.niceLayerHandler);
		
		if(typeof parent.window.addEventListener != "undefined")	parent.window.addEventListener("scroll",NicePayStd.niceLayerHandler, false);
		if(typeof parent.window.attachEvent != "undefined" )	parent.window.attachEvent("onscroll",NicePayStd.niceLayerHandler);
	}else{
		if (window.addEventListener) {  // all browsers except IE before version 9
			window.addEventListener("message", NicePayStd.receiveMessageValue, false);
		} else {
			if (window.attachEvent) {   // IE before version 9
				window.attachEvent("onmessage", NicePayStd.receiveMessageValue);     // Internet Explorer from version 8
			}
		}
		if(typeof window.addEventListener != "undefined")	window.addEventListener("resize",NicePayStd.niceLayerHandler, false);
		if(typeof window.attachEvent != "undefined" )	window.attachEvent("onresize",NicePayStd.niceLayerHandler);
		
		if(typeof window.addEventListener != "undefined")	window.addEventListener("scroll",NicePayStd.niceLayerHandler, false);
		if(typeof window.attachEvent != "undefined" )	window.attachEvent("onscroll",NicePayStd.niceLayerHandler);
	}
}

NicePayStd.removeListener = function(){
	try{
		if(hasFrame){
			if (parent.window.addEventListener) {  // all browsers except IE before version 9
				parent.window.removeEventListener("message", NicePayStd.receiveMessageValue, false);
			} else {
				if (parent.window.attachEvent) {   // IE before version 9
					parent.window.detachEvent("onmessage", NicePayStd.receiveMessageValue);     // Internet Explorer from version 8
				}
			}
			if(typeof parent.window.addEventListener != "undefined")	parent.window.removeEventListener("resize",NicePayStd.niceLayerHandler, false);
			if(typeof parent.window.attachEvent != "undefined" )	parent.window.detachEvent("onresize",NicePayStd.niceLayerHandler);
			
			if(typeof parent.window.addEventListener != "undefined")	parent.window.removeEventListener("scroll",NicePayStd.niceLayerHandler, false);
			if(typeof parent.window.attachEvent != "undefined" )	parent.window.detachEvent("onscroll",NicePayStd.niceLayerHandler);
		}else{
			if (window.addEventListener) {  // all browsers except IE before version 9
				window.removeEventListener("message", NicePayStd.receiveMessageValue, false);
			} else {
				if (window.attachEvent) {   // IE before version 9
					window.detachEvent("onmessage", NicePayStd.receiveMessageValue);     // Internet Explorer from version 8
				}
			}
			if(typeof window.addEventListener != "undefined")	window.removeEventListener("resize",NicePayStd.niceLayerHandler, false);
			if(typeof window.attachEvent != "undefined" )	window.detachEvent("onresize",NicePayStd.niceLayerHandler);
			
			if(typeof window.addEventListener != "undefined")	window.removeEventListener("scroll",NicePayStd.niceLayerHandler, false);
			if(typeof window.attachEvent != "undefined" )	window.detachEvent("onscroll",NicePayStd.niceLayerHandler);
		}
	}catch(e){}
}

NicePayStd.uaMatch = function(ua) {
	// If an UA is not provided, default to the current browser UA.
	if (ua === undefined) {
		ua = window.navigator.userAgent;
	}
	ua = ua.toLowerCase();

	var match = /(edge)\/([\w.]+)/.exec(ua)
			|| /(opr)[\/]([\w.]+)/.exec(ua)
			|| /(chrome)[ \/]([\w.]+)/.exec(ua)
			|| /(iemobile)[\/]([\w.]+)/.exec(ua)
			|| /(version)(applewebkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua)
			|| /(webkit)[ \/]([\w.]+).*(version)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) 
			|| /(webkit)[ \/]([\w.]+)/.exec(ua)
			|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
			|| /(msie) ([\w.]+)/.exec(ua)
			|| ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec(ua)
			|| ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)
			|| [];

	var platform_match = /(ipad)/.exec(ua) || /(ipod)/.exec(ua)
			|| /(windows phone)/.exec(ua) || /(iphone)/.exec(ua)
			|| /(kindle)/.exec(ua) || /(silk)/.exec(ua)
			|| /(android)/.exec(ua) || /(win)/.exec(ua)
			|| /(mac)/.exec(ua) || /(linux)/.exec(ua)
			|| /(cros)/.exec(ua) || /(playbook)/.exec(ua)
			|| /(bb)/.exec(ua) || /(blackberry)/.exec(ua) 
			|| [];

	var browser = {}, matched = {
		browser : match[5] || match[3] || match[1] || "",
		version : match[2] || match[4] || "0",
		versionNumber : match[4] || match[2] || "0",
		platform : platform_match[0] || ""
	};

	if (matched.browser) {
		browser[matched.browser] = true;
		browser.version = matched.version;
		browser.versionNumber = parseInt(matched.versionNumber, 10);
	}

	if (matched.platform) {
		browser[matched.platform] = true;
	}

	// These are all considered mobile platforms, meaning they run a
	// mobile browser
	if (browser.android || browser.bb || browser.blackberry
			|| browser.ipad || browser.iphone || browser.ipod
			|| browser.kindle || browser.playbook || browser.silk
			|| browser["windows phone"]) {
		browser.mobile = true;
	}

	// These are all considered desktop platforms, meaning they run
	// a desktop browser
	if (browser.cros || browser.mac || browser.linux || browser.win) {
		browser.desktop = true;
	}

	// Chrome, Opera 15+ and Safari are webkit based browsers
	if (browser.chrome || browser.opr || browser.safari) {
		browser.webkit = true;
	}

	// IE11 has a new token so we will assign it msie to avoid
	// breaking changes
	if (browser.rv || browser.iemobile) {
		var ie = "msie";

		matched.browser = ie;
		browser[ie] = true;
	}

	// Edge is officially known as Microsoft Edge, so rewrite the
	// key to match
	if (browser.edge) {
		delete browser.edge;
		var msedge = "msedge";

		matched.browser = msedge;
		browser[msedge] = true;
	}

	// Blackberry browsers are marked as Safari on BlackBerry
	if (browser.safari && browser.blackberry) {
		var blackberry = "blackberry";

		matched.browser = blackberry;
		browser[blackberry] = true;
	}

	// Playbook browsers are marked as Safari on Playbook
	if (browser.safari && browser.playbook) {
		var playbook = "playbook";

		matched.browser = playbook;
		browser[playbook] = true;
	}

	// BB10 is a newer OS version of BlackBerry
	if (browser.bb) {
		var bb = "blackberry";

		matched.browser = bb;
		browser[bb] = true;
	}

	// Opera 15+ are identified as opr
	if (browser.opr) {
		var opera = "opera";

		matched.browser = opera;
		browser[opera] = true;
	}

	// Stock Android browsers are marked as Safari on Android.
	if (browser.safari && browser.android) {
		var android = "android";

		matched.browser = android;
		browser[android] = true;
	}

	// Kindle browsers are marked as Safari on Kindle
	if (browser.safari && browser.kindle) {
		var kindle = "kindle";

		matched.browser = kindle;
		browser[kindle] = true;
	}

	// Kindle Silk browsers are marked as Safari on Kindle
	if (browser.safari && browser.silk) {
		var silk = "silk";

		matched.browser = silk;
		browser[silk] = true;
	}

	// Assign the name and platform variable
	browser.name = matched.browser;
	browser.platform = matched.platform;

	return browser;
}

/////////////////////////////////////////////////////////
// Flex Function
/////////////////////////////////////////////////////////
function goPayFlex(form) {
	try{
		formName = form.name;
		if(form.TransType) {
			form.PayMethod.value = checkTransType(form.PayMethod.value, form.TransType.value);
			if(form.PayMethod.value == "-1"){
				return;
			}
		}
	
		var niceCleintVer = checkClient(form);
		if(niceCleintVer=="Win"){
			NicePayCommon.setFormData(form, "JsVer", "nicepay_tr_utf");
			// div create
			NicePayCommon.createDivElement("nice_layer", npNiceLayerZIdx);
			NicePayCommon.createDivElement("bg_layer", npBgLayerZIdx);
			NicePayCommon.createDivElement("popup_layer", npPopupLayerZIdx);
			document.getElementById("popup_layer").innerHTML = "<iframe id='nice_frame' name='nice_frame' frameborder='0'></iframe>";
			if(form.PayMethod.value == '') form.PayMethod.value = 'CARD,BANK,VBANK,CELLPHONE,CPBILL';
			setNiceFrameDefine();
			
			var browser = NicePayStd.uaMatch(nAgt);
			if(browser.msie && browser.version < 9){
				//IE && 8.0 미만
				//window.open(nicepayDomain + "/webstd/template/flex_banner.jsp", "flex_banner_popup", "width=350, height=430, location=no, menubar=no, status=no, toolbar=no, resizable=no, fullscreen=no, scrollbars=no");
				alert("사용하시는 브라우저는 MicroSoft사의 보안지원이 종료된 버전입니다. \n 안전한 결제를 위해 Internet Explorer 9.0 이상 또는 크롬 등의 다른 브라우저 사용 요청 드립니다.");
				NicePayStd.deleteLayer();	// 레이어 제거
				return;
			} else {
				//multipart 및 스크립트 오류시 플래시 진행
				CallNicePayFlex(form);
			}
			
			NicePayCommon.disableScroll();
		}else if(niceCleintVer == "Mobile"){
			startNiceSmartPay(form);
		}
	}catch(e){
		NicePayCommon.errorReport("goPayFlex", e.message, "");
	}
}

function startNiceSmartPay(form){
	if(merchantActionURL==""){
		merchantActionURL  = new String(form.action);
	}
	NicePayCommon.setFormData(form, "ReturnURL", merchantActionURL);
	
	form.target = "_blank";
	form.method = "post";
	form.action = "https://web.nicepay.co.kr/smart/paySmart.jsp";
	form.submit();
}

function checkClient(recvForm){
	try{
		var tempAgent = navigator.userAgent.toLowerCase();
		if((tempAgent.match(/iphone/i)) || (tempAgent.match(/ipad/i)) || (tempAgent.match(/android/i))){
			
			try{
				var param = "MID="+recvForm.MID.value+"&PayMethod="+recvForm.PayMethod.value;
				//sendAjaxHttp("http://web.nicepay.co.kr/flex/getUserInfo.jsp",param,"GET");
			}catch(e){

			}
			
			//mobile
			if(recvForm.TransType.value=="1"){
				alert("에스크로는 스마트폰에서 결제가 지원되지 않는 가맹점 또는 환경입니다.\n\nPC에서 결제하여 주십시요.");
				return "False";
			}else{ 
				if(recvForm.PayMethod.value=="VBANK" || recvForm.PayMethod.value=="CELLPHONE" || recvForm.PayMethod.value=="BANK"){
					return "Mobile";
				}else{
					alert("타 결제수단을 이용하여 주시거나 PC에서 결제하여 주십시요.");
					return "False";
				}
			}
		}
	}catch(e){
		return "Win";
	}
	return "Win";
}

function checkTransType(method, type) {
	var i = method.lastIndexOf("CELLPHONE");
	var j = method.lastIndexOf("CPBILL");
	var check = 0;
	if(type == "1"){
		if(i != -1 || j != -1 || method == ''){
			alert("에스크로 서비스는 신용카드,계좌이체,가상계좌이체만 가능합니다.");
			return check = -1;
		}
	}else if(type == "0"){	
		if(method == '') method = 'CARD,BANK,VBANK,CELLPHONE,CPBILL';
	}
	
	return method;
}

function MnGetFormInfo(formNm) {
	var payInfo = new Object();
	try {
		var name;
		var value;
		var forms = document.getElementsByName(formNm);
		var retForm = forms[0];
				
		for(var i = 0 ; i < merchantForm.elements.length ; i++) {
			name = merchantForm.elements[i].name;
			value = merchantForm.elements[i].value;
			if(name != '' && name != null) {
				if(merchantForm.elements[i].type=="radio"){
					if(merchantForm.elements[i].checked==true) payInfo[name] = value;	
				}else if(merchantForm.elements[i].type=="checkbox"){
					if(merchantForm.elements[i].checked==true) payInfo[name] = value;	
				}else{
					payInfo[name] = value;
				}
			}
		}
		
		//payInfo.secure = "true";
		payInfo.UseTrKey = "true";
		payInfo.action = merchantForm.action;
		return payInfo;
	} catch(e) {
		return null;
	}
}

function MnGetFormInfo2(formNm) {
	var payInfo = new Object();
	try {
		var name;
		var value;
		var retStr;
				
		for(var i = 0 ; i < merchantForm.elements.length ; i++) {
			name = merchantForm.elements[i].name;
			value = merchantForm.elements[i].value;
			
			if(name != '' && name != null) {
				
				if(merchantForm.elements[i].type=="radio"){
					if(merchantForm.elements[i].checked==true) retStr+="`"+name+"="+value;	
				}else if(merchantForm.elements[i].type=="checkbox"){
					if(merchantForm.elements[i].checked==true) retStr+="`"+name+"="+value;	
				}else {
					if(name=="BuyerName" || name=="BuyerAddr" || name=="GoodsName" ){
						retStr+="`"+name+"="+escape(value);	
					}else{
						retStr+="`"+name+"="+escape(value);	
					}
				}
			}
		}
		
		retStr+="`UseTrKey=true";
		retStr+="`action="+merchantForm.action;	
		return retStr;
	} catch(e) {
		return null;
	}
}

function setNiceFrameDefine(){
	//width:150px;height:150px
	var nice_frame = document.getElementById("nice_frame");
	var frame_layer = document.getElementById("popup_layer");
	nice_frame.style.width  = '150px'
	nice_frame.style.height = '150px'
	frame_layer.style.top = NiceUtil.height(document)/2+"px";
	frame_layer.style.left = NiceUtil.width(document)/2+"px";

	var payLayer = document.getElementById("nice_layer");
	var bgLayer = document.getElementById("bg_layer");
	var noticeLayer = document.getElementById("notice_layer");

	var xposition  = NiceUtil.getXposition();
	var yposition  = NiceUtil.getYposition();

	payLayer.style.width = "100%";
	payLayer.style.height = "520px";
	
	bgLayer.style.width = "100%";
	bgLayer.style.height = NiceUtil.height(document)+"px";
	bgLayer.style.background = "#4c4c4c";
	var opacity = 65;
	if(merchantForm.Opacity && merchantForm.Opacity.value != ""){
		opacity = merchantForm.Opacity.value;
	}
	bgLayer.style.filter="alpha(opacity="+opacity+")";
	bgLayer.style.opacity = opacity/100;
		
	if(payLayer!=null)	payLayer.style.top = (NiceUtil.getWindowHeight() - 520)/2 +yposition+"px" ;
	
	try{
		if(merchantForm.OptionList!=null && merchantForm.OptionList!="undefined"){
		var optionVal = merchantForm.OptionList.value;
			if(optionVal.indexOf("hidden")!=-1){
				noticeLayer.style.filter="alpha(opacity=0)";
				bgLayer.style.filter="alpha(opacity=0)";
				noticeLayer.style.width = "0px";
				noticeLayer.style.height = "0px"
				isHiddenNicePay  = true;
			}else{
				if(noticeLayer!=null){
					noticeLayer.style.top =  (NiceUtil.getWindowHeight() - 490)/2 +yposition+"px" ;
					noticeLayer.style.left =  (NiceUtil.getWindowWidth() - 490)/2 +xposition+"px" ;
					noticeLayer.style.width = "490px";
					noticeLayer.style.height = "490px";
					noticeLayer.style.background = "#c0e2ea";
				}

			}
		}
	}catch(e){
		if(noticeLayer!=null){
				noticeLayer.style.top =  (NiceUtil.getWindowHeight() - 490)/2 +yposition+"px" ;
				noticeLayer.style.left =  (NiceUtil.getWindowWidth() - 490)/2 +xposition+"px" ;
				noticeLayer.style.width = "490px";
				noticeLayer.style.height = "490px";
				noticeLayer.style.background = "#c0e2ea";
			}
	}

}

function GetNiceFormInfo(formNm) {
	var payInfo = new Object();
	try {
		var name;
		var value;
		var forms = document.getElementsByName(formNm);
		var retForm = forms[0];
				
		for(var i = 0 ; i < merchantForm.elements.length ; i++) {
			name = merchantForm.elements[i].name;
			value = merchantForm.elements[i].value;
			if(name != '' && name != null) {
				if(merchantForm.elements[i].type=="radio"){
					if(merchantForm.elements[i].checked==true) payInfo[name] = value;	
				}else if(merchantForm.elements[i].type=="checkbox"){
					if(merchantForm.elements[i].checked==true) payInfo[name] = value;	
				}else{
					payInfo[name] = value;
				}
			}
		}
		
		//payInfo.secure = "true";
		payInfo.UseTrKey = "true";
		payInfo.action = merchantForm.action;
		thisMovie("MnbankFlex").niceSendForm(payInfo);
	} catch(e) {
		//return null;
	}
}

function loadFlash(divID)
{
	var requiredMajorVersion = 9;
	var requiredMinorVersion = 0;
	var requiredRevision = 28;
	var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
	
	var d = document.getElementById(divID);
	var inObj  = "";
	var currentDate = new Date();
	var file_name = fileUrl+"Plugin.swf";
	
	if (ieVerOffset!=-1 || nAgt.indexOf("Trident")!=-1 || hasRequestedVersion) {
	
	inObj = "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'codebase='https://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0 onerror=OnErr()'";
	inObj += "width='100%' height='100%' id='MnbankFlex' align=\"middle\">";
	inObj += "<param name='movie' value=\'"+file_name+"'  /><param name=\"quality\" value=\"high\" />";
	inObj += "<param name='bgcolor' value='#4c4c4c' /><param name='allowScriptAccess' value='always' />";
	inObj += "<param name='FlashVars' value='FormID="+formName+"&FileURL="+fileUrl+"&client="+client+"&PayMethod="+payMethod+"'/>";
	inObj += "<param name='wmode' value='transparent' /><embed src=\'"+file_name+"' ";
	inObj += "quality=\"high\" bgcolor='#ffffff' width='100%' height='100%'";
	inObj += "name='MnbankFlex' align='middle' wmode ='transparent'  SWLIVECONNECT='true' allowScriptAccess='always' FlashVars='FormID="+formName+"&client="+client+"&FileURL="+fileUrl+"&PayMethod="+payMethod+"' ";
	inObj += "type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" /></object>";
	
	//thisMovie("MnbankFlex").focus();

  } else {  
		d.style.width = 0;
		d.innerHTML = "";
		var installmsg  = "NicePay 결제를 하기 위해서 Flash player 9 이상의 환경이 필요합니다. Flash Player를 설치 하시겠습니까?\n\n";
		installmsg = installmsg + "[확인] 을 누르시면 설치페이지로 이동합니다.\n";
		if (confirm( installmsg )){
			window.top.document.location.href = "http://www.macromedia.com/go/getflashplayer"; 
		}else{
			var info    = "Flash player를 설치안함을 선택하였습니다.\n\n";
			info = info + "Flash player가 지원되는 환경인지 확인하여 주십시요.\n";
			alert(info);
			MnCloseFlex("N");
		}
	}
	d.innerHTML = inObj;
}

function thisMovie(movieName)
{
    if (navigator.appName.indexOf("Microsoft") != -1) {
		if(client=="IE10") return document[movieName];
        return window[movieName]; 
    } else {
        return document[movieName];
    }
}

function CallNicePayFlex(form) {
	if(callflash == 0) {
		
		payMethod = form.PayMethod.value;

		// load swf
		loadFlash("nice_layer");
		callflash = 1;
    }
}

//-------------------------------------------
//MnbankFlex Control Close
//-------------------------------------------
function MnCloseFlex(arg) {
	callflash = 0;
	NicePayCommon.enableScroll();
	 
	var MnbankLayer = document.getElementById("nice_layer");
	MnbankLayer.style.width = 0;
	MnbankLayer.style.height = 0;
	MnbankLayer.innerHTML = "";

	var noticeLayer = document.getElementById("notice_layer");
	if(noticeLayer!=null){
	noticeLayer.style.width = 0;
	noticeLayer.style.height = 0;
	noticeLayer.innerHTML = "";
	}
	
	var bgLayer = document.getElementById("bg_layer");
	bgLayer.style.width = 0;
	bgLayer.style.height = 0;
	bgLayer.innerHTML = "";
	
	var popUplayer = document.getElementById("popup_layer");
	popUplayer.innerHTML = "";

	try{nicepayClose();}catch(e){}
	
	if(arg == 'Y') {
		window.opener = "nothing";
		window.open('', '_parent', '');
		window.close();
	}
}

function nicepayEnd()
{
	callflash = 0;
	NicePayCommon.enableScroll(); 
	var MnbankLayer = document.getElementById("nice_layer");
	MnbankLayer.style.width = 0;
	MnbankLayer.style.height = 0;
	MnbankLayer.innerHTML = "";

	var noticeLayer = document.getElementById("notice_layer");
	if(noticeLayer!=null){
	noticeLayer.style.width = 0;
	noticeLayer.style.height = 0;
	noticeLayer.innerHTML = "";
	}
	var bgLayer = document.getElementById("bg_layer");
	bgLayer.style.width = 0;
	bgLayer.style.height = 0;
	bgLayer.innerHTML = "";
	
	var popUplayer = document.getElementById("popup_layer");
	popUplayer.innerHTML = "";
}

function moveIFrame(x,y,w,h) {
	var frameRef=document.getElementById("popup_layer");
	frameRef.style.left=x;
	frameRef.style.top=y;
	var iFrameRef=document.getElementById("nice_frame"); 
	iFrameRef.width=w;
	iFrameRef.height=h;
}

function hideIFrame(){
	document.getElementById("popup_layer").style.visibility="hidden";
}
 
function showIFrame(){
	document.getElementById("popup_layer").style.visibility="visible";
}
function loadIFrame(url){
	document.getElementById("nice_frame").src = url;
}
function setFormValue(name,param){
	try{
		checkForm(name,param);
	}catch(e){
		//alert(e);
	}
	try{
		merchantForm[name].value = param;
	}catch(e){
		//alert(e);
	}
}

function checkForm(node,value){
	
	var exist = merchantForm[node];
	if(exist!=undefined){
	}else{
		//var generateInput = "<input name=\""+node+"\"/>";
		//var field = document.createElement(generateInput);
		//field.setAttribute("type","hidden");
		//field.setAttribute("value",value);
		var field = document.createElement("input");
		field.setAttribute("name",node);
		field.setAttribute("id",node);
		field.setAttribute("type","hidden");
		field.setAttribute("value",value);
		merchantForm.appendChild(field);
	}
}


function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
