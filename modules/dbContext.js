/*
* This example shows you how to create an index with mongodb
*
* http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
*/

//require node modules (see package.json)
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var async = require('async');

var collections = {};
var arrCollection = [];

exports.init = function(user_name) {

	//connect away
	MongoClient.connect('mongodb://localhost:27017/twitter', function (err, db) {

		if (err) throw err;

	    console.log("Connected to Database");

		['statuses', 'favorites', 'mention'].forEach( function( name ) {
			var value = {};
	    	value.name = name;

	    	console.log(format('dbg] coll name : %s', name));

	    	value.cursor = db.collection(name);
	    	arrCollection.push(value)
	    	collections[name] = value;
		});
	});
}

exports.getCounts = function( callback ) {

	var tasks = {}
	arrCollection.forEach( function( data ) {
		tasks[ data.name ] = function( cb ) {
			data.cursor.count( cb );
		}
	});
	async.parallel(tasks, callback);
}

exports.getLatestId = function( name, callback ) {
	var coll = collections[name].cursor;

	coll.findOne( {}, { sort: { id: -1 } , fields: { id: 1 } }, function( err, doc ) {
		if( err ) throw err;

		console.log( 'doc:'+ JSON.stringify(doc) );
		callback( doc ? doc.id : -1 );
	} );
}

exports.insert = function( name, data, callback ) {
	var coll = collections[name].cursor;
	coll.insert( data, { safe: true }, callback);
}

exports.getData = function( name, key, count, page, callback ) {
	var coll = collections[name].cursor;
	var query = key ? {text: {$regex: key} } : {}
	coll.find(query)
		.sort({id:-1})
		.limit(count)
		.skip(count * (page-1))
		.toArray( callback );
}

exports.getRtRank = function( isMine, callback ) {
	var coll = collections['statuses'].cursor;
	coll.find( { retweeted_status: { $exists: !isMine } } )
		.sort( {retweet_count:-1} )
		.limit( 20 )
		.toArray( callback );
}

var data = {}
exports.groupBySource = function( callback ) {

	if( data.grouBySource ) {
		callback( null, data );
		return;
	}

	var coll = collections['statuses'].cursor;

	coll.find( {}, {source:true} ).toArray( function( err, docs ) {
		if( err )
			throw err;

		// docs = { key1: value1, key2: value2, ... }
		docs = docs.reduce( function( previousValue, currentValue ) {
			if( previousValue[ currentValue.source ] )
				previousValue[ currentValue.source ]++;
			else
				previousValue[ currentValue.source ] = 1;

			return previousValue;
		}, {});

		// arr = [ [key1, value1], [key2, value2], ... ]
		var arr = [];
		for( key in docs ) {
			arr.push( [key, docs[key] ] );
		}

		arr.sort( function( a, b ) { return b[1] - a[1]; } );
		arr = arr.slice( 0, 10 );

		console.dir( arr );

		callback( null, arr );
		
		data.groupBySource = arr;
	});
}