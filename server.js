/**
 * Very lightweight server, use Express to enable a small amount of flex
 * Basic requirements for password reset via a token
 *
 * Author: clifton.cunningham@gmail.com
 */

/**
 * Initial configuration of the Express server
 *
 * Configuration from config.js
 * COUCH=localhost:5984
 * COUCH_USERDB=_users
 * COUCH_ADMIN=adminuser:adminpass
 * EMAIL_USERNAME=isaacschlueter@gmail.com
 * EMAIL_PASSWORD=mypassword
 * EMAIL_SMTPHOST=smtp.gmail.com
 * EMAIL_SMTPPORT=465
 * EMAIL_FROM=user-account-bot@npmjs.org
 * HOSTNAME=localhost
 * PORT=3000
 *
 **/
var config = require("./config")

var envFields = [ 'COUCH',
                  'COUCH_USERDB',
                  'COUCH_ADMIN',
                  'EMAIL_USERNAME',
                  'EMAIL_PASSWORD',
                  'EMAIL_SMTPHOST',
                  'EMAIL_SMTPPORT',
                  'EMAIL_FROM',
                  'HOSTNAME',
                  'PORT' ];

var missing = envFields.filter(function (f) {
  return undefined === config[f]
})

if (missing.length) {
  throw new Error('Environment vars missing:\n'+
                  missing.join('\n'))
}

var express = require('express')
  , tokenRegistry = require('./lib/token.registry').TokenRegistry
  , validatorMixin = require('./lib/validator.mixin')
  , mailer = require('./lib/emailer').Mailer
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , couch = require('./lib/couch.facade')
  , app = express.createServer()

app.use(express.bodyParser());
app.use(express.methodOverride());
// Before router to enable dynamic routing
app.use(express.static(__dirname + '/public'));
app.use(app.router);
app.use(function(req, res){ res.render('404'); });

/**
 * Dynamic helpers
 */
app.dynamicHelpers({
  request: function(req){
     return req;
  }
});


/**
 * EJS Views
 */
app.set('views', __dirname + '/views');
app.register('.html', require('ejs'));
app.set('view engine', 'html');

/**
 * Development configuration
 * enables a '/list' route that shows all tokens
 */
app.configure('development', function() {

  app.use(express.logger());
  app.use(express.errorHandler({ dumpExceptions: true,
                                 showStack: true }));
  var baseUrl = config.HOSTNAME;
  if (config.PORT !== 80) baseUrl += ':' + config.PORT;
  app.set('baseUrl',baseUrl);

  // Enable list in dev mode
  app.get('/list', function(req,res,next) {
    res.send(JSON.stringify(tokenRegistry.getCurrent()));
  });

});

/**
 * Production configuration, no '/list' route that shows all tokens
 */
app.configure('production', function() {
  var baseUrl = config.HOSTNAME;
  if (config.PORT !== 80) baseUrl += ':' + config.PORT;
  app.set('baseUrl',baseUrl);
  app.use(express.errorHandler({ dumpExceptions: false,
                                 showStack: false }));
});

/**
 * Home page
 */
app.get('/', function(req,res,next) {
  res.render('reset-home');
});

app.get('/reset', function (req, res, next) {
  res.render('reset-home');
})

/**
 * Post of request
 */
app.post('/reset', function(req,res,next) {

  // Mixin params for validator
  req.mixinParams();

  var errors = "";

  req.onValidationError(function (msg) {
    errors += msg + "<br/>";
  });

  //Validate user input
  req.check('username', 'You need to enter a valid name').notEmpty();
  req.check('email', 'You need to enter a valid email').isEmail();

  req.sanitize('username').xss();
  req.sanitize('email').xss();

  var responseData;

  if(errors.length == 0) {

    // Ok - now lets give them a token that lasts 1 day
    var expires = new Date((new Date()).getTime() + 1000*60*60*24);
    var tokenId = tokenRegistry.createToken(req.body.username,
                                            req.body.email,
                                            'pending',
                                            expires);

    couch.validateUser(req.params.username, req.params.email,
                       function (isValid, revision) {
      if(isValid) {

        // We need to store the revision to delete it
        tokenRegistry.setRevision(tokenId,revision);

        mailer.sendMail({ tokenId:tokenId,
                          email:req.params.email,
                          username:req.params.username,
                          baseUrl:app.set('baseUrl') }, function(err,result) {
          if(!err) {
            responseData = {
              message: 'Your request has been submitted, '+
                       'if your details are valid you will '+
                       'receive an email with further instructions.'
            };
            res.render("reset",{ locals: responseData });
          } else {
            responseData = {
              message: 'There was a problem sending you an email:'+
                       '<br><pre class="code">' + err + '</pre>' +
                       'This is probably because we have misconfigured ' +
                        'something on the backend, please try again later.'
            };
            res.render("reset",{ locals: responseData });
          }
        });

      } else {
        responseData = {
          message: 'That username was not found in the repository!'
        };
        res.render("reset",{ locals: responseData });
      }
    });

  } else {
    responseData = {
      message: 'There were errors in the information you entered: '+
               '<br><pre class="code">' + errors + '</pre>'
    };
    res.render("reset",{ locals: responseData });
  }

});

/**
 * Confirmation via the email link
 */
app.get('/confirm/:tokenId', function(req,res,next) {

  tokenRegistry.getToken(req.params.tokenId,function(err,token) {
    if (err) {
      return res.render("confirm",{ locals: { err: err, token: token } });
    }

    /**
     * TODO: IF YOU GET TO THIS POINT YOU CAN NOW RESET THE ACCOUNT
     * account details are in token.username / token.email
     */
    couch.deleteUser(token,function(isValid) {
      if(isValid) {
        tokenRegistry.removeToken(req.params.tokenId);
      } else {
        err = {
          message: 'Unable to delete the user from the repository'
        };
      }
      res.render("confirm", { locals: { err: err, token: token } })
    });

  });

});


/**
 * Launch the server
 */
app.listen(config.PORT, function (er) {
  if (er) throw er
  console.log("server started on http://"+app.set('baseUrl'))
});
