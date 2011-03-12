/*
 * This binds the node-validator library to the req object so that 
 * the validation / sanitization methods can be called on parameter
 * names rather than the actual strings.
 * 
 * 1. Be sure to include `req.mixinParams()` as middleware to merge 
 *    query string, body and named parameters into `req.params`
 * 
 * 2. To validate parameters, use `req.check(param_name, [err_message])`
 *        e.g. req.check('param1').len(1, 6).isInt();
 *        e.g. req.checkHeader('referer').contains('mydomain.com');
 *    
 *    Each call to `check()` will throw an exception by default. To
 *    specify a custom err handler, use `req.onValidationError(errback)`
 *    where errback receives a parameter containing the error message
 * 
 * 3. To sanitize parameters, use `req.sanitize(param_name)`
 *        e.g. req.sanitize('large_text').xss();
 *        e.g. req.sanitize('param2').toInt();
 * 
 * 4. Done! Access your validated and sanitized paramaters through the 
 *    `req.params` object
 */

var http = require('http'),
    Validator = require('validator').Validator,
    Filter = require('validator').Filter;

var validator = new Validator();
    
http.IncomingMessage.prototype.mixinParams = function() {
    this.params = this.params || {};
    this.query = this.query || {};
    this.body = this.body || {};
    
    //Merge params from the query string
    for (var i in this.query) {
        if (typeof this.params[i] === 'undefined') {
            this.params[i] = this.query[i];
        }
    }
    
    //Merge params from the request body
    for (var i in this.body) {
        if (typeof this.params[i] === 'undefined') {
            this.params[i] = this.body[i];
        }
    }
}

http.IncomingMessage.prototype.check = function(param, fail_msg) {
    return validator.check(this.params[param], fail_msg);
}

http.IncomingMessage.prototype.checkHeader = function(param, fail_msg) {
    var to_check;
    if (header === 'referrer' || header === 'referer') {
        to_check = this.headers['referer'];
    } else {
        to_check = this.headers[header];
    }
    return validator.check(to_check || '', fail_msg);
}

http.IncomingMessage.prototype.onValidationError = function(errback) {
    validator.error = errback;
}

http.IncomingMessage.prototype.filter = function(param) {
    var self = this;
    var filter = new Filter();
    filter.modify = function(str) {
        this.str = str;
        self.params[param] = str; //Replace the param with the filtered version
    }
    return filter.sanitize(this.params[param]);
}

//Create some aliases - might help with code readability
http.IncomingMessage.prototype.sanitize = http.IncomingMessage.prototype.filter;
http.IncomingMessage.prototype.assert = http.IncomingMessage.prototype.check;