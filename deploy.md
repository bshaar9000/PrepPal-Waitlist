# PrepPal.ai Deployment Guide

## Quick Deploy Options

### 🚀 Option 1: Railway (Recommended - Easy Full Stack)

Railway is perfect for full-stack apps with databases.

1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Sign up/login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your PrepPal repository

2. **Configure:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `/`

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   ```

4. **Deploy:**
   - Railway will automatically deploy
   - Your app will be available at `https://your-app.railway.app`

---

### 🌐 Option 2: Vercel (Frontend) + PlanetScale (Database)

Best for modern jamstack deployment.

1. **Deploy Frontend to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set up API Routes:**
   - Convert `server/server.js` to Vercel API routes
   - Create `api/waitlist.js` in your project root

3. **Database:**
   - Use PlanetScale or Supabase for hosted database
   - Update connection strings

---

### 🐳 Option 3: Docker + VPS

For full control and custom hosting.

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

2. **Deploy to VPS:**
   ```bash
   docker build -t preppal .
   docker run -d -p 3001:3001 preppal
   ```

---

## Pre-Deployment Checklist

- [ ] Test frontend and backend locally with `npm run dev:all`
- [ ] Verify database is working with test email submissions
- [ ] Update any hardcoded URLs to use environment variables
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure analytics (optional: Google Analytics)

## Post-Deployment Steps

1. **Test the live site:**
   - Submit a test email
   - Verify it appears in the database
   - Test duplicate email prevention

2. **Set up monitoring:**
   - Check logs for any errors
   - Set up uptime monitoring (UptimeRobot, etc.)

3. **Domain setup (optional):**
   - Configure custom domain
   - Set up SSL certificate
   - Update CORS settings if needed

4. **Marketing:**
   - Share your waitlist link
   - Set up social media accounts
   - Create landing page on Product Hunt (when ready)

## Common Issues

### Port Issues
- Make sure your hosting platform uses the `PORT` environment variable
- Default is 3001, but most platforms assign dynamically

### Database Issues
- SQLite works for small scale, but consider PostgreSQL for production
- Make sure database file has write permissions

### CORS Issues
- Update server.js CORS settings for your domain
- Add your production domain to allowed origins

## Need Help?

- Check the logs on your hosting platform
- Test API endpoints directly with curl
- Verify environment variables are set correctly
