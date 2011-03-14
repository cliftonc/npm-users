/**
 * Simple emailer
 */
var email = require('nodemailer');

exports.Mailer = {

  sendMail: function(params,callback) {

    // CHANGE THESE
    email.SMTP = {
      host: process.env.EMAIL_SMTPHOST,
      port: process.env.EMAIL_SMTPPORT,
      ssl: +process.env.EMAIL_SSL === 0 ? false : true,
      use_authentication: true,
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }

    console.error("sending email to "+params.email)
    var un = params.username.replace(/\n\r\s\t,/g, " ")
      , from = process.env.EMAIL_FROM

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
          + process.env.EMAIL_FROM + "\r\nif you have questions."
          + " \r\n\r\nSincerely,\r\nThe Friendly npm Password Reset Bot"
      }, function(err, result){
        console.error("sent to "+params.email)
        callback(err,result);
      })
  }
}
