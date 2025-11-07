const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const sendOTPEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: `"MNNIT Attendance System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification - OTP for Registration',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .otp-box {
                            background-color: #f8f9fa;
                            border: 2px dashed #667eea;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                            margin: 10px 0;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            color: #6c757d;
                            font-size: 14px;
                        }
                        .info-text {
                            color: #6c757d;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 MNNIT Attendance System</h1>
                            <p style="margin: 5px 0 0 0;">Email Verification</p>
                        </div>
                        <div class="content">
                            <p>Dear ${name},</p>
                            <p>Welcome to the MNNIT Smart Attendance System! To complete your registration, please verify your email address.</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; color: #6c757d; font-size: 14px;">Your OTP Code</p>
                                <div class="otp-code">${otp}</div>
                                <p class="info-text">This code will expire in 10 minutes</p>
                            </div>
                            
                            <p>Please enter this OTP on the registration page to verify your email and complete your account setup.</p>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                    <li>Never share this OTP with anyone</li>
                                    <li>MNNIT Attendance System will never ask for your OTP via phone or email</li>
                                    <li>If you didn't request this OTP, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <p>If you have any questions, please contact your system administrator.</p>
                            
                            <p>Best regards,<br>
                            <strong>MNNIT Attendance System Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply to this message.</p>
                            <p>© 2024 MNNIT Allahabad. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Dear ${name},

Welcome to the MNNIT Smart Attendance System!

Your OTP for email verification is: ${otp}

This code will expire in 10 minutes.

Please enter this OTP on the registration page to verify your email and complete your account setup.

Security Notice:
- Never share this OTP with anyone
- MNNIT Attendance System will never ask for your OTP via phone or email
- If you didn't request this OTP, please ignore this email

Best regards,
MNNIT Attendance System Team

This is an automated email. Please do not reply to this message.
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}: ${info.messageId}`);
        
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error(`Failed to send OTP to ${email}:`, error.message);
        throw new Error('Failed to send OTP email');
    }
};


const validateMNNITEmail = (email) => {
    const emailRegex = /^[a-zA-Z]+\.(\d{8})@mnnit\.ac\.in$/;
    const match = email.match(emailRegex);
    
    if (!match) {
        return {
            isValid: false,
            registrationNumber: null,
            error: 'Invalid email format. Must be: name.12345678@mnnit.ac.in'
        };
    }
    
    return {
        isValid: true,
        registrationNumber: match[1],
        error: null
    };
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    validateMNNITEmail
};