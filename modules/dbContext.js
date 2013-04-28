/*
* This example shows you how to create an index with mongodb
*
* http://mongodb.github.io/node-mongodb-native/markdown-docs/indexes.html
*/

//require node modules (see package.json)
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var collection;

//connect away
MongoClient.connect('mongodb://localhost:27017/twitter', function (err, db) {
    if (err) throw err;
    console.log("Connected to Database");
    collection = db.collection('twitter');
    collection.count(function (err, count) {
        console.log(format('db data size : %d', count));
    });
});

exports.count = 20;