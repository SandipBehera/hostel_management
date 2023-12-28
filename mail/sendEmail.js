const nodemailer = require("nodemailer");

exports.sendEmail = async (content, recipientEmail, subject) => {
  // Create a transporter using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Replace with your SMTP server host
    port: 587, // Replace with your SMTP server port
    secure: false, // true for 465, false for other ports
    auth: {
      user: "hello@clumpssoftware.com", // Replace with your email address
      pass: "clumps@0823", // Replace with your email password
    },
  });

  // Send mail with defined transport object
  let info = await transporter.sendMail({
    from: "hello@clumpssoftware.com", // sender address
    to: recipientEmail, // list of receivers
    subject: subject, // Subject line
    html: content, // html body
  });

  console.log("Message sent: %s", info.messageId);
};
