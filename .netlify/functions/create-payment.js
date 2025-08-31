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
    const requestBody = {
      price_amount: data.price_amount,
      price_currency: data.price_currency,
      pay_currency: 'ton', // Hardcode TON to ensure it's sent correctly
      order_id: data.order_id,
      order_description: data.order_description,
      ipn_callback_url: data.ipn_callback_url,
      success_url: data.success_url,
    };

    const response = await fetch(NOWPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const paymentData = await response.json();

    // Log the full response from NOWPayments for debugging
    console.log('NOWPayments API Response:', JSON.stringify(paymentData, null, 2));

    if (paymentData.payment_id) {
        paymentData.invoice_url = `https://nowpayments.io/payment/?iid=${paymentData.payment_id}`;
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
