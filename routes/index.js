
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

	dbContext.getCounts( function(err, result) {

		console.dir( result );

	    res.render('index.html', { 
	    	user: twitContext.user_data(),
	    	dbCounts: result,
	    });

	});
};

exports.backup = function (req, res ) {

	function saveStatuses(data, since_id) {
		dbContext.insert( 'statuses', data, function(err, result) {
			if(err) throw err;

			console.dir( typeof data );

			var smallestId = -1;
			data.forEach( function(entry) {
				if( smallestId < 0 )
					smallestId = entry.id;
				else if( entry.id < smallestId )
					smallestId = entry.id;
			});

			console.log( 'smallestId:' + smallestId );

			loopLogic( since_id, smallestId );
		});
	}

	function loopLogic( since_id, max_id) {

		var params = {
			include_rts: true,
			trim_user: false,
			//since_id:,
			//max_id:,
			count: 200,
			screen_name: user_name,
		};	

		if(since_id > 0)
			params.since_id = since_id;
		if(max_id > 0)
			params.max_id = max_id;

		console.dir(params);

		var twit = twitContext.getTwit();
		twit.getUserTimeline( params, function(err, data) {
			
			if (err) throw err;

			if (data.length == 0 ) {
				res.send( {result:'no more data'} );
				return;
			}

			console.log(format('dataLength:%d', data.length) );
			saveStatuses(data, since_id);
		});
	}

	async.waterfall([

		// 
		function(cb) {

			dbContext.getLatestId( 'statuses', function( latestId ) {
				cb(null, latestId);
			} );
		},

		function(latestId, cb) {

			console.log(format('max_id:%d', latestId));
			
			loopLogic( latestId, -1 );
		},
	]);
}