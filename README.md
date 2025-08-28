# PrepPal.ai - AI Interview Preparation Platform

Train like a pro, interview like a champion. PrepPal uses AI-generated avatars to help you practice interviews and build confidence.

## Features

- 🎯 **Face Real Executives**: Practice with AI personas modeled after actual executives
- 🎬 **Watch Your Game Film**: Review and analyze your interview performance
- 🤝 **Join Your Squad**: Connect with ambitious professionals
- 💾 **Waitlist Management**: Full backend with SQLite database

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Deployment**: Ready for Vercel, Netlify, or VPS

## Local Development

### Prerequisites
- Node.js 18+ (recommended)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd PrepPalWaitlist
   npm install
   ```

2. **Run both frontend and backend:**
   ```bash
   npm run dev:all
   ```
   This starts:
   - Backend server on http://localhost:3001
   - Frontend dev server on http://localhost:5173

3. **Run individually:**
   ```bash
   # Backend only
   npm run dev:server
   
   # Frontend only
   npm run dev
   ```

## API Endpoints

- `POST /api/waitlist` - Add email to waitlist
- `GET /api/waitlist/count` - Get total signups
- `GET /api/waitlist` - Get all signups (admin)
- `GET /api/health` - Health check

## Database

Uses SQLite with the following schema:
```sql
CREATE TABLE waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add API routes in `api/` folder for serverless functions

### Option 2: Railway/Render
1. Connect GitHub repo
2. Set start command: `npm start`
3. Set port to `3001` or use `PORT` environment variable

### Option 3: VPS/Docker
1. Build: `npm run build`
2. Start: `npm start`
3. Serve static files from `dist/` directory

## Environment Variables

Create a `.env` file:
```bash
PORT=3001
NODE_ENV=production
DB_PATH=./server/waitlist.db
```

## File Structure

```
PrepPalWaitlist/
├── src/                    # React frontend
│   ├── App.tsx            # Main component
│   ├── App.css            # Styles
│   └── main.tsx           # Entry point
├── server/                 # Backend
│   ├── server.js          # Express server
│   └── waitlist.db        # SQLite database
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json
```

## Features Implemented

✅ Modern dark-themed UI with animations  
✅ Responsive design  
✅ Email validation  
✅ Duplicate prevention  
✅ SQLite database  
✅ REST API  
✅ Error handling  
✅ Loading states  

## Next Steps

- [ ] Add authentication for admin panel
- [ ] Email notifications (via SendGrid/Mailgun)
- [ ] Analytics dashboard
- [ ] A/B testing for conversion optimization
- [ ] Social media integration

## Support

For questions or issues, please create an issue in the GitHub repository.

---

© 2024 PrepPal.ai. Transforming interviews, one practice at a time.