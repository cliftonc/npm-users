/**
 * Dependencies
 */
var should = require('should'),
	Connect = require('connect'), 	
	tokenRegistry = require('token.registry').TokenRegistry,
	uuid = require('uuid.core').UUID;

/**
 * Simple expresso tests
 */
module.exports = {
	
	/**
	 * Token Registry tests
	 */
   'I can generate a unique token id': function(){		
		uuid.generate().should.be.a.string;
   },
   'I can perform basic CRUD on a token that is valid': function() {
	   var tokenId = tokenRegistry.createToken('username', 'user@user.com', 'pending', new Date());
	   tokenRegistry.getToken(tokenId, function(err,token) {
		   should.equal(null,err);
		   token.username.should.equal('username');
	   });	   
	   tokenRegistry.removeToken(tokenId);
	   tokenRegistry.countTokens().should.equal(0);
   },   
   'I cant access a token that doesnt exist': function() {	   
	   tokenRegistry.getToken('invalid token', function(err,token) {	
		   err.should.not.be.null;
		   err.type.should.equal('invalid');
		   should.equal(null,token);
	   });	   	   
   },   
   'I cant access a token that has expired': function() {		   
	   var tokenId = uuid.generate();	   
	   // Add a new token that expired a while back
	   var tokenId = tokenRegistry.createToken('username', 'user@user.com', 'pending', new Date(2010,03,11));	   
	   tokenRegistry.getToken(tokenId, function(err,token) {		   
		   err.should.not.be.null;
		   err.type.should.equal('expired');
		   should.equal(null,token);
	   });	   	   
    }
   
};