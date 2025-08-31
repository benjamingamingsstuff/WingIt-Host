// File: verify-payment.js

// You will need to install this library: npm install crypto
const crypto = require('crypto');

// This key MUST be stored as a Netlify environment variable, NOT in the code.
const IPN_SECRET_KEY = process.env.NOWPAYMENTS_IPN_SECRET;

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Get the signature from the request header
  const signature = event.headers['x-nowpayments-sig'];
  const body = JSON.parse(event.body);

  // Recreate the signature on our side
  const sortedBody = JSON.stringify(body, Object.keys(body).sort());
  const hmac = crypto.createHmac('sha512', IPN_SECRET_KEY);
  hmac.update(sortedBody);
  const calculatedSignature = hmac.digest('hex');

  // Verify the signature. This is the most important security check.
  if (calculatedSignature !== signature) {
    return {
      statusCode: 403,
      body: 'Invalid signature',
    };
  }

  // Check the payment status
  if (body.payment_status === 'finished') {
    // The payment is complete and verified!
    // This is where you would update your game's database.
    console.log(`Payment confirmed for order ID: ${body.order_id}`);

    // Return a success response to NOWPayments
    return {
      statusCode: 200,
      body: 'Payment confirmed and credited.',
    };
  } else {
    // Payment is not finished, but the webhook is valid
    console.log(`Payment status update for order ID ${body.order_id}: ${body.payment_status}`);
    return {
      statusCode: 200,
      body: `Status updated: ${body.payment_status}`,
    };
  }
