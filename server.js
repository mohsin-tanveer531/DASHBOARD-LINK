import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import linkRoutes from './src/routes/links.js';       // POST /api/links (generate link)
import redirectRoutes from './src/routes/redirect.js';// GET /r/:token
import webhookRoutes from './src/routes/webhooks.js'; // POST /webhooks/stripe
import subscribersRouter from './src/routes/subscribers.js'; // GET /api/sites/:siteId/subscribers
// Load environment variables from .env
dotenv.config();

// Route handlers
// import siteRoutes from './routes/sites.js';       // GET /api/sites

const app = express();
app.use(cors());

app.use(
  '/webhooks/stripe',
  express.raw({ type: () => true }),  // catch everything as raw
  webhookRoutes
)

app.post('/webhooks/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  console.log('🔔 HIT /webhooks/stripe');
  console.log('   content-type:', req.headers['content-type']);
  console.log('   stripe-signature:', sig);
  console.log('   body isBuffer:', Buffer.isBuffer(req.body));
  // don’t verify signature here; we only check reachability
  res.sendStatus(200);
})
// app.use('/webhooks/stripe', webhookRoutes)

// app.use(express.json());
// Middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Mount API routes
// app.use('/api/sites', siteRoutes);
// app.use('/api/links', linkRoutes);
app.use(
  '/api/links',
  express.json(),
  linkRoutes
)
app.use("/api", subscribersRouter);
app.use(express.urlencoded({ extended: false })) // to handle the POST form
app.use('/r', redirectRoutes)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
