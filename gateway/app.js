var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({includeMethod: true});

const connectDB = require('./database/db');

connectDB();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var targetRouter = require('./routes/target');
var attemptRouter = require('./routes/attempts');
var authRouter = require('./routes/auth');

const passport = require('./services/passport');
const authManager = require('./services/authmanager');
const authmanager = new authManager();
authmanager.initalize();
const ConnectRoles   = require('connect-roles');
const roles = new ConnectRoles();

var app = express();

app.use(metricsMiddleware);

roles.use('admin', function(req) {
  if (req.user && roles.isAuthenticated()){
    return req.user.role === 'admin';
  }
});

roles.use('user', function(req) {
  if (req.user && roles.isAuthenticated() || req.user.role === 'admin' || req.user.role === 'competitionmaker'){
    return req.user.role === 'user';
  }
});

roles.use('competitionmaker', function(req) {
  if (req.user && roles.isAuthenticated() || req.user.role === 'admin'){
    return req.user.role === 'competitionmaker';
  }
});


// Use the roles middleware
app.use(roles.middleware());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/target', targetRouter);
app.use('/attempts', attemptRouter);
app.use('/', authRouter);

// protected test route
app.get('/protected', passport.authenticate('jwt', { session: false }), roles.can('admin'), (req, res) => {
  res.json({ message: 'You are authorized!' });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: 'ERROR 404 not found' });
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({ message: err.message, error: err.stack });
});

module.exports = app;

