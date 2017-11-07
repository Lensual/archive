var express = require('express');
var app = express();
var fs = require('fs');

app.set('views', './views');
app.set('view engine', 'jade');

var index = require('./routes/index');
var article = require('./routes/article');

//load config
global.config = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }));

//connect DB
var mongo = require('mongodb').MongoClient;
mongo.connect(config.db_uri, function (err, db) {
    global.db = db;
});

//route
app.use('/', index);
app.use('/article', article);

var server = app.listen(config.listen_port, config.listen_addr, function () {
    console.log('archive listening at http://%s:%s', server.address().address, server.address().port);
});