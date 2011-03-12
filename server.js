/**
 * Very lightweight server, use Express to enable a small amount of flex
 * Basic requirements for password reset
 * 
 * TODO: Link to couch to actually delete the user!
 * 
 */
var express = require('express'), 
	tokenRegistry = require('./lib/token.registry').TokenRegistry,
	validatorMixin = require('./lib/validator.mixin'),
	mailer = require('./lib/emailer').Mailer,
	check = require('validator').check,
	sanitize = require('validator').sanitize;

/**
 * Initial configuration of the Express server
 */
var app = express.createServer();
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));  // Before router to enable dynamic routing
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
 * Development configuration, enables a '/list' route that shows all tokens
 */
app.configure('development', function() {
	
	app.use(express.logger());
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	
	app.set('baseUrl','localhost:3000');
	app.set('helpEmail','<EMAIL>@gmail.com');
	
	// Enable list in dev mode
	app.get('/list', function(req,res,next) {	
		res.send(JSON.stringify(tokenRegistry.getCurrent()));
	});
	
});

/**
 * Production configuration, no '/list' route that shows all tokens
 */
app.configure('production', function() {	
	app.set('baseUrl','localhost:3000');
	app.set('helpEmail','<EMAIL>@gmail.com');	
	app.use(express.errorHandler({ dumpExceptions: false, showStack: false }));
});


/**
 * Home page
 */
app.get('/', function(req,res,next) {
	res.render('home');
});

/**
 * Post of request
 */
app.post('/reset', function(req,res,next) {
		
	// Mixin params for validator
	req.mixinParams();

	var errors = [];
	
	req.onValidationError(function (msg) {
    	errors.push(msg);    			
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
    	var tokenId = tokenRegistry.createToken(req.body.username, req.body.email, 'pending', expires);
    	    
    	// SMTP settings for the emailer are in lib/emailer.js
    	mailer.sendMail({
	    			tokenId:tokenId,
	    			email:req.params.email,
	    			username:req.params.username,
	    			baseUrl:app.set('baseUrl'),
	    			helpEmail:app.set('helpEmail')
	    }, function(err,result) {
	    	
	    	if(!err) {
	        	responseData = {message:'Your request has been submitted, if your details are valid you will receive an email with further instructions.'};
	    		res.render("reset",{locals:responseData});
	    	} else {
	        	responseData = {message:'There was a problem sending you an email:<br/><pre class="code">' + err + '</pre>This is probably because we have misconfigured something on the backend, please try again later.'};
	    		res.render("reset",{locals:responseData});		
	    	}
	    	
	    });
    	
    	
    	
    } else {
    	
    	responseData = {message:'There were errors in the information you entered: <br><pre class="code">' + JSON.stringify(errors) + '</pre>'};
    	res.render("reset",{locals:responseData});
    	
    }
       		
});


/**
 * Confirmation via the email link
 */
app.get('/confirm/:tokenId', function(req,res,next) {

	tokenRegistry.getToken(req.params.tokenId,function(err,token) {
		
		if(!err) {			
			
			/**
			 * TODO: IF YOU GET TO THIS POINT YOU CAN NOW RESET THE ACCOUNT
			 * account details are in token.username / token.email
			 */							
			
			// Clean up
			tokenRegistry.removeToken(req.params.tokenId);
			
		};
		
		res.render("confirm",{locals:{err:err,token:token}});
	});	
		
});


/**
 * Launch the server
 */
app.listen(3000);