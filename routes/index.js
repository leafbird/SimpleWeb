
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

	if( req.params.id == 'statuses' ) {
		twitContext.getTwit().getUserTimeline( {
			include_rts: true,
			trim_user: false,
			//since_id:,
			//max_id:,
			count: 5,
			screen_name:'leafbird_tw',

		}, function(err, data) {
			if (err) 
				throw err;

			console.dir(data);
		})
	}

	res.send( {result:'ok'} );
}