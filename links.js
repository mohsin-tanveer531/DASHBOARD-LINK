// src/routes/links.js
import express from 'express';
import crypto from 'crypto';
import {Site} from '../models/Site.js';
import {Link} from '../models/Links.js';

const router = express.Router();
const baseFor = (siteUrl) => {
  const override = process.env.APP_BASE_URL?.trim();
  return (override ? override : siteUrl).replace(/\/$/, '');
};
router.post('/', async (req, res) => {
  const { siteId } = req.body;
  if (!siteId) return res.status(400).json({ error: 'siteId is required' });

  const site = await Site.findById(siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const token = crypto.randomBytes(6).toString('hex');
  await Link.create({ token, site: site._id, status: 'pending' });

  // const linkUrl = `${process.env.APP_BASE_URL}/r/${token}`;
  const linkUrl = `${baseFor(site.url)}/r/${token}`;
  res.status(201).json({ linkUrl });
});

router.get('/', async (req, res) => {
  const { siteId } = req.query;
  const filter = siteId ? { site: siteId } : {};

  const links = await Link.find(filter)
    .sort({ createdAt: -1 })
    .populate('site', 'name url')
    .lean();

  const out = links.map((l) => {
    const base = baseFor(l.site.url);
    return {
      token: l.token,
      url: `${base}/r/${l.token}`,
      siteId: l.site._id,
      siteName: l.site.name,
      status: l.status,
      created: l.createdAt,
    };
  });

  res.json(out);
});
// export default router;

//  working fine for post (below)
// import express from 'express';
// import crypto from 'crypto';
// import { Site } from '../models/Site.js';
// import { Link } from '../models/Links.js';

// const router = express.Router();

// router.post('/', async (req, res) => {
//   const { siteId } = req.body;
//   if (!siteId) {
//     return res.status(400).json({ error: 'siteId is required' });
//   }

//   // 1) Lookup the Site record (must have its own url saved)
//   const site = await Site.findById(siteId);
//   if (!site) {
//     return res.status(404).json({ error: 'Site not found' });
//   }

//   // 2) Generate a secure token & save the Link
//   const token = crypto.randomBytes(6).toString('hex');
//   await Link.create({ token, site: site._id, status: 'pending' });

//   // 3) Build the final link under that site's own domain
//   const baseUrl = site.url.replace(/\/$/, '');      // remove trailing slash if any
//   const linkUrl = `${baseUrl}/r/${token}`;

//   // 4) Return it
//   res.status(201).json({ linkUrl });
// });


// router.get('/', async (req, res) => {
//   const { siteId } = req.query
//   const filter = siteId ? { site: siteId } : {}

//   const links = await Link.find(filter)
//     .sort({ createdAt: -1 })
//     .populate('site', 'name url')
//     .lean()

//   const out = links.map(l => ({
//     token:    l.token,
//     url:      `${l.site.url.replace(/\/$/, '')}/r/${l.token}`,
//     siteId:   l.site._id,
//     siteName: l.site.name,
//     status:   l.status,
//     created:  l.createdAt,
//   }))

//   res.json(out)
// })

// export default router;
// below is the code which has logs

// src/routes/links.js
// import express from 'express'
// import crypto from 'crypto'
// import { Site } from '../models/Site.js'
// import { Link } from '../models/Links.js'

// const router = express.Router()

// POST /api/links
// router.post('/', async (req, res) => {
//   console.log('⏳ POST /api/links called with body:', req.body)
//   try {
//     const { siteId } = req.body
//     if (!siteId) {
//       console.warn('⚠️ siteId missing in request')
//       return res.status(400).json({ error: 'siteId is required' })
//     }

//     const site = await Site.findById(siteId)
//     if (!site) {
//       console.warn(`⚠️ No Site found for ID ${siteId}`)
//       return res.status(404).json({ error: 'Site not found' })
//     }
//     console.log('✅ Found Site:', site.name, site.url)

//     const token = crypto.randomBytes(6).toString('hex')
//     await Link.create({ token, site: site._id, status: 'pending' })
//     console.log(`✅ Created Link token=${token} for siteId=${siteId}`)

//     // const baseUrl = site.url.replace(/\/$/, '')
//     // const linkUrl = `${baseUrl}/r/${token}`
//     const linkUrl = `${process.env.APP_BASE_URL}/r/${token}`
//     console.log('👉 Returning linkUrl:', linkUrl)

//     res.status(201).json({ linkUrl })
//   } catch (err) {
//     console.error('❌ Error in POST /api/links:', err)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

// GET /api/links?siteId=...
// router.get('/', async (req, res) => {
//   console.log('⏳ GET /api/links called with query:', req.query)
//   try {
//     const { siteId } = req.query
//     const filter = siteId ? { site: siteId } : {}

//     const links = await Link.find(filter)
//       .sort({ createdAt: -1 })
//       .populate('site', 'name url')
//       .lean()
//     console.log(`✅ Fetched ${links.length} links from DB`)

//     const out = links.map((l) => ({
//       token:    l.token,
//       url:      `${l.site.url.replace(/\/$/, '')}/r/${l.token}`,
//       siteId:   l.site._id,
//       siteName: l.site.name,
//       status:   l.status,
//       created:  l.createdAt,
//     }))
//     console.log('👉 Responding with:', out)

//     res.json(out)
//   } catch (err) {
//     console.error('❌ Error in GET /api/links:', err)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// })

export default router
