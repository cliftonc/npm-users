/**
 * TokenRegistry class - in memory register of reset tokens
 * Best to have a cron job that restarts it every 48 hours
 */
var uuid = require('./uuid.core').UUID;

exports.TokenRegistry = {
  
  _currentTokens: {},
  
  createToken: function(username, email, state, expires) {
	var token = uuid.generate();	
    this._currentTokens[token] = { username: username, email: email, expires: expires, state: state, revision: '' };
    return token;
  },
  removeToken: function(token) {
    if (token in this._currentTokens)
      delete this._currentTokens[token];
  },
  setRevision: function(token, revision) {
	    if (token in this._currentTokens) {
	      this._currentTokens[token].revision = revision;
	    }
	  },	  
  setState: function(token, state) {
    if (token in this._currentTokens) {
      this._currentTokens[token].state = state;
    }
  },
  getState: function(token) {
    if (token in this._currentTokens) {
      return this._currentTokens[token].state;
    }
  },
  getCurrent: function() {
    var ret = {};
    for (var idx in this._currentTokens) {
      ret[idx] = ({ username: this._currentTokens[idx].username, email: this._currentTokens[idx].email, expires: this._currentTokens[idx].expires, state: this._currentTokens[idx].state, revision: this._currentTokens[idx].revision });
    }
    return ret;
  },
  countTokens: function() {
	var count = 0;
	for (var idx in this._currentTokens) {
	    count++;
	}
	return count;    
  },  
  hasExpired: function(token) {
	  var currentDate = new Date();
	  if(token.expires < currentDate) {
		  return true;
	  } else {
		  return false;
	  }
  },
  getToken: function(tokenId,response) {
		
    if (tokenId in this._currentTokens) {
    	var token = this._currentTokens[tokenId];
    	if(this.hasExpired(token)) {
    		// Take this opportunity to clean it up
    	    delete this._currentTokens[tokenId];
    		response({type:'expired',message:'That token has expired.'},null);
    	} else {
    		response(null, token);
    	}
    
	} else {
		response({type:'invalid',message:'Token with ID ' + tokenId + ' not found.'},null);
	}
    
  }
  
};