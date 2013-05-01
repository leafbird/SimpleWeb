/*
* This example shows you how to create an index with mongodb
*
* http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
*/

//require node modules (see package.json)
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format
    , async = require('async');

var collectionNames = [ 'statuses', 'favourites' ];

var collections = {};
var counts = {};

exports.init = function(user_name) {

	async.waterfall([
		function(cb){
			//connect away
			MongoClient.connect('mongodb://localhost:27017/twitter', function (err, db) {

			    if (err) throw err;

			    console.log("Connected to Database");

			    for (var i = 0; i < collectionNames.length; i++) {

			    	var name = collectionNames[i];

			    	console.log(format('dbg] coll name : %s', name))

			    	collections[name] = db.collection(format('%s_%s', name, user_name) );

			    	cb(null, collections[name], name);
			    }
			});
		},

		function(collection, name, cb) {

		    collection.count(function (err, count) {

		        console.log(format('%s size : %d', name, count));

		        counts[name] = count;
		    });
		}
	])

}

exports.getCounts = function() {

	console.dir( counts );

	return counts;
}