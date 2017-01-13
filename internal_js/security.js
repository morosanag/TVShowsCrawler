var couchdb = require('./couch_db');
var basicAuth = require('basic-auth');

function auth(req, res, next) {
    var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.sendStatus(401);
    return;
  }
  var body = {};
    body.user = user.name;
    body.pass = user.pass;
    var request = {};
    request.body = body;
    couchdb.getUsers2(authCheck, request, res, next);
}

function login(req, res) {
  console.log("login");
    var user = basicAuth(req);
    if(user == undefined) {
      resp.sendStatus(401);
    }
    var body = {};
    body.user = user.name;
    body.pass = user.pass;
    var request = {};
    request.body = body;
    console.log("body: " + JSON.stringify(body));
    couchdb.getUsers(signInCheck, request, res);

}

function signup(req, res) {
    couchdb.getUsers(checkUser, req, res);
}

function signInCheck(json, req, resp) {
  for(var i = 0; i < json.users.length; i++) {
    console.log(json.users[i].user + " " + req.body.user + " && " + json.users[i].pass + " "  + req.body.pass);
     console.log((json.users[i].user == req.body.user) + " && " + (json.users[i].pass == req.body.pass));
     if(json.users[i].user == req.body.user && json.users[i].pass == req.body.pass) {
      console.log("ok");
        resp.sendStatus(200);
        resp.end();
        return;
     }
  }
  resp.sendStatus(401);
}

function authCheck(json, req, resp, next) {
  for(var i = 0; i < json.users.length; i++) {
    console.log(json.users[i].user + " " + req.body.user + " && " + json.users[i].pass + " "  + req.body.pass);
     console.log((json.users[i].user == req.body.user) + " && " + (json.users[i].pass == req.body.pass));
     if(json.users[i].user == req.body.user && json.users[i].pass == req.body.pass) {
        next();
        return;
     }
  }
  resp.sendStatus(401);
}


function checkUser(json, req, resp) {
  console.log("req.body: " + JSON.stringify(req.body));
  for(var i = 0; i < json.users.length; i++) {
     if(json.users[i].user == req.body.user) {
        resp.sendStatus(409);
        return;
     }
  }

  var user = {};
  user.user = req.body.user;
  user.pass = req.body.pass;

  console.log("user: " + JSON.stringify(user));
  json.users.push(user);
  couchdb.updateSeries(json);

  resp.sendStatus(200);
}


module.exports.login = login;
module.exports.auth = auth;
module.exports.signup = signup;
