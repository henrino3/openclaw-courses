const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { tier } = req.body || {};
  const tiers = {
    starter: { amount: 2900, name: 'OpenClaw Starter', description: 'Starter tier — basics of OpenClaw' },
    pro: { amount: 9900, name: 'OpenClaw Pro', description: 'Pro tier — advanced workflows & automation' },
    enterprise: { amount: 29900, name: 'OpenClaw Enterprise', description: 'Enterprise tier — full platform mastery + support' },
  };
  const selected = tiers[tier] || tiers.starter;
  const origin = `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: selected.name, description: selected.description },
          unit_amount: selected.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel.html`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
