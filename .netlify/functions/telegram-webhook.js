const fetch = require('node-fetch');

// Get the Telegram Bot Token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

exports.handler = async (event) => {
  // If this is a GET request, it's a test from your browser.
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      body: 'Function is alive and responding to GET requests. You should now try the payment button in Telegram.'
    };
  }

  // --- The rest of your existing code remains the same ---

  const update = JSON.parse(event.body);

  // Handle a pre-checkout query (the request to confirm the payment)
  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;

    console.log('Received pre-checkout query:', query);
    
    // ... rest of the pre-checkout logic
  }

  // Handle a successful payment
  if (update.message && update.message.successful_payment) {
    const payment = update.message.successful_payment;

    console.log('Successful payment:', payment);

    // ... rest of the successful payment logic
  }

  return { statusCode: 200, body: 'OK' };
};
