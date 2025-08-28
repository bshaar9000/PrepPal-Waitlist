import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/preppal_waitlist';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Waitlist Schema
const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  source: {
    type: String,
    default: 'waitlist',
    enum: ['waitlist', 'beta_signup', 'demo_request']
  },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  metadata: {
    browserInfo: Object,
    deviceInfo: Object,
    location: Object
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'invited', 'active', 'declined']
  },
  invitedAt: Date,
  joinedAt: Date,
  notes: String
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add indexes for better performance
waitlistSchema.index({ email: 1 });
waitlistSchema.index({ createdAt: -1 });
waitlistSchema.index({ status: 1 });

const WaitlistUser = mongoose.model('WaitlistUser', waitlistSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'PrepPal Waitlist API is running', 
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Join waitlist endpoint
app.post('/api/waitlist', async (req, res) => {
  try {
    const { email, source = 'waitlist', utm = {}, metadata = {} } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Extract additional info from request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referer') || '';

    // Create new waitlist user
    const waitlistUser = new WaitlistUser({
      email: email.toLowerCase().trim(),
      source,
      ipAddress,
      userAgent,
      referrer,
      utm,
      metadata: {
        ...metadata,
        signupTimestamp: new Date(),
        requestHeaders: {
          origin: req.get('Origin'),
          host: req.get('Host')
        }
      }
    });

    await waitlistUser.save();

    res.status(201).json({ 
      success: true, 
      message: 'Successfully added to PrepPal waitlist!',
      data: {
        id: waitlistUser._id,
        email: waitlistUser.email,
        position: await WaitlistUser.countDocuments({ createdAt: { $lte: waitlistUser.createdAt } }),
        joinedAt: waitlistUser.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email
      return res.status(409).json({ 
        success: false, 
        message: 'You\'re already on the PrepPal waitlist! We\'ll notify you when beta access is available.' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    console.error('Waitlist signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
});

// Get waitlist statistics
app.get('/api/waitlist/stats', async (req, res) => {
  try {
    const totalCount = await WaitlistUser.countDocuments();
    const todayCount = await WaitlistUser.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const weekCount = await WaitlistUser.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Get signup trend (last 7 days)
    const signupTrend = await WaitlistUser.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalCount,
        today: todayCount,
        thisWeek: weekCount,
        trend: signupTrend
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to fetch statistics' 
    });
  }
});

// Get waitlist entries (admin endpoint - add authentication in production)
app.get('/api/waitlist', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    let query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Search by email if provided
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const users = await WaitlistUser.find(query)
      .select('-userAgent -ipAddress -metadata') // Exclude sensitive data
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await WaitlistUser.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Fetch waitlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to fetch waitlist' 
    });
  }
});

// Update waitlist user status (admin endpoint)
app.patch('/api/waitlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    if (status === 'invited' && !updateData.invitedAt) {
      updateData.invitedAt = new Date();
    }
    
    if (status === 'active' && !updateData.joinedAt) {
      updateData.joinedAt = new Date();
    }

    const user = await WaitlistUser.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Unable to update user' 
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PrepPal Waitlist API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Graceful shutdown...`);
  
  mongoose.connection.close()
    .then(() => {
      console.log('🗄️  MongoDB connection closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error closing MongoDB:', error);
      process.exit(1);
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));