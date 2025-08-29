# 🗄️ MongoDB Setup for PrepPal Waitlist

## Quick Setup Options

### Option 1: Use Your Existing PrepPal MongoDB (Recommended)
Since you already have MongoDB for your main PrepPal platform:

1. **Add waitlist collection to existing database:**
   ```bash
   # Copy env.example to .env
   cp env.example .env
   ```

2. **Update .env with your existing MongoDB connection:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/preppal?retryWrites=true&w=majority
   ```

3. **The waitlist will create its own collection called `waitlistusers`**

### Option 2: MongoDB Atlas Free Tier (5 minutes)
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 - Free tier)
4. Get connection string
5. Add to `.env` file

### Option 3: Local MongoDB (if installed)
```env
MONGODB_URI=mongodb://localhost:27017/preppal_waitlist
```

## 🚀 Test Your Setup

```bash
# 1. Create .env file with your MongoDB URI
echo "MONGODB_URI=your-connection-string-here" > .env

# 2. Start the server
npm run dev:server

# 3. Test the connection
curl http://localhost:3001/api/health
```

## 🎯 What You Get with MongoDB

### Rich User Data
```javascript
{
  email: "user@example.com",
  source: "waitlist",
  createdAt: "2024-08-27T02:45:00Z",
  status: "pending",
  position: 127,
  utm: {
    source: "google",
    campaign: "launch"
  },
  metadata: {
    browserInfo: {...},
    signupTimestamp: "..."
  }
}
```

### Admin Endpoints
- `GET /api/waitlist/stats` - Signup statistics and trends
- `GET /api/waitlist?page=1&limit=50` - Paginated user list
- `PATCH /api/waitlist/:id` - Update user status

### Integration Ready
- Same database as your main PrepPal platform
- Easy to migrate users from waitlist to full platform
- Rich analytics and user tracking
- Professional user management
