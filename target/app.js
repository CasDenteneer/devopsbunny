var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var targetRouter = require('./routes/target');
var attemptsRouter = require('./routes/attempts');
const MessageHandler = require('./messagebroker'); 

const connectDB = require('./database/db');

connectDB();


var app = express();

const messageHandler = new MessageHandler();

messageHandler.startListening();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/target', targetRouter);
app.use('/attempts', attemptsRouter);
app.use('/uploads', express.static('uploads'));


app.use(function(req, res, next) {
    res.status(404).json({ message: 'ERROR 404 not found' });
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  res.json({ message: err.message });
});

module.exports = app;
