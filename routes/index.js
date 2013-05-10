
/*
 * GET home page.
 */
var dbContext = require('../modules/dbContext');
var twitContext = require('../modules/twitContext');
var format = require('util').format;
var async = require('async');

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

	async.waterfall([

		// 
		function(cb) {

			dbContext.getLatestId( 'statuses', function( latestId ) {
				cb(null, latestId);
			} );
		},

		function(latestId, cb) {

			console.log(format('max_id:%d', latestId));

			var twit = twitContext.getTwit();
			var params = {
				include_rts: true,
				trim_user: false,
				//since_id:,
				//max_id:,
				count: 100,
				screen_name: user_name,
			};
			if(latestId > 0)
				params.since_id = latestId;

			var loopLogic = function( params, maxCount ) {

				console.log( 'maxCount:' + maxCount );

				if( maxCount == 0 )
					return;

				console.dir(params);
				twit.getUserTimeline( params, function(err, data) {
					
					if (err) throw err;

					if (data.length == 0 ) {
						res.send( {result:'no more data'} );
						return;
					}

					console.log(format('maxCount:%d, dataLength:%d', maxCount, data.length) );
					cb(null, data);

					var smallestId = -1;
					data.forEach( function(entry) {
						if( smallestId < 0 )
							smallestId = entry.id;
						else if( entry.id < smallestId )
							smallestId = entry.id;
					});

					console.log( 'smallestId:' + smallestId );
					params.max_id = smallestId;

					loopLogic( params, maxCount - 1 );
				});
			}

			loopLogic( params, 3 );

		},

		function(data, cb) {
			dbContext.insert( 'statuses', data, function(data) {
				console.dir( typeof data );
				//res.send( {result:'ok'} );
			});
		},
		
	]);
}