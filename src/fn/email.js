const nodemailer = require('nodemailer');

const { EMAIL_PASS,
    EMAIL } = process.env;

const email = async (emailCliente, subject, html) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: EMAIL_PASS
        }
    });

    let mailOptions = {
        from: EMAIL,
        to: emailCliente,
        subject: subject,
        text: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
};

module.exports = email;