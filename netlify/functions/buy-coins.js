// This is your serverless function code
// It's a simple JavaScript function that Netlify will run for you

// This is where you would normally put your bot's API token
// We are using a secure environment variable instead, which is MUCH safer
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// This is the main function that Netlify runs when someone calls your function
exports.handler = async (event, context) => {
    // The event.body is the data sent from your game's frontend
    const body = JSON.parse(event.body);
    
    // You can now access the data from your game
    const { action, amount, stars } = body;

    // This is where the magic happens. You would use your token here
    // to talk to the Telegram API and send an invoice.
    
    if (action === 'buy_coins') {
        // Here, you would call the Telegram API using your token
        // to initiate the Stars payment. For now, let's just return a success message.
        
        // This is where you would use a library like 'node-fetch' to make the API call
        // const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendInvoice`, { ... });

        console.log(`Received a request to buy ${amount} coins for ${stars} Stars.`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Invoice sent successfully! (This is a placeholder)" })
        };
    }
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid action" })
    };
};
