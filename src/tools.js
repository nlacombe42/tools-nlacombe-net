var environment = {
	googleOauthClientId: "273906632603-inp327d54vf74pso1sq4q6v23u1ek9ob.apps.googleusercontent.com"
};
var auth2;
var googleUser;

function init() {
	gapi.load('auth2', function () {
		gapi.auth2.init({
			client_id: environment.googleOauthClientId,
			cookiepolicy: 'single_host_origin',
			scope: 'https://www.googleapis.com/auth/calendar'
		}).then(function (localAuth2) {
			auth2 = localAuth2;

			if (auth2.isSignedIn.get()) {
				var googleUser = auth2.currentUser.get();
				onGoogleUserLogin(googleUser);
			}
		}, function (error) {
			showMessage('Unknown error. ', error);
		});
	});
}

function onGoogleUserLogin(localGoogleUser) {
	googleUser = localGoogleUser;
}

function googleSignIn() {
	auth2.signIn().then(function (googleUser) {
		onGoogleUserLogin(googleUser);
	}, function (errorResponse) {
		showMessage('Unknown error. ', errorResponse);
	});
}

function sync() {
	var sourceCalendarIcalUrl = $('[name="sourceCalendarIcalUrl"]').val();

	if (!googleUser) {
		showMessage('You must login using the google sign in button.');
		return;
	}

	if (!sourceCalendarIcalUrl) {
		showMessage('You must provide an ICal URL.');
		return;
	}

	var requestBody = {
		sourceCalendarIcalUrl: sourceCalendarIcalUrl,
		googleUserAccessToken: googleUser.getAuthResponse().access_token,
		googleUserRefreshToken: ""
	};

	showMessage('Syncing...');

	$.ajax({
		method: 'post',
		url: "https://moirai-ws-okbnonaqjq-uc.a.run.app/api/v1/syncIcalWithGoogleCalendar",
		contentType: 'application/json',
		data: JSON.stringify(requestBody)
	}).done(function () {
		showMessage('Synced');
	}).fail(function () {
		showMessage('Failed to sync');
	});
}

function showMessage(message, objectToLog) {
	var text = message;

	if (objectToLog) {
		text += ' : ' + JSON.stringify(objectToLog, undefined, 2);
	}

	$('.message').text(text);
}

init();
