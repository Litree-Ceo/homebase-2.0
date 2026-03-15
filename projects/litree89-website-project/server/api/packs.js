// server/api/packs.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getUser, getPackPrice } = require("../userDb");

router.post("/create-checkout-session", async (req, res) => {
  const { packType, userId } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const price = getPackPrice(packType);
  if (!price) return res.status(400).json({ error: "Invalid pack" });

  try {
    const user = await getUser(userId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${packType.charAt(0).toUpperCase() + packType.slice(1)} Pack`,
              description: `Unlock premium features`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/packs?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/packs?canceled=true`,
      metadata: {
        userId,
        packType,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
