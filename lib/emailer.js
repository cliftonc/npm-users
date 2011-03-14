/**
 * Simple emailer
 */
var email = require('nodemailer');
var config = require('../config')

exports.Mailer = {

  sendMail: function(params,callback) {

    // CHANGE THESE
    email.SMTP = {
      host: config.EMAIL_SMTPHOST,
      port: config.EMAIL_SMTPPORT,
      ssl: +config.EMAIL_SSL === 0 ? false : true,
      use_authentication: true,
      user: config.EMAIL_USERNAME,
      pass: config.EMAIL_PASSWORD
    }

    console.error("sending email to "+params.email)
    var un = params.username.replace(/\n\r\s\t,/g, " ")
      , from = config.EMAIL_FROM

    email.send_mail({
      to : "\"" + un + "\" <" + params.email + ">",
      sender : from,
      reply_to : from,
      subject : "npm Account Reset for " + un,
      body: "You are receiving this because you (or someone else) have "
          + "requested the reset of the '"
          + un
          + "' npm user account.\r\n\r\n"
          + "Please click on the following link, or paste this into your "
          + "browser to complete the process:\r\n\r\n"
          + "    http://" + params.baseUrl + "/confirm/"
          + params.tokenId + "\r\n\r\n"
          + "If you received this in error, you can safely ignore it.\r\n"
          + "The request will expire shortly.\r\n\r\n"
          + "You can reply to this message, or email\r\n    "
          + config.EMAIL_FROM + "\r\nif you have questions."
          + " \r\n\r\nSincerely,\r\nThe Friendly npm Password Reset Bot"
      }, function(err, result){
        console.error("sent to "+params.email)
        callback(err,result);
      })
  }
}
