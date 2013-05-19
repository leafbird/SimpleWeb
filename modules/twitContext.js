var twitter = require('ntwitter');

var twit = new twitter({
	consumer_key: 'JLxRmDMZLjXFRIZD9QNQHg',
	consumer_secret: 'h329otkqFDTsdnIvB8lTqXbt1RAYbAjnyE8ca3QaHs',
	access_token_key: '87850614-oOFvO3HxN3ut5wdN6nBTOoZNOeWhWVtv4O49H33KX',
	access_token_secret: 'RkZCX3Ta637xkR5ZjGWZ5Rt1P5iPp57ty5sg08UN5c'
});

exports.init = function() {

	twit.verifyCredentials(function (err, data) {
		if (err) {
			console.log("Error verifying credentials: " + err);
			process.exit(1);
		}
	});
}

var userData = null;

exports.getUserData = function(user_name, cb) {

	if( userData )
		cb( null, userData );
	else {
		twit.showUser(user_name, function(err, result) {
			if(err) throw err;
			userData = result[0];

			console.log('user name : ' + userData.name);

			cb( null, userData);
		});
	}
}

exports.getTwit = function() {
	return twit;
}