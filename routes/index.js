
/*
 * GET home page.
 */
var twitter = require('ntwitter');

var twit = new twitter({
    consumer_key: 'JLxRmDMZLjXFRIZD9QNQHg',
    consumer_secret: 'h329otkqFDTsdnIvB8lTqXbt1RAYbAjnyE8ca3QaHs',
    access_token_key: '87850614-oOFvO3HxN3ut5wdN6nBTOoZNOeWhWVtv4O49H33KX',
    access_token_secret: 'RkZCX3Ta637xkR5ZjGWZ5Rt1P5iPp57ty5sg08UN5c'
});

twit
  .verifyCredentials(function (err, data) {
      if (err) {
          console.log("Error verifying credentials: " + err);
          process.exit(1);
      }
  })
  .get('statuses/user_timeline', { screen_name: 'kjcksk' }, function (err, data) {
      if (err) console.log('Tweeting failed: ' + err);
      else console.log('Success!')
  }
  );

exports.index = function (req, res) {
    res.render('index.html', { title: 'SimpleWeb' });
};
