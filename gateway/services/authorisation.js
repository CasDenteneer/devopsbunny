const ConnectRoles = require('connect-roles');
const roles = new ConnectRoles();
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

module.exports = roles;