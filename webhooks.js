import dotenv from 'dotenv'
import Stripe from 'stripe'
import bodyParser from 'body-parser'
import { Link } from '../models/Links.js'
import express from 'express'
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET1
const router      = express.Router()

// router.post('/',async (req, res) => {
//   const signature = req.headers['stripe-signature']

//   // 2) Debug log everything
//   console.log('🔔 Hit webhook; isBuffer=', Buffer.isBuffer(req.body))
//   console.log('    content-type:', req.headers['content-type'])
//   console.log('    stripe-signature header:', signature)
//   let event

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,        // raw Buffer
//       signature,
//       endpointSecret
//     )
//     console.log('🔔 Stripe event type:', event.type);
//   } catch (err) {
//     console.error('⚠️ Webhook signature mismatch.', err.message)
//     return res.status(400).send(`Webhook Error: ${err.message}`)
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object
//     const token   = session.metadata.token
//     const email   = session.customer_details.email

//     const link = await Link.findOne({ token }).populate('site')
//     if (link) {
//       link.status = 'paid'
//       link.email  = email
//       await link.save()
//       console.log(`✅ Link ${token} marked paid for ${email}`)
//       // TODO: call your PHP sites’ API here
//     }
//   }

//   res.json({ received: true })
// })
router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature']
  console.log('Using STRIPE_WEBHOOK_SECRET:', (process.env.STRIPE_WEBHOOK_SECRET1||'').slice(0,8) + '…');
     console.log('🔔 Hit webhook; isBuffer=', Buffer.isBuffer(req.body))
   console.log('    content-type:', req.headers['content-type'])
   console.log('    stripe-signature header:', signature)
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      endpointSecret
    )
  } catch (err) {
    console.error('⚠️ Signature mismatch:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('🔔 Stripe event type:', event.type)
  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true })
  }

  const session = event.data.object
  const token   = session.metadata.token
  const email   = session.customer_details.email

  const link = await Link.findOne({ token }).populate('site')
  if (link) {
    link.status = 'paid'
    link.email  = email
    await link.save()
    console.log(`✅ Link ${token} marked paid for ${email}`)
  }

  res.json({ received: true })
})

export default router


// router.post('/', async (req, res) => {
//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       req.headers['stripe-signature'],
//       console.log('sig header present?', !!req.headers['stripe-signature']),
//       endpointSecret
//     )
//   } catch (err) {
//     console.error('⚠️ Signature mismatch:', err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Only handle the one event we care about:
//   if (event.type === 'checkout.session.completed') {
//     console.log('🔔 Stripe event type:', event.type);

//     const session = event.data.object;
//     console.log('   session.metadata =', session.metadata);  // <— log this to verify your token made it through
//     console.log('   customer_details =', session.customer_details);

//     const token = session.metadata.token;
//     const email = session.customer_details.email;

//     const link = await Link.findOne({ token }).populate('site');
//     if (link) {
//       link.status = 'paid';
//       link.email  = email;
//       await link.save();
//       console.log(`✅ Link ${token} marked paid for ${email}`);
//     } else {
//       console.warn(`⚠️ No Link found for token=${token}`);
//     }
//   }

//   // For all other events, just acknowledge:
//   res.json({ received: true });
// });

// export default router