/*
* This example shows you how to create an index with mongodb
*
* http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
*/

//require node modules (see package.json)
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format
    , async = require('async');

var collectionNames = [ 'status', 'favorites' ];

var collections = {};
var counts = {};

exports.init = function(user_name) {

	//connect away
	MongoClient.connect('mongodb://localhost:27017/twitter', function (err, db) {

	    if (err) throw err;

	    console.log("Connected to Database");

	    for (var i = 0; i < collectionNames.length; i++) {

	    	var name = collectionNames[i];

	    	console.log(format('dbg] coll name : %s', name))

	    	collections[name] = db.collection(format('%s_%s', name, user_name) );

		    collections[name].count(function (err, count) {

		        console.log(format('%s size : %d', name, count));
		        console.dir( 'this : ' + this.toString() );

		        counts[name] = count;
		    });
	    }
	});
}

exports.getCounts = function() {
	console.log( 'getCounts() called.');

	for (var i = 0; i < counts.length; i++) {
		console.log( counts[i] );
	};
	return counts;
}