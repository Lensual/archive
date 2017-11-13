var express = require('express');
var app = express();
var fs = require('fs');

//load config
global.config = JSON.parse(fs.readFileSync('./config.json', { encoding: 'utf8' }));

//connect DB
var mongo = require('mongodb').MongoClient;
mongo.connect(config.db_uri, function (err, db) {
    if (err) { throw err; }
    global.db = db;
});

//static file
app.use('/public', express.static('public'));

//view engine
app.set('views', './views');
app.set('view engine', 'jade');

//middleware
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//auth
var login = require('./routes/login');
app.use(login.auth);

//custom middleware
var sitemeta = require('./middleware/sitemeta');
var usermeta = require('./middleware/usermeta');
app.use([sitemeta, usermeta]);

//route
var index = require('./routes/index');
var article = require('./routes/article');

app.use('/', index);
app.use('/article', article);
app.use('/login', login);

//listen
var server = app.listen(config.listen_port, config.listen_addr, function () {
    console.log('archive listening at http://%s:%s', server.address().address, server.address().port);
});