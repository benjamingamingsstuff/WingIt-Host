const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const { amount, stars, userId } = body;

        if (!amount || !stars || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid request data. Missing amount, stars, or userId." }),
            };
        }

        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendInvoice`;

        const invoiceBody = {
            chat_id: userId,
            title: `Purchase ${amount} Coins`,
            description: `Get ${amount} in-game coins for your character.`,
            payload: `wing_it_purchase_${userId}_${Date.now()}`,
            provider_token: "", // This must be an empty string for Telegram Stars
            currency: "XTR", // "XTR" is the code for Telegram Stars
            prices: [{ label: `${amount} Coins`, amount: stars }],
            start_parameter: `start-param`,
        };

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceBody),
        });

        const telegramResponse = await response.json();

        if (telegramResponse.ok) {
            console.log("Invoice sent successfully:", telegramResponse);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Invoice sent successfully!" }),
            };
        } else {
            console.error("Telegram API Error:", telegramResponse.description);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to send invoice.", error: telegramResponse.description }),
            };
        }
    } catch (error) {
        console.error('An error occurred in the serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An unexpected error occurred." }),
        };
    }
};
