// import dotenv from 'dotenv'
// import express from 'express'
// import Stripe from 'stripe'
// import { Link } from '../models/Links.js'
// import { Site } from '../models/Site.js'
// dotenv.config();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
// const router = express.Router()

//when we will use the lower it is for localhost 

// router.get('/:token', async (req, res) => {
//   const { token } = req.params
//   const link = await Link.findOne({ token }).populate('site')
//   if (!link) return res.status(404).send('Link not found')
//   if (link.status !== 'pending') return res.redirect(`${link.site.url}`)

//   // mark “initiated”
//   link.status = 'initiated'
//   await link.save()

//   // build the Stripe session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     line_items: [{
//       price: link.site.stripePriceId,
//       quantity: 1,
//     }],
//     mode: 'subscription',
//     success_url: `${process.env.APP_BASE_URL}/links/${link.site._id}`,
//     cancel_url:  `${process.env.APP_BASE_URL}/links/${link.site._id}`,
//     metadata: { token },
//   })
// res.set('ngrok-skip-browser-warning', 'true');
//   // send them off to Stripe
//   res.redirect(303, session.url)
// })

// export default router
// redirect.js
import dotenv from 'dotenv'
import express from 'express'
import Stripe from 'stripe'
import { Link } from '../models/Links.js'
import { Site } from '../models/Site.js'
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const router = express.Router()

// IMPORTANT: GET must NOT change state or create sessions
router.get('/:token', async (req, res) => {
  const { token } = req.params
  const link = await Link.findOne({ token }).populate('site')
  if (!link) return res.status(404).send('Link not found')

  // Already paid? send to site
  if (link.status === 'paid') return res.redirect(link.site.url)

  // If we already created a session, reuse it (bots likely triggered GET only)
  if (link.status === 'initiated' && link.checkoutUrl) {
    return res.redirect(303, link.checkoutUrl)
  }

  // Render interstitial that requires a real user click (POST)
  res.set('ngrok-skip-browser-warning', 'true')
  res.send(`
    <!doctype html><meta name="robots" content="noindex">
    <style>body{font-family:sans-serif;display:grid;place-items:center;height:100vh}</style>
    <form method="POST" action="/r/${token}/checkout">
      <button type="submit" style="padding:12px 20px;font-size:16px">Continue to secure payment</button>
    </form>
  `)
})

// POST actually creates checkout (bots almost never POST)
router.post('/:token/checkout', async (req, res) => {
  const { token } = req.params
  const link = await Link.findOne({ token }).populate('site')
  if (!link) return res.status(404).send('Link not found')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: link.site.stripePriceId, quantity: 1 }],
    // success_url: `${process.env.APP_BASE_URL}/links/${link.site._id}?t=${token}`,
    success_url: `${link.site.url}?paid=1`, 
    cancel_url:  `${process.env.APP_BASE_URL}/links/${link.site._id}?t=${token}`,
    metadata: { token },
  })

  link.status = 'initiated'
  link.checkoutSessionId = session.id
  link.checkoutUrl = session.url          // store so we can reuse on GET
  link.expiresAt = new Date(Date.now()+24*60*60*1000)
  await link.save()

  res.redirect(303, session.url)
})

export default router
