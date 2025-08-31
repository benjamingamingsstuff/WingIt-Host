// File: .netlify/functions/create-payment.js

const fetch = require('node-fetch').default;

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1/payment';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);

  try {
    const response = await fetch(NOWPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const paymentData = await response.json();

    if (paymentData.payment_id) {
        // This is the updated URL that includes the pay_currency
        paymentData.invoice_url = `https://nowpayments.io/payment/${paymentData.payment_id}?pay_currency=${paymentData.pay_currency}`;
    }

    return {
      statusCode: response.status,
      body: JSON.stringify(paymentData)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create payment' })
    };
  }
};
