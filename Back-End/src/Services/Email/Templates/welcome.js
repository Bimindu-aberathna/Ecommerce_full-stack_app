/**
 * Welcome Email Template
 */

const welcomeTemplate = (userName, loginUrl) => {
  return {
    subject: 'Welcome to Our Store! 🎉',
    text: `
Hi ${userName},

Welcome to Your E-commerce Store!

Thank you for joining us. We're excited to have you as part of our community.

You can now:
- Browse our extensive product catalog
- Add items to your wishlist
- Enjoy exclusive member deals
- Track your orders

Get started: ${loginUrl}

If you have any questions, feel free to contact our support team.

Happy shopping!
Your E-commerce Store Team
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Store</title>
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
        .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .title {
            color: #28a745;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #0056b3;
        }
        .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .feature-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
        }
        .feature-item:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
        .footer {
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🛒 Your E-commerce Store</div>
            <div class="welcome-icon">🎉</div>
        </div>
        
        <h1 class="title">Welcome, ${userName}!</h1>
        
        <div class="content">
            <p>Thank you for joining <strong>Your E-commerce Store</strong>! We're thrilled to have you as part of our community.</p>
            
            <div class="features">
                <h3>What you can do now:</h3>
                <div class="feature-item">Browse our extensive product catalog</div>
                <div class="feature-item">Add items to your wishlist and cart</div>
                <div class="feature-item">Enjoy exclusive member deals and discounts</div>
                <div class="feature-item">Track your orders in real-time</div>
                <div class="feature-item">Get personalized product recommendations</div>
            </div>
            
            <div style="text-align: center;">
                <a href="${loginUrl}" class="cta-button">Start Shopping Now</a>
            </div>
            
            <p>If you have any questions or need assistance, our customer support team is here to help. Don't hesitate to reach out!</p>
            
            <p>Happy shopping! 🛍️</p>
        </div>
        
        <div class="footer">
            <p>This email was sent from a secure, automated system.</p>
            <p>&copy; 2025 Your E-commerce Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  };
};

module.exports = { welcomeTemplate };
