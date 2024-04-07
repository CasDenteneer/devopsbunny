const MessageHandler = require('../messagebroker');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../database/user');

class MailerService {
    constructor() {
        this.messageHandler = new MessageHandler();
        // listen to user_registered, clock_expired
        this.messageHandler.startListening('send_welcome_user_mail', this.onUserRegistered.bind(this));
        this.messageHandler.startListening('target.score.calculated', this.onTargetClockExpired.bind(this));

    }

    async onMessageReceived(parsedMessage) {
        console.log('Message received:', parsedMessage);
    }

    async onUserRegistered(parsedMessage) {
        console.log('User registered:', parsedMessage);
        let email = parsedMessage.email;
        if (email) {
            // send mail
            let username = parsedMessage.username;

            let contents = `Welcome ${username}! You have successfully registered!`;

            console.log('Sending email to', email);
            console.log('Contents:', contents);

            // save the user
            const newUser = new User({
                id: parsedMessage.id,
                email: email,
            });

            try {
                await newUser.save();
                console.log('User saved to database');
            } catch (error) {
                console.error('Error saving user to database:', error);
            }

            // this.sendEmail(email, contents);
        }
    }

    async onTargetClockExpired(parsedMessage) {
        console.log('Target clock expired:', parsedMessage);
        console.log('Sending emails with score')
        // send mail
        // this.sendEmail();
    }

    sendEmail(email, contents) {
        console.log('Sending email to', email);
        console.log('Contents:', contents);

        
        // Create a transporter using your email service provider's SMTP settings
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // Use SSL/TLS
            auth: {
                user:  process.env.SMTP_USER,
                pass:  process.env.SMTP_PASS
            }
        });

        // Define the email options
        const mailOptions = {
            from:  process.env.SMTP_USER,
            to: email,
            subject: 'Photo prestiges!',
            text: contents
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

    }
}

module.exports = MailerService;