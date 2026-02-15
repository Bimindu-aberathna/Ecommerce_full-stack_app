/**
 * Order Confirmation Email Template
 */

const orderConfirmationTemplate = (userName, orderDetails) => {
  const { orderId, items, totalAmount, shippingAddress, estimatedDelivery } = orderDetails;
  
  // Generate items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>${item.variety || ''}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmation #${orderId} 📦`,
    text: `
Hi ${userName},

Thank you for your order! Your order #${orderId} has been confirmed.

Order Details:
- Order ID: ${orderId}
- Total Amount: $${totalAmount.toFixed(2)}
- Items: ${items.length} item(s)

${items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

Shipping Address:
${shippingAddress}

Estimated Delivery: ${estimatedDelivery}

We'll send you tracking information once your order ships.

Thank you for shopping with us!
Your E-commerce Store Team
    `,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
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
            color: #28a745;
            margin-bottom: 20px;
        }
        .order-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-table th {
            background-color: #007bff;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .total-row {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .track-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
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
        </div>
        
        <h1 class="title">Order Confirmation ✅</h1>
        
        <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
            
            <div class="order-info">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> #${orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> <span style="color: #28a745; font-size: 18px;">$${totalAmount.toFixed(2)}</span></p>
                <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
            </div>
            
            <h3>Items Ordered:</h3>
            <table class="order-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                        <td colspan="3" style="padding: 15px; text-align: right;">
                            <strong>Total:</strong>
                        </td>
                        <td style="padding: 15px; text-align: right;">
                            <strong>$${totalAmount.toFixed(2)}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="order-info">
                <h3>Shipping Address:</h3>
                <p>${shippingAddress}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/orders/${orderId}" class="track-button">Track Your Order</a>
            </div>
            
            <p>We'll send you tracking information via email once your order ships. You can also track your order anytime by logging into your account.</p>
            
            <p>Thank you for choosing us! 🛍️</p>
        </div>
        
        <div class="footer">
            <p>Need help? Contact our customer support team.</p>
            <p>&copy; 2025 Your E-commerce Store. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `
  };
};

module.exports = { orderConfirmationTemplate };
