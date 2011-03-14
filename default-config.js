// set these to appropriate values, and then rename this file to "config.js"

// the couchdb where you want to reset accounts.
exports.COUCH="localhost:5984"
exports.COUCH_USERDB="_users"
exports.COUCH_ADMIN="adminuser:adminpass"
exports.COUCH_SSL=0

// email login information.
exports.EMAIL_USERNAME="clifton.cunningham@gmail.com"
exports.EMAIL_PASSWORD="mypassword"
exports.EMAIL_SMTPHOST="smtp.gmail.com"
exports.EMAIL_SMTPPORT=465
exports.EMAIL_SSL=1

// Important!  If using gmail, then you need to have established
// this as an email address that you can send from.
exports.EMAIL_FROM='"The npm Password Reset Bot" <user-account-bot@npmjs.org>'

// where the website is running
exports.HOSTNAME="localhost"
exports.PORT=3000

// change to "development" to enable the /list page.
// Make sure to change to production before pushing live!
exports.NODE_ENV="production"
