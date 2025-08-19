# Vercel Deployment Guide

This guide will walk you through deploying your Spotify Social App to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Set up a production database (recommended providers below)
3. **Spotify Developer Account**: Configure your Spotify app for production

## Step 1: Database Setup

### Recommended Database Providers:
- **Neon** (recommended): Free tier with PostgreSQL
- **Supabase**: Free tier with PostgreSQL + additional features
- **PlanetScale**: MySQL alternative with serverless scaling
- **Railway**: Simple PostgreSQL hosting

### Setting up with Neon (Recommended):
1. Go to [neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://username:password@host/database`)
4. Save this for the next step

## Step 2: Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
DATABASE_URL=postgresql://username:password@your-db-host/database
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-generated-secret-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 3: Configure Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click **Edit Settings**
4. Add these Redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/callback/spotify`
   - `https://your-app-name.vercel.app/callback` (for the rewrite rule)
5. Save changes

## Step 4: Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)
1. Push your code to a GitHub repository
2. In Vercel dashboard, click **New Project**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js app
5. Deploy!

### Option B: Deploy with Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Step 5: Database Migration

After your first deployment:

1. Go to your Vercel project dashboard
2. Go to **Functions** tab
3. Find a recent deployment log
4. Or use Vercel CLI to run:
```bash
vercel env pull .env.local
npx prisma db push
```

## Step 6: Verify Deployment

1. Visit your deployed app URL
2. Test Spotify authentication
3. Check that all features work correctly
4. Monitor the **Functions** tab for any errors

## Troubleshooting

### Common Issues:

**Database Connection Errors:**
- Verify DATABASE_URL is correct
- Ensure your database allows connections from Vercel's IP ranges
- Check if you need to add `?sslmode=require` to your connection string

**Authentication Issues:**
- Verify NEXTAUTH_URL matches your deployment URL
- Check Spotify redirect URIs are correctly configured
- Ensure NEXTAUTH_SECRET is set and consistent

**Build Failures:**
- Check the build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Prisma schema is valid for PostgreSQL

**Function Timeouts:**
- API routes have a 30-second timeout limit (configured in vercel.json)
- Consider optimizing database queries if needed

## Monitoring and Maintenance

1. **Logs**: Check Vercel dashboard → Functions for real-time logs
2. **Analytics**: Enable Vercel Analytics for performance insights
3. **Errors**: Monitor error rates and investigate issues promptly
4. **Database**: Monitor your database provider's dashboard for performance

## Security Considerations

✅ **Already Configured:**
- Security headers (CSP, HSTS, etc.)
- Environment variables are secure
- HTTPS enforced
- JWT sessions configured

✅ **Additional Recommendations:**
- Enable Vercel's DDoS protection
- Consider rate limiting for API routes
- Regularly update dependencies
- Monitor for security vulnerabilities

## Scaling Considerations

- **Vercel Pro**: For higher limits and better performance
- **Database scaling**: Monitor connection limits and query performance  
- **CDN**: Vercel automatically provides global CDN
- **Caching**: Consider implementing Redis for session storage if needed

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Check this project's GitHub issues
4. Spotify API documentation: [developer.spotify.com](https://developer.spotify.com)

---

**Next Steps After Deployment:**
- Set up monitoring and alerts
- Configure custom domain (optional)
- Enable Vercel Analytics
- Plan for regular maintenance and updates
