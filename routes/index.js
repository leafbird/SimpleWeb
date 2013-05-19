
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

	var dataCount = 200;
	var loopCount = 0;
	var savedCount = 0;

	function finish() {
		res.send({
			result: 'ok',
			loopCount: loopCount,
			savedCount: savedCount,
		});
	}

	function saveStatuses(data, since_id) {

		if( data.length == 0 ) {
			finish();
			return;
		}

		dbContext.insert( 'statuses', data, function(err, result) {
			if(err) throw err;

			//console.dir( typeof data );
			savedCount += result.length;

			var smallestId = -1;
			data.forEach( function(entry) {
				if( smallestId < 0 )
					smallestId = entry.id;
				else if( entry.id < smallestId )
					smallestId = entry.id;
			});

			//console.log( 'smallestId:' + smallestId );

			if( smallestId > since_id ) {
				loopLogic( since_id, smallestId );
			} else {
				finish();
			}
		});
	}

	function loopLogic( since_id, max_id) {

		var params = {
			include_rts: true,
			trim_user: false,
			//since_id:,
			//max_id:,
			count: dataCount,
			screen_name: user_name,
		};	

		if(since_id > 0)
			params.since_id = since_id;
		if(max_id > 0)
			params.max_id = max_id;

		loopCount++;
		console.log(format('loop #%d. max:%d, since:%d', loopCount, since_id, max_id))

		var twit = twitContext.getTwit();
		twit.getUserTimeline( params, function(err, data) {
			
			if (err) throw err;

			if (data.length == 0 ) {
				res.send( {result:'no more data'} );
				return;
			}

			var filtered = data.filter( function(x) {
				return x.id != max_id && x.id != since_id;
			});

			console.log(format('dataLength:%d, filtered:%d', data.length, filtered.length) );

			saveStatuses(filtered, since_id);
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