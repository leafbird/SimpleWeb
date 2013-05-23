/*
* This example shows you how to create an index with mongodb
*
* http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
*/

//require node modules (see package.json)
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format
    ;

var collections = {};
var arrCollection = [];

exports.init = function(user_name) {

	//connect away
	MongoClient.connect('mongodb://localhost:27017/twitter', function (err, db) {

		if (err) throw err;

	    console.log("Connected to Database");

		['statuses', 'favorites'].forEach( function( name ) {
			var value = {};
	    	value.name = name;

	    	console.log(format('dbg] coll name : %s', name));

	    	value.cursor = db.collection(name);
	    	arrCollection.push(value)
	    	collections[name] = value;
		});
	});
}

function asyncMap( list, fn, cb_ ) {
	var n = list.length
		, result = []
    	, errState = null;
    
  	function cb (er, data) {
    	if (errState) return;
    	if (er) return cb_(errState = er);
    	results.push(data);
    	if (--n === 0) // 모든 리스트 처리 완료시
      		return cb_(null, results);
  	}
  
  	// action code
  	list.forEach(function (l) {
    	fn(l, cb);
  	});
}

function asyncObjMap( list, fn, cb_ ) {
	var n = list.length
		, result = {} 
    	, errState = null;
    
  	function cb (er, key, value) {
    	if (errState) return;
    	if (er) return cb_(errState = er);
    	result[key] = value;
    	if (--n === 0) // 모든 리스트 처리 완료시
      		return cb_(null, result);
  	}
  
  	// action code
  	list.forEach(function (l) {
    	fn(l, cb);
  	});
}
      
exports.getCounts = function( callback ) {

	asyncObjMap( arrCollection,	function( data, cb ) {
			data.cursor.count( function (err, count) {
				cb( null, data.name, count );
			});
		}, callback );
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

exports.getData = function( name, count, page, callback ) {
	var coll = collections[name].cursor;
	coll.find({})
		.sort({id:-1})
		.limit(count)
		.skip(count * page)
		.toArray( callback );
}