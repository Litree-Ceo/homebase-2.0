// server/api/webhook.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { buyPack } = require("../userDb");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { userId, packType } = session.metadata;

      if (userId && packType) {
        try {
          await buyPack(userId, packType);
          console.log(`Pack ${packType} granted to user ${userId}`);
        } catch (err) {
          console.error("Error granting pack:", err);
        }
      }
    }

    res.json({ received: true });
  }
);

module.exports = router;
