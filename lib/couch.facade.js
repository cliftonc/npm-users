/**
 * Facade for CouchDB rest calls for user, only implement what is requried
 * 
 * Configuration from ENV
 * COUCH_HOST=localhost
 * COUCH_PORT=5984 
 * USERDB=_users 
 * ADMIN=adminuser:adminpass
 */

var base64 = require('./base64'), http = require('http');

exports.validateUser = function(username,callback) {
		
		/* 
		 * Construct a simple http get based on the env params, assume 'normal' CouchDB Setup?
		 */
		var options = http.request({  host: process.env.COUCH_HOST,
		      port: process.env.COUCH_PORT,
		      path: "/" + process.env.USERDB + "/org.couchdb.user:" + username,
		      method: "GET"
		});

		var req = http.request(options, function(res) {			  
			res.on('data', function (chunk) {
				var data = JSON.parse(chunk);					
				if(res.statusCode == 200) {
					if(data.error) {
						// We got an error for some reason
						callback(false);
					} else {
						callback(true,data._rev);
					}
				} else {
					callback(false);	
				}
				
			  });
		});

		req.end();
		
};

exports.deleteUser = function(token,callback) {
	
		/* 
		 * Construct a simple http get based on the env params, assume 'normal' CouchDB Setup?
		 */
		var options = http.request({  
					  host: process.env.COUCH_HOST,
				      port: process.env.COUCH_PORT,
				      path: "/" + process.env.USERDB + "/org.couchdb.user:" + token.username + '?rev=' + token.revision,
				      headers: {'authorization':'Basic ' + base64.encode(process.env.ADMIN)},
				      method: "DELETE"
		});
		
		console.log(options);
			
		/**
		 * Make the request
		 */
		var req = http.request(options, function(res) {
			  res.on('data', function (chunk) {

				console.log("Data: " + chunk);
				if(chunk) {
					if(JSON.parse(chunk).error) {						
						callback(false);
					} else {						
						callback(res.statusCode == 200 ? true : false);
					}
				} else {
					callback(res.statusCode == 200 ? true : false);	
				}				
			  });
		});

		req.end();
		
};