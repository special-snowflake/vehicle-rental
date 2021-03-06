const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASSWORD_SENDER,
  },
});

exports.sendForgotPass = (email, data) => {
  console.log(process.env.EMAIL_SENDER, process.env.PASSWORD_SENDER);
  console.log('data', data);
  console.log('email', email);
  return new Promise((resolve, reject) => {
    const message = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'OTP Reset Password - Vehicle Rental',
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
          * {
              font-family: sans-serif;
          }
          .wrapper {
              border: 1px solid #393939;
              width: min(600px, 90%);
              margin-inline: 5%;
      
          }
          h2 {
              text-align: center;
              background: #F5C361;
              line-height: 50px;
              color: #000000;
          }
          .company{
              font-weight: 700;
              font-size: 30px;
              line-height: 52px;
              color: #1a1a1a;
              text-decoration: none;
              margin-inline: 30px;
          }
          .link {
              display: inline-block;
              width: 250px;
              height: 40px;
              line-height: 40px;
              text-decoration: none;
              color: #ffffff !important;
              font-weight: bold;
              text-align: center;
              background: #c82022;
              margin-inline: 37%;
              border-radius: 10px;
          }
          .link-1{
              text-decoration: none;
          }
          .opening {
              margin-inline: 30px;
              margin-top: 20px;
              font-weight: bold;
          }
          .text {
              margin-inline: 30px;
              margin-top: 6%;
          }
          .info {
              margin-inline: 30px;
              font-size: 13px;
              color: gray;
          }
          .code-wrapper{
              margin-inline: 30px;
              margin-top: 50px;
              margin-bottom: 5%;
              text-align: center;
          }
          .code {
              padding: 10px 15px;
              border: 1px solid #e5e7e9;
              border-radius: 8px;
              color: rgba(49,53,59,0.96);
              font-size: 22px;
              font-weight: bold;
              text-decoration: none;
          }
      </style>
      </head>
      <body>
          <div class="wrapper">
              <h2>Hi, ${data.name ? data.name : 'Beloved User'}</h2>
              <span class="company">Vehicle Rental</span>
              <p class="opening">Please enter code below to 
              proceed your reset password request.</p>
              <div class="code-wrapper">
                  <u class="code">${data.otp}</u>
              </div>
              <p class="text">If you don't request reset password 
              please ignore this e-mail.</p>
              <p class="info">*This is an automated email, 
              please don't reply.</p>
          </div>
      </body>
      </html>`,
    };
    transporter.sendMail(message, (error, info) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};
