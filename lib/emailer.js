/**
 * Simple emailer
 */
var email = require('nodemailer');
	
exports.Mailer = {
				
	sendMail: function(params,callback) {

		// CHANGE THESE
		email.SMTP = {
				  host: "smtp.gmail.com",
				  port: 465,
				  ssl: true,
				  use_authentication: true,
				  user: "<EMAIL>@gmail.com",
				  pass: "<PASSWORD>"
		}
		
		email.send_mail({		 
		  to : params.email,
		  sender : params.helpEmail,
		  subject : "NPM Account Reset for " + params.username,
		  body: "This email has been sent as you (@" + params.username + ") requested the reset of your NPM user account. \r\n\r\n Please click on the following link, or paste this into your " +
		  		"browser to complete the process: http://" + params.baseUrl + "/confirm/" + params.tokenId + "\r\n\r\n" +
		  		"If you received this in error, please contact: " + params.helpEmail
		},
		function(err, result){
		  callback(err,result);
		});
		
	}
}