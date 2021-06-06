const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
dotenv.config();

const sendgridAPIKEY = process.env.SENDGRID_API_KEY;
// "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";

sgMail.setApiKey(sendgridAPIKEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: `${email}`, // Change to your recipient
    from: "hadmarcano@gmail.com", // Change to your verified sender
    subject: "Thanks for joining in!",
    text: `Hello ${name}!, welcome to Task App by Héctor Diaz!... Let me know how you get along with the app.`,
    // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  sgMail
    .send(msg)
    .then((response) => response)
    .catch((error) => console.log(error));
};

const sendCancelationEmail = (email, name) => {
  const msg = {
    to: `${email}`,
    from: "hadmarcano@gmail.com",
    subject: "See you soon!",
    text: `${name}, Unfortunately, this time we say goodbye, grateful to have been part of our community. We hope you come back soon, Greetings!`,
  };
  sgMail
    .send(msg)
    .then((response) => response)
    .catch((error) => console.log(error));
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
