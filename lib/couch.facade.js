/**
 * 
 * Facade for CouchDB rest calls for user, only implement what is requried
 * 
 * Configuration from ENV
 * COUCH=localhost:5984 
 * USERDB=_users 
 * ADMIN=adminuser:adminpass
 */

var base64 = require('./base64'), 
	request = require('request'),
	sys = require('sys'),
	headers = {accept:'application/json', 'content-type':'application/json'};

exports.validateUser = function(username,email,callback) {
		
		/* 
		 * Construct a simple http get based on the env params, assume 'normal' CouchDB Setup?
		 */
		var url = 'http://' + process.env.COUCH + "/" + process.env.USERDB + "/org.couchdb.user:" + username
		
		request({uri:url, method:'GET', headers:headers}, function (err, response, body) {
		  if (err) callback(false);
		  if (response.statusCode == 200) {			  
			  // Also check that it is the same email address if it exists in the table
			  var user = JSON.parse(body);
			  if(user.email) {
				  if(user.email != email) {
					  callback(false,user._rev);  
				  }
			  } else {
				  callback(true,user._rev);
			  }
		  } else {
			  callback(false);	
		  }
		});
	

};

exports.deleteUser = function(token,callback) {
			
		/* 
		 * Construct a simple http get based on the env params, assume 'normal' CouchDB Setup?
		 */
		var url = 'http://' + process.env.COUCH + "/" + process.env.USERDB + "/org.couchdb.user:" + token.username + '?rev=' + token.revision;
		headers.authorization = 'Basic ' +  base64.encode(process.env.ADMIN);
		
		request({uri:url, method:'DELETE', headers:headers}, function (err, response, body) {
		  if (err) callback(false);
		  if (response.statusCode == 200) {				  
			  callback(true);	
		  } else {
			  callback(false);	
		  }
		});

};