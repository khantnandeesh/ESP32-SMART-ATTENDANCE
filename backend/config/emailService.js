const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASSWORD // your email password or app password
    }
});

// Alternative configuration for custom SMTP
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: true,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

const sendAttendanceEmail = async ({
    studentEmail,
    studentName,
    registrationNumber,
    sessionName,
    confidence,
    markedAt
}) => {
    try {
        const formattedDate = new Date(markedAt).toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
        });

        const mailOptions = {
            from: `"Attendance System" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Attendance Recorded - ${sessionName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .info-box {
                            background-color: #f0f0f0;
                            padding: 15px;
                            border-left: 4px solid #4CAF50;
                            margin: 20px 0;
                        }
                        .info-row {
                            margin: 10px 0;
                        }
                        .label {
                            font-weight: bold;
                            color: #555;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #777;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>✓ Attendance Confirmed</h2>
                        </div>
                        <div class="content">
                            <p>Dear ${studentName},</p>
                            <p>Your attendance has been successfully recorded for the following session:</p>
                            
                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Session:</span> ${sessionName}
                                </div>
                                <div class="info-row">
                                    <span class="label">Registration Number:</span> ${registrationNumber}
                                </div>
                                <div class="info-row">
                                    <span class="label">Date & Time:</span> ${formattedDate}
                                </div>
                                <div class="info-row">
                                    <span class="label">Recognition Accuracy:</span> ${(confidence * 100).toFixed(1)}%
                                </div>
                            </div>
                            
                            <p>Your presence has been recorded in our system. No further action is required from your side.</p>
                            
                            <p>If you have any questions or believe this is an error, please contact your administrator.</p>
                            
                            <p>Best regards,<br>Attendance System</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Dear ${studentName},

Your attendance has been successfully recorded.

Session: ${sessionName}
Registration Number: ${registrationNumber}
Date & Time: ${formattedDate}
Recognition Accuracy: ${(confidence * 100).toFixed(1)}%

Your presence has been recorded in our system. No further action is required from your side.

If you have any questions or believe this is an error, please contact your administrator.

Best regards,
Attendance System
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${studentEmail}: ${info.messageId}`);
        
        return {
            success: true,
            messageId: info.messageId,
            email: studentEmail
        };
    } catch (error) {
        console.error(`Failed to send email to ${studentEmail}:`, error.message);
        return {
            success: false,
            error: error.message,
            email: studentEmail
        };
    }
};

module.exports = {
    sendAttendanceEmail,
    transporter
};