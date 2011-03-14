/**
 *
 * Facade for CouchDB rest calls for user, only implement what is requried
 *
 * Configuration from ENV
 * COUCH=localhost:5984
 * COUCH_USERDB=_users
 * COUCH_ADMIN=adminuser:adminpass
 */

var base64 = require('./base64')
  , config = require('../config')
  , request = require('request')
  , sys = require('sys')
  , auth = base64.encode(config.COUCH_ADMIN)
  , couchssl = +config.COUCH_SSL === 1 ? true : false
  , headers = { 'accept':'application/json',
                'host':config.COUCH,
                'content-type':'application/json',
                'authorization':'Basic ' + auth }

exports.validateUser = function(username,email,callback) {
  var url = 'http' + (couchssl ? 's' : '') + '://' +
            config.COUCH +
            "/" + config.COUCH_USERDB +
            "/org.couchdb.user:" + username

  console.error("validate user", url)
  request({ uri:url,
            method:'GET',
            headers:headers }, function (err, response, body) {
    if (err) return callback(false);
    if (response.statusCode == 200) {
      // Also check that it is the same email
      // address if it exists in the table
      var user = JSON.parse(body);
      if(user.email) {
        if(user.email != email) {
          callback(false,user._rev);
        } else {
          callback(true,user._rev);
        }
      }
    } else {
      callback(false);
    }
  });
};

exports.deleteUser = function(token,callback) {
  var url = 'http' + (couchssl ? 's' : '') + '://' +
            config.COUCH +
            "/" + config.COUCH_USERDB +
            "/org.couchdb.user:" +
            token.username +
            '?rev=' + token.revision;

  console.error("delete user", url)
  request({ uri:url,
            method:'DELETE',
            headers:headers }, function (err, response, body) {
    if (err) callback(false);
    if (response.statusCode == 200) {
      callback(true);
    } else {
      callback(false);
    }
  });
};
