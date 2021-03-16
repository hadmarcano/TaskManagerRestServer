const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
dotenv.config();

// const sendgridAPIKEY = process.env.SENDGRID_API_KEY;
const sendgridAPIKEY =
  "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";

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

module.exports = {
  sendWelcomeEmail,
};
