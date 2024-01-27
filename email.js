const nodemailer = require('nodemailer');
const pug = require('pug');
const Transport = require('nodemailer-brevo-transport');
const { htmlToText } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sushil MAurya ${process.env.EMAIL_FROM}`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      const transporter = nodemailer.createTransport(
        new Transport({ apiKey: process.env.EMAIL_API })
      );
      return transporter;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  // send actual email
  async send(template, subject) {
    // render html for email from pug template
    const html = pug.renderFile(`${__dirname}/./views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    // define email options
    const mailoptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };
    // craete transport send email
    await this.newTransport().sendMail(mailoptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'welcome to the natours Family');
  }
  async sendresetPassword() {
    await this.send(
      'password_reset',
      'Your password reset token vlaid for 10 minutes'
    );
  }
};

// const sendEmail = async options => {
//   // let transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD
//   //   }
//   // });
//   // const mailoptions = {
//   //   from: 'Sushil MAurya <hello@sushil.io>',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message
//   // };
//   await transporter.sendMail(mailoptions);
// };
