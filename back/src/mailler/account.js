const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, pseudo) => {
  sgMail.send({
    to: email,
    from: process.env.EMAIL_SMURF,
    subject: "Thank you for joining The Social Smurfs Network",
    text: `Welcome to The Social Smurfs Network, ${ pseudo }.`
  });
};

const sendCancelationEmail = (email, pseudo) => {
  sgMail.send({
    to: email,
    from: process.env.EMAIL_SMURF,
    subject: "Thank you for use The Social Smurfs Network",
    text: `We wish you a good continuation The Social Smurfs Network, Goodbye ${ pseudo }.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
