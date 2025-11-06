const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send attendance confirmation email
const sendAttendanceEmail = async (studentEmail, studentName, sessionName, confidence, attendancePercentage, subjectName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: `✅ Attendance Marked - ${subjectName}`,
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
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .success-icon {
                            font-size: 48px;
                            margin-bottom: 10px;
                        }
                        .info-box {
                            background: #f0f7ff;
                            border-left: 4px solid #667eea;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-weight: bold;
                            color: #666;
                        }
                        .value {
                            color: #333;
                        }
                        .percentage {
                            font-size: 36px;
                            font-weight: bold;
                            color: ${attendancePercentage >= 75 ? '#28a745' : attendancePercentage >= 60 ? '#ffc107' : '#dc3545'};
                            text-align: center;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="success-icon">✅</div>
                            <h1 style="margin: 0;">Attendance Marked Successfully</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${studentName}</strong>,</p>
                            <p>Your attendance has been successfully marked for the following session:</p>
                            
                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Session:</span>
                                    <span class="value">${sessionName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Subject:</span>
                                    <span class="value">${subjectName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Recognition Confidence:</span>
                                    <span class="value">${(confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Date & Time:</span>
                                    <span class="value">${new Date().toLocaleString()}</span>
                                </div>
                            </div>

                            <h3 style="text-align: center; color: #667eea;">Your Attendance for ${subjectName}</h3>
                            <div class="percentage">${attendancePercentage.toFixed(1)}%</div>
                            <p style="text-align: center; color: #666;">
                                ${attendancePercentage >= 75 ? '🎉 Great job! Keep it up!' :
                    attendancePercentage >= 60 ? '⚠️ You\'re doing okay, but try to improve!' :
                        '❗ Warning: Your attendance is below 60%'}
                            </p>

                            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                                This is an automated email from the Smart Attendance System. 
                                If you believe this is an error, please contact your administrator.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Smart Attendance System | Powered by Face Recognition Technology</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Attendance email sent to ${studentEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Send absent notification email
const sendAbsentEmail = async (studentEmail, studentName, sessionName, subjectName, attendancePercentage) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: studentEmail,
            subject: `⚠️ Absent Alert - ${subjectName}`,
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
                            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .warning-icon {
                            font-size: 48px;
                            margin-bottom: 10px;
                        }
                        .info-box {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                        }
                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-weight: bold;
                            color: #666;
                        }
                        .value {
                            color: #333;
                        }
                        .percentage {
                            font-size: 36px;
                            font-weight: bold;
                            color: ${attendancePercentage >= 75 ? '#28a745' : attendancePercentage >= 60 ? '#ffc107' : '#dc3545'};
                            text-align: center;
                            margin: 20px 0;
                        }
                        .alert-box {
                            background: #f8d7da;
                            border: 1px solid #f5c6cb;
                            color: #721c24;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="warning-icon">⚠️</div>
                            <h1 style="margin: 0;">Attendance Alert: You Were Absent</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${studentName}</strong>,</p>
                            <p>This is to inform you that you were marked <strong>ABSENT</strong> for the following session:</p>
                            
                            <div class="info-box">
                                <div class="info-row">
                                    <span class="label">Session:</span>
                                    <span class="value">${sessionName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Subject:</span>
                                    <span class="value">${subjectName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="label">Date & Time:</span>
                                    <span class="value">${new Date().toLocaleString()}</span>
                                </div>
                            </div>

                            <div class="alert-box">
                                <strong>⚠️ Important:</strong> If you were present in class but your attendance was not captured, 
                                please contact your professor immediately with proof of attendance.
                            </div>

                            <h3 style="text-align: center; color: #dc3545;">Your Attendance for ${subjectName}</h3>
                            <div class="percentage">${attendancePercentage.toFixed(1)}%</div>
                            <p style="text-align: center; color: #666;">
                                ${attendancePercentage >= 75 ? '✓ You\'re doing well, but don\'t miss more classes!' :
                    attendancePercentage >= 60 ? '⚠️ Warning: Your attendance is getting low!' :
                        '❗ Critical: Your attendance is below 60%! Take immediate action!'}
                            </p>

                            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                                <strong>Possible Reasons for Absence:</strong><br>
                                • You were not present in class<br>
                                • Face recognition failed (poor lighting, angle, etc.)<br>
                                • Technical issues during capture<br>
                                <br>
                                If you believe this is an error, contact your professor with evidence of your presence.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Smart Attendance System | Powered by Face Recognition Technology</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Absent email sent to ${studentEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending absent email:', error);
        return false;
    }
};

module.exports = {
    sendAttendanceEmail,
    sendAbsentEmail
};
