// File: .netlify/functions/create-payment.js

const fetch = require('node-fetch').default;

const CRYPTO_PAY_API_KEY = process.env.CRYPTO_PAY_API_KEY;
const CRYPTO_PAY_API_URL = 'https://pay.crypt.bot/api/createInvoice';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);

  // ADD THIS LINE TO CHECK IF THE KEY IS BEING READ
  console.log('API Key from environment variable:', CRYPTO_PAY_API_KEY);

  try {
    const requestBody = {
      asset: 'TON',
      amount: data.price_amount, 
      description: data.order_description,
      payload: data.order_id,
    };

    const response = await fetch(CRYPTO_PAY_API_URL, {
      method: 'POST',
      headers: {
        'Crypto-Pay-API-Token': CRYPTO_PAY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const paymentData = await response.json();

    if (paymentData.ok && paymentData.result) {
        return {
            statusCode: 200,
            body: JSON.stringify({ invoice_url: paymentData.result.pay_url })
        };
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Failed to create payment', details: paymentData })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: error.message })
    };
  }
};
