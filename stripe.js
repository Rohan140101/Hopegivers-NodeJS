try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_API);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1477, // $14.77, an easily identifiable amount
        currency: 'inr',
    });
    console.log('Worked! ', paymentIntent.id);
} catch (err) {
    console.log('Error! ', err.message);
}