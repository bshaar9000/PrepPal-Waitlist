import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preppal_waitlist';

// Waitlist User Schema
const waitlistUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  source: { type: String },
  status: { type: String, enum: ['pending', 'invited', 'active'], default: 'pending' },
  position: { type: Number },
});

const WaitlistUser = mongoose.models.WaitlistUser || mongoose.model('WaitlistUser', waitlistUserSchema);

// Helper to get next waitlist position
async function getNextWaitlistPosition() {
  const count = await WaitlistUser.countDocuments();
  return count + 1;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Connect to MongoDB
      await mongoose.connect(MONGODB_URI);
      
      const { email, source } = req.body;
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Valid email is required.' });
      }

      const existingUser = await WaitlistUser.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'This email is already on the waitlist.' });
      }

      const position = await getNextWaitlistPosition();
      const newUser = new WaitlistUser({
        email,
        ipAddress,
        userAgent,
        source,
        position,
      });

      await newUser.save();
      res.status(201).json({ success: true, message: 'Successfully added to PrepPal waitlist!', data: newUser });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    try {
      await mongoose.connect(MONGODB_URI);
      const count = await WaitlistUser.countDocuments();
      const pendingCount = await WaitlistUser.countDocuments({ status: 'pending' });
      const invitedCount = await WaitlistUser.countDocuments({ status: 'invited' });
      const activeCount = await WaitlistUser.countDocuments({ status: 'active' });

      res.status(200).json({
        success: true,
        stats: {
          total: count,
          pending: pendingCount,
          invited: invitedCount,
          active: activeCount,
        }
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
