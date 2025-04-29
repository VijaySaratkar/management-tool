import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Use Gmail service
            port: 465,
            secure: true,
            auth: {
                user: "vijaynuance464@gmail.com",  // Email address from .env file
                pass: "zkik qaqj kkwm coam",  // App password or account password
            },
        });

        const mailOptions = {
            from: "vijaynuance464@gmail.com",  // Sender's email address
            to,                            // Receiver's email address
            subject,                       // Subject of the email
            text,                          // Body of the email
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Email sending failed');
    }
};

export default sendEmail;
