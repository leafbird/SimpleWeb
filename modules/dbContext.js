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
		// key : source, value : count.
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

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
     
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
 
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

exports.groupByDate = function( callback ) {

	if( data.groupByDate ) {
		callback( null, data );
		return;
	}

	var coll = collections['statuses'].cursor;

	coll.find( {}, {created_at:true} ).toArray( function( err, docs ) {

		if( err )
			throw err;

		// docs = { key1: value1, key2: value2, ... }
		// key : 'yyyy.dd', value : count
		docs = docs.reduce( function( previousValue, currentValue ) {
			var strDateKey = new Date( currentValue.created_at ).format( 'yyyy.MM' );
			if( previousValue[ strDateKey ] )
				previousValue[ strDateKey ]++;
			else
				previousValue[ strDateKey ] = 1;

			return previousValue;
		}, {});

		// arr = [ [key1, value1], [key2, value2], ... ]
		var arr = [];
		for( key in docs ) {
			arr.push( [key, docs[key] ] );
		}

		arr.sort( function( a, b ) { return b[0] - a[0]; } );
		console.dir( arr );

		callback( null, arr );
		
		data.groupBySource = arr;
	});
}