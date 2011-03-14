/**
 * TokenRegistry class - in memory register of reset tokens
 * Best to have a cron job that restarts it every 48 hours
 */
var uuid = require('./uuid.core').UUID;
  , currentTokens = {}
  , maxTokens = 1000

var TokenRegistry = exports.TokenRegistry = {

  createToken: function(username, email, state, expires) {
    var token = uuid.generate();
    currentTokens[token] = { username: username,
                             email: email,
                             expires: expires,
                             state: state,
                             revision: '' };

    // check to see if there are a lot, and if so, clear some out.
    // only check if it's "a lot" though.
    var c = Object.keys(currentTokens).length
    if (c > maxTokens) {
      this.clearExpired();
      c = Object.keys(currentTokens).length;
    }
    maxTokens = Math.max(1000, c * 2);

    return token;
  },

  removeToken: function(token) {
    delete currentTokens[token]
  },

  set: function (token, field, val) {
    if (currentTokens[token]) currentTokens[token][field] = val
  },

  get: function (token, field) {
    if (currentTokens[token]) return currentTokens[token][field];
  },

  setRevision: function(token, revision) {
    this.set(token, "revision", revision)
  },

  countTokens: function() {
    return Object.keys(currentTokens).length
  },

  hasExpired: function(token) {
    return (token.expires < new Date())
  },

  getToken: function(tokenId,response) {
    if (currentTokens.hasOwnProperty(tokenId)) {
      var token = currentTokens[tokenId];
      if(this.hasExpired(token)) {
        // Take this opportunity to clean it up
        delete currentTokens[tokenId];
        response({ type:'expired',
                   message:'That token has expired.' },null);
      } else {
        response(null, token);
      }

    } else {
      response({ type:'invalid',
                 message:'Token ' + tokenId + ' not found.' }, null);
    }

  },

  clearExpired: function () {
    var now = new Date()
    Object.keys(currentTokens).forEach(function (t) {
      if (now > currentTokens[t].expires) {
        delete currentTokens[t]
      }
    })
  }
};
