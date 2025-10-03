import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Site } from '../src/models/Site.js';

// Load environment variables
dotenv.config();

// List of initial sites to seed
const sites = [
  {
    name: 'Healthy Yoga',
    url: 'https://healthyyoga.fit',
    callbackUrl: 'https://healthyyoga.fit/update-subscription.php',
    stripePriceId: 'price_1RtD5oRs3g36WmiNh2Fw9oss',
  },
  {
    name: 'Fitness First',
    url: 'https://fitnessfirst.fitness',
    callbackUrl: 'https://fitnessfirst.fitness/update-subscription.php',
    stripePriceId: 'price_1RtD9WRs3g36WmiNaq2xoa7H',
  },
  {
    name: 'SiteMakers Pro',
    url: 'https://sitemakerspro.com/',
    callbackUrl: 'https://sitemakerspro.com/update-subscription.php',
    stripePriceId: 'price_1RtDD1Rs3g36WmiNFa2YjKqQ',
  },
  {
    name: 'Coach to Fit',
    url: 'https://coachtofit.com/',
    callbackUrl: 'https://coachtofit.com/update-subscription.php',
    stripePriceId: 'price_1RtDEeRs3g36WmiNa0Pdof7d',
  },
  {
    name: 'WeCodes',
    url: 'https://wecodes.codes/',
    callbackUrl: 'https://wecodes.codes/update-subscription.php',
    stripePriceId: 'price_1RtDGfRs3g36WmiNkDjshnB7',
  },
];

async function seedSites() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Clear existing sites
    await Site.deleteMany({});
    console.log('Existing Site documents removed');

    // Insert seed data
    const created = await Site.insertMany(sites);
    console.log(`Seeded ${created.length} sites:`);
    created.forEach(site => console.log(` - ${site.name} (${site._id})`));

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedSites();
