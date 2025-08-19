# Environment Variables Configuration

## Required Environment Variables

### Database
```
DATABASE_URL="postgresql://username:password@localhost:5432/spotify_social_app"
```
- For local development, use a local PostgreSQL instance
- For production on Vercel, use a service like Neon, Supabase, or PlanetScale

### NextAuth.js
```
NEXTAUTH_URL="http://localhost:3000"  # Local development
NEXTAUTH_URL="https://your-app.vercel.app"  # Production
NEXTAUTH_SECRET="your-secret-key-here"
```
- Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`
- NEXTAUTH_URL should match your deployment URL

### Spotify API
```
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```
- Get these from your Spotify Developer Dashboard
- Add your production URL to the Spotify app's redirect URIs

## Setting Up Environment Variables

### Local Development
1. Create a `.env.local` file in the project root
2. Add all the environment variables listed above
3. Never commit this file to version control

### Vercel Deployment
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each environment variable with appropriate values for production
4. Make sure to set NEXTAUTH_URL to your Vercel app URL

## Database Setup

### For Production (Vercel)
1. Choose a PostgreSQL provider (recommended: Neon, Supabase, or PlanetScale)
2. Create a new database
3. Copy the connection string to DATABASE_URL
4. Run `npx prisma db push` to create tables
