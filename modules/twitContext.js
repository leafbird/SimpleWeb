var twitter = require('ntwitter');

var twit = new twitter({
	consumer_key: 'JLxRmDMZLjXFRIZD9QNQHg',
	consumer_secret: 'h329otkqFDTsdnIvB8lTqXbt1RAYbAjnyE8ca3QaHs',
	access_token_key: '87850614-oOFvO3HxN3ut5wdN6nBTOoZNOeWhWVtv4O49H33KX',
	access_token_secret: 'RkZCX3Ta637xkR5ZjGWZ5Rt1P5iPp57ty5sg08UN5c'
});

var twit_data = {};

exports.init = function( user_name ) {

	twit
	.verifyCredentials(function (err, data) {
		if (err) {
			console.log("Error verifying credentials: " + err);
			process.exit(1);
		}
	})
	.showUser(user_name, function (err, data) {

		if (err) 
			throw err;

		twit_data.user = data[0];
		console.log('user name : ' + twit_data.user.name);
	});
}

exports.user_data = function() {
	return twit_data.user;
}

exports.getTwit = function() {
	return twit;
}