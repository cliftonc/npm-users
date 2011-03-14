/**
 * Simple emailer
 * ENV EMAIL_PASSWORD 
 */
var email = require('nodemailer');

exports.Mailer = {

  sendMail: function(params,callback) {

    // CHANGE THESE
    email.SMTP = {
      host: process.env.EMAIL_SMTPHOST,
      port: process.env.EMAIL_SMTPPORT,
      ssl: true,
      use_authentication: true,
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }

    console.error("about to send email")
    email.send_mail({
      to : params.email,
      sender : process.env.EMAIL_FROM,
      subject : "npm Account Reset for " + params.username,
      body: "You are receiving this because you (or someone else) have "
          + "requested the reset of the '"
          + params.username
          + "' npm user account. \r\n\r\n "
          + "Please click on the following link, or paste this into your "
          + "browser to complete the process: \r\n\r\n "
          + "    http://" + params.baseUrl + "/confirm/"
          + params.tokenId + "\r\n\r\n"
          + "If you received this in error, ignore this message, and "
          + "the request will expire shortly. \r\n\r\n Or reply to "
          + process.env.EMAIL_FROM + " if you have questions."
          + " \r\n\r\n Sincerely,\r\nThe Friendly npm Password Reset Bot"
      }, function(err, result){
        console.error("Back from sending email")
        callback(err,result);
      })
  }
}
