/**
 * Password Reset Email Template
 */

const passwordResetTemplate = (userName, resetUrl, expirationTime = '1 hour') => {
  return {
    subject: 'Password Reset Request 🔐',
    text: `
Hi ${userName},

You requested a password reset for your account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expirationTime}.

If you didn't request this password reset, please ignore this email.

Best regards,
Your E-commerce Store Team
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        .title {
            color: #333;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .reset-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .reset-button:hover {
            background-color: #c82333;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
        }
        .link-fallback {
            word-break: break-all;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛒 Your E-commerce Store</div>
        </div>
        
        <h1 class="title">Password Reset Request</h1>
        
        <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset your password for your account. If you made this request, click the button below to set a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This link will expire in <strong>${expirationTime}</strong> for security reasons.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <div class="link-fallback">${resetUrl}</div>
            
            <p><strong>If you didn't request this password reset:</strong></p>
            <ul>
                <li>You can safely ignore this email</li>
                <li>Your password will not be changed</li>
                <li>Consider changing your password if you're concerned about security</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This email was sent from a secure, automated system. Please do not reply to this email.</p>
            <p>If you're having trouble with the reset process, please contact our support team.</p>
            <p>&copy; 2025 Your E-commerce Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  };
};

module.exports = { passwordResetTemplate };
