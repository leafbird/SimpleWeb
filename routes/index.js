
/*
 * GET home page.
 */
var dbContext = require('../modules/dbContext');
var twitContext = require('../modules/twitContext');

var user_name = 'leafbird_tw';

twitContext.init(user_name);
dbContext.init(user_name);

exports.index = function (req, res) {
    res.render('index.html', { 
    	user: twitContext.user_data(),
    	dbCounts: dbContext.getCounts(),
    });
};

exports.backup = function (req, res ) {
	console.log( req.params.id );
	res.send( {result:'ok'} );
}