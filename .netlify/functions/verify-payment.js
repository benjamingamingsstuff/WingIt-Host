// File: .netlify/functions/verify-payment.js

const fetch = require('node-fetch').default;

// Get your API token from @CryptoBot
const CRYPTO_PAY_API_KEY = process.env.CRYPTO_PAY_API_KEY;

exports.handler = async (event) => {
    // The webhook from Crypto Pay will be a POST request
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const payload = JSON.parse(event.body);

    // This is the data that Crypto Pay sends to your server
    const invoice = payload.invoice;
    
    // We only want to process paid invoices
    if (invoice && invoice.status === 'paid') {
        const orderId = invoice.payload;
        
        // This is where you would update your user's account with the coins
        // For example:
        // await updateUserCoins(orderId);

        console.log(`Payment successful for order ID: ${orderId}`);

        // You must return a 200 OK status to let Crypto Pay know you received the webhook
        return {
            statusCode: 200,
            body: 'OK'
        };
    }

    return {
        statusCode: 400,
        body: 'Invalid request'
    };
};
