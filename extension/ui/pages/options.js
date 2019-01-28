//Global variables have to be unique across ALL chrome extensions that could be
// loaded on a clients machine if the variables are used in messaging or storage
var incontextqa_options = {
	//local storage key
	storageKey: 'incontextqa_jenkinsoptions_storage',

	//Json keys in storage
	jenkinsUrlKey: 'incontextqa_jenkinsurl_key',
	usernameKey: 'incontextqa_username_key',
	apiTokenKey: 'incontextqa_apitoken_key',
    emailKey: 'incontextqa_emailtoken_key',

	//html input id
	jenkinsUrlInputId: 'jenkinsUrlInput',
	userNameInputId: 'userNameInput',
	apiTokenInputId: 'apiTokenInput',
    emailInputId: 'emailInput',
	emailIconId: 'emailIcon',


	//html label id
	jenkinsUrlLabelId: 'jenkinsUrlLabel',
	userNameLabelId: 'userNameLabel',
	apiTokenLabelId: 'apiTokenLabel',
    emailLabelId: 'emailLabel',
	authenicateBtnId: 'authenicateBtn',
	labelStatus: 'status',
	emailInvalid: 'invalidEmail',
	labelStyle: 'form-label col-sm-2',
	labelStyleError: 'form-label col-sm-2 error',
	labelStyleHidden: 'form-label col-sm-2 hidden',

	//messaging
	checkCredentialsMsg: 'incontextqa_checkcredentials_msgtype',
	jenkinsInvalidUrl: 'invalidURL'

}
function enable_button() {
	var url = getTextBoxValue(incontextqa_options.jenkinsUrlInputId);
	var username = getTextBoxValue(incontextqa_options.userNameInputId);
	var apitoken = getTextBoxValue(incontextqa_options.apiTokenInputId);
	var email = getTextBoxValue(incontextqa_options.emailInputId);

	var isDisabled = true;
	if ((url != undefined) && (url.trim().length > 0)
		&& (apitoken != undefined) && (apitoken.trim().length > 0)
		&& (email != undefined) && (email.trim().length > 0)) {
			isDisabled = false;
	}

	document.getElementById(incontextqa_options.authenicateBtnId).disabled = isDisabled;

	return !isDisabled;
}


function retrieve_storage_info() {
	chrome.storage.local.get(incontextqa_options.storageKey, function(result){
		var storageObj = {};

		//use '!=' rather than '!==' in order to catch a null value
		if ((result != undefined) &&
			(Object.keys(result).length > 0 && result.constructor == Object)) {
			console.log("There are keys in incontextqa_options.storage");
			storageObj= result[incontextqa_options.storageKey];

			if (storageObj != undefined) {
				var jsonObj = JSON.parse(storageObj);

				var url = jsonObj[incontextqa_options.jenkinsUrlKey];
				var username = jsonObj[incontextqa_options.usernameKey];
				var apitoken = jsonObj[incontextqa_options.apiTokenKey];
				var email = jsonObj[incontextqa_options.emailKey];

				if (url != undefined) {
					console.log("Set url");
					setTextBoxValue(incontextqa_options.jenkinsUrlInputId, url);
				}

				if (username != undefined) {
					console.log("Set username");
					setTextBoxValue(incontextqa_options.userNameInputId, username);
				}

				if (apitoken != undefined) {
					console.log("Set apitoken");
					setTextBoxValue(incontextqa_options.apiTokenInputId, apitoken);
				}

				if (email != undefined) {
					console.log("Set email");
					setTextBoxValue(incontextqa_options.emailInputId, email);
				}
			}
		}
	});

	localizeStrings();
}
function localizeStrings() {
	document.getElementById(incontextqa_options.jenkinsUrlLabelId).innerHTML=chrome.i18n.getMessage("options_urlLabel");
	document.getElementById(incontextqa_options.userNameLabelId).innerHTML=chrome.i18n.getMessage("options_userNameLabel");
	document.getElementById(incontextqa_options.apiTokenLabelId).innerHTML=chrome.i18n.getMessage("options_apiTokenLabel");
	document.getElementById(incontextqa_options.emailLabelId).innerHTML=chrome.i18n.getMessage("options_emailLabel");
	document.getElementById(incontextqa_options.authenicateBtnId).innerHTML=chrome.i18n.getMessage("options_authenicate");
}

function save_options() {
	var url = getTextBoxValue(incontextqa_options.jenkinsUrlInputId).trim();
	var username = getTextBoxValue(incontextqa_options.userNameInputId).trim();
	var apitoken = getTextBoxValue(incontextqa_options.apiTokenInputId).trim();
    var email = getTextBoxValue(incontextqa_options.emailInputId).trim();

	var jsonData = {};
	jsonData[incontextqa_options.jenkinsUrlKey] = url;
	jsonData[incontextqa_options.usernameKey] = username;
	jsonData[incontextqa_options.apiTokenKey] = apitoken;
    jsonData[incontextqa_options.emailKey] = email;
	var jsonStr = JSON.stringify(jsonData);

	//Syntax for key is [storageKey] since it's a variable
	chrome.storage.local.set({[incontextqa_options.storageKey]: jsonStr}, function() {
		if(chrome.runtime.lastError) {
			// error
			console.log(chrome.runtime.lastError.message);
			return;
		}
		document.getElementById(incontextqa_options.labelStatus).innerText=chrome.i18n.getMessage("options_successful_saved");;
	});
}
function test_connection() {
	if (!enable_button()) {
		//button shouldn't have enabled as there is missing input
	}

	var url = getTextBoxValue(incontextqa_options.jenkinsUrlInputId).trim();

    document.getElementById(incontextqa_options.labelStatus).className = incontextqa_options.labelStyle;

	//startsWith doesn't work
	var httpStr = url;
	if (httpStr.length >= 4) {
		httpStr = url.substring(0,4);
	}

	if (httpStr != 'http') {
		document.getElementById(incontextqa_options.labelStatus).className = incontextqa_options.labelStyleError;
		document.getElementById(incontextqa_options.labelStatus).innerText=chrome.i18n.getMessage("options_urlerror");
		return;
	}
	var username = getTextBoxValue(incontextqa_options.userNameInputId);
	var apitoken = getTextBoxValue(incontextqa_options.apiTokenInputId);
  var tokenURL;
	if (typeof String.prototype.endsWith != 'function') {
	  String.prototype.endsWith = function (str){
		   return this.slice(-str.length) == str;
  	};
  }
	if(!url.endsWith("/"))
	  url = url + "/";
	tokenURL = url + "validateToken";
	console.log("Authenicating");

	var http = new XMLHttpRequest();
	var formData = new FormData();
	formData.append("type", "chrome");
	formData.append("token", apitoken);
	http.open("POST", tokenURL, true);
	http.onreadystatechange = function() {
			if(http.responseText.includes("Chrome token successfully validated")) {
				document.getElementById(incontextqa_options.labelStatus).innerText=chrome.i18n.getMessage("options_successful_saved");
				document.getElementById(incontextqa_options.labelStatus).className = incontextqa_options.labelStyle;
			}else{
				document.getElementById(incontextqa_options.labelStatus).innerText=chrome.i18n.getMessage("options_unsuccessful");
				document.getElementById(incontextqa_options.labelStatus).className = incontextqa_options.labelStyle;
			}
	}
	http.send(formData);

	chrome.storage.local.set({'serverURL': url});
	chrome.storage.local.set({'chromeToken': apitoken});
	var times = "first";
	chrome.storage.local.set({'times': times});
  save_options();

	//send message to background.js who can handle cross-origin requests, otherwise a jenkins login screen will be displayed and
	// the options page will not refreshed
	//	see - https://developer.chrome.com/extensions/xhr
}


function getTextBoxValue(id) {
	return document.getElementById(id).value
}

function setTextBoxValue(id, value) {
	document.getElementById(id).value = value;
}

function isEmpty(value) {
	if (value === undefined) {
		return true;
	}

	if (value.trim().length == 0) {
		return true;
	}

	return false;
}

function isEmailValid(email) {
	if (isEmpty(email)) {
		return false;
	} else {
		//validateEmail.js-method written by Sandeep V. Tamhankar who also wrote the
		// Apache Common EmailValidator that is used in LRM
		return jcv_checkEmail(email);
	}
}

// Content Security Policy does not allow inline javascript - so can't user onsubmit in <form>
document.getElementById(incontextqa_options.authenicateBtnId).addEventListener('click', test_connection);
document.getElementById(incontextqa_options.userNameInputId).addEventListener('input', enable_button);
document.getElementById(incontextqa_options.apiTokenInputId).addEventListener('input', enable_button);
document.getElementById(incontextqa_options.jenkinsUrlInputId).addEventListener('input', enable_button);
document.getElementById(incontextqa_options.emailInputId).addEventListener('input', enable_button);


$(document).ready(function () {
    console.log("Ready");
	retrieve_storage_info();
	document.getElementById(incontextqa_options.emailInvalid).className = incontextqa_options.labelStyleHidden;;
	document.getElementById(incontextqa_options.labelStatus).className = incontextqa_options.labelStyleHidden;;
    document.getElementById(incontextqa_options.authenicateBtnId).disabled = true;
},true);
