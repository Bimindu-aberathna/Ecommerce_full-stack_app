const nodemailer = require("nodemailer");
require('dotenv').config();

// Import email templates
const { passwordResetTemplate } = require('./Templates/passwordReset');
const { welcomeTemplate } = require('./Templates/welcome');
const { orderConfirmationTemplate } = require('./Templates/orderConfirmation');


const transporter = nodemailer.createTransport({
  service: 'yahoo', 
  pool: true, // ♻️ enable connection pooling
  maxConnections: 5, // optional – defaults to 5
  maxMessages: 100, // optional – defaults to 100
  auth: {
    user: process.env.SMTP_USER, // Your Yahoo address
    pass: process.env.SMTP_PASS, // Your Yahoo App Password
  },
});

/**
 * Send email function
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Your Store'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email using template
 */
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/forgot-password?token=${resetToken}`;
  const template = passwordResetTemplate(userName, resetUrl, '1 hour');
  
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

/**
 * Send welcome email using template
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
  const template = welcomeTemplate(userName, loginUrl);
  
  return await sendEmail({
    to: userEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

/**
 * Send order confirmation email using template
 */const sendOrderConfirmationEmail = async (userEmail, userName, orderData) => {
  try {
    // Prepare order details for the template
    const orderDetails = {
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      items: orderData.items || [],
      totalAmount: parseFloat(orderData.totalAmount || 0),
      shippingAddress: orderData.shippingAddress,
      postalCode: orderData.postalCode,
      phoneNumber: orderData.phoneNumber,
      currency: 'LKR',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    const template = orderConfirmationTemplate(userName, orderDetails);
    
    return await sendEmail({
      to: userEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify connection
 */
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('Gmail SMTP connection verified ✅');
    return true;
  } catch (error) {
    console.error('Gmail SMTP connection failed ❌', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  verifyConnection,
  transporter
};