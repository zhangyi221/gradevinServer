var nodemailer = require('nodemailer');
var config = require('../config/email')

// Create a SMTP transporter object
//Gmail
var transporter = nodemailer.createTransport( {
  // host: config.EMAIL_HOST,
  // port: config.EMAIL_PORT,
  service: config.SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  },
  // debug: true
});
// var transporter = nodemailer.createTransport({
//     host: "smtp.163.com",
//     secureConnection: true,
//     port:465,
//     auth: {
//         user: config.EMAIL_USER,
//         pass: config.EMAIL_PASS,
//     }
// });

// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

module.exports = function(mailOptions) {

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});
}