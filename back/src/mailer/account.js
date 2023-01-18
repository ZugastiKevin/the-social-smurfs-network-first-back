const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTPHOST,
  port: process.env.SMTPPORT,
  secure: true,
  auth: {
    user: process.env.SMTPUSER,
    pass: process.env.SMTPPASS,
  },
});

const sendWelcomeEmail = (email, pseudo) => {
  transporter.sendMail({
    from: process.env.EMAIL_SMURF,
    to: email,
    subject: "Thank you for joining The Social Smurfs Network",
    text: `Welcome to The Social Smurfs Network, ${ pseudo }.`
  });
};

const sendCancelationEmail = (email, pseudo) => {
  transporter.sendMail({
    from: process.env.EMAIL_SMURF,
    to: email,
    subject: "Thank you for use The Social Smurfs Network",
    text: `We wish you a good continuation The Social Smurfs Network, Goodbye ${ pseudo }.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
