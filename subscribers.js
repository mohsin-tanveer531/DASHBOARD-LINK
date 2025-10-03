// routes/subscribers.js
import express from "express";
import Stripe from "stripe";
import { Site } from "../models/Site.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.get("/sites/:siteId/subscribers", async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ error: "Site not found" });

    const subs = await stripe.subscriptions.list({
      status: "active",                 // or "all"
      price: site.stripePriceId,        // filter to this site's plan/price
      limit: 100,
      expand: ["data.customer"]
    });

    const result = subs.data.map(s => {
      const c = s.customer;
      return {
        subscriptionId: s.id,
        status: s.status,
        created: s.created * 1000, 
        cancelAtPeriodEnd: s.cancel_at_period_end,
        // currentPeriodEnd: new Date(s.current_period_end * 1000),
        customer: {
          id: typeof c === "string" ? c : c.id,
          email: typeof c === "string" ? undefined : c.email,
          name: typeof c === "string" ? undefined : c.name,
        }
      };
    });
    result.sort((a, b) => b.created - a.created);
    res.json({ count: result.length, subscribers: result, hasMore: subs.has_more });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list subscribers" });
  }
});

export default router;
