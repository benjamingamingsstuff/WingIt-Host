const fetch = require('node-fetch');

// Get the Telegram Bot Token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

exports.handler = async (event) => {
  // Only process POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const update = JSON.parse(event.body);

  // Handle a pre-checkout query (the request to confirm the payment)
  if (update.pre_checkout_query) {
    const query = update.pre_checkout_query;

    console.log('Received pre-checkout query:', query);

    // You can add your own validation logic here
    // For example, check the payload, verify the item, etc.
    const isPaymentValid = true; 

    const result = {
      pre_checkout_query_id: query.id,
      ok: isPaymentValid,
    };

    if (!isPaymentValid) {
      // Provide an error message if the payment isn't valid
      result.error_message = 'Something went wrong. Please try again later.';
    }

    try {
      const response = await fetch(`${TELEGRAM_API_URL}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        throw new Error(`Telegram API responded with status: ${response.status}`);
      }

      console.log('Successfully answered pre-checkout query.');

      return { statusCode: 200, body: 'Pre-checkout query handled.' };

    } catch (error) {
      console.error('Error answering pre-checkout query:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  }

  // Handle a successful payment
  if (update.message && update.message.successful_payment) {
    const payment = update.message.successful_payment;

    console.log('Successful payment:', payment);

    // TODO: Implement your logic to deliver the digital goods
    // For example:
    // - Save the transaction to a database
    // - Update the user's in-game currency or unlock an item
    const chatId = update.message.chat.id;
    const userId = update.message.from.id;
    const invoicePayload = payment.invoice_payload;
    const starsAmount = payment.total_amount;

    console.log(`Payment received from user ${userId} for ${starsAmount} Stars, payload: ${invoicePayload}`);

    // Optionally, send a confirmation message back to the user
    try {
      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Thank you for your purchase of ${starsAmount} Stars worth of goods!`,
        }),
      });

      console.log('Sent payment confirmation message.');
    } catch (error) {
      console.error('Error sending confirmation message:', error);
    }

    return { statusCode: 200, body: 'Successful payment handled.' };
  }

  // Acknowledge the webhook request even if it's not a payment update
  return { statusCode: 200, body: 'OK' };
};
