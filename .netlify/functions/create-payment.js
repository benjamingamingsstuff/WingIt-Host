// File: .netlify/functions/create-payment.js
// File: game.js

// Add this line to the very top of the file
console.log('game.js is running');

const CREATE_PAYMENT_URL = "https://your-netlify-app-name.netlify.app/.netlify/functions/create-payment";

async function buyCoins() {
    // Add this line to the very top of the function
    console.log('buyCoins function triggered');

    const data = {
        price_amount: 0.99,
        price_currency: "usd",
        pay_currency: "ton",
        order_id: `player123_${Date.now()}`,
        order_description: "In-game coins",
        // The Crypto Pay API does not use these parameters, but we can leave them for consistency
        ipn_callback_url: "https://your-netlify-app-name.netlify.app/.netlify/functions/verify-payment",
        success_url: "https://your-netlify-app-name.netlify.app/success.html",
    };

    // ... rest of the code is the same ...
}

// ... rest of the file is the same ...

import fetch from 'node-fetch';

const CRYPTO_PAY_API_KEY = process.env.CRYPTO_PAY_API_KEY;
const CRYPTO_PAY_API_URL = 'https://pay.crypt.bot/api/createInvoice';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);

  // This should now output to your logs
  console.log('API Key from environment variable:', CRYPTO_PAY_API_KEY);

  try {
    const requestBody = {
      asset: 'TON',
      amount: data.price_amount.toString(),
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
