var compression = require('compression');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config.json');
var routes = require('./routes/index');
var api = require('./routes/api');
var upload = require('./api/controllers/upload');

var app = express();

app.use(compression({threshold: 0}))

if(app.get('env')==='development') {
  console.log('mysql local server');
  //development
  global.dbPool = mysql.createPool({
    host: config.development.database.host,
    user: config.development.database.user,
    password: config.development.database.pwd,
    database: config.development.database.db,
    connectionLimit: 10,
    acquireTimeout: 30000
  });
}
else{
  console.log('mysql aws server');
  //production
  global.dbPool = mysql.createPool({
    host: config.production.database.host,
    user: config.production.database.user,
    password: config.production.database.pwd,
    database: config.production.database.db,
    connectionLimit: 10,
    acquireTimeout: 30000
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);
app.use('/upload', upload);
app.get('/download/env', function(req, res){
  res.download(__dirname + '/env.txt');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
