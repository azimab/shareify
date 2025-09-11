# Shareify

A social music discovery platform that replaces algorithmic recommendations with friends' music picks.

## What it does

Shareify connects to your Spotify account and creates weekly playlists based on songs recommended by your friends, rather than relying on automated algorithms.

### How it works

1. **Share weekly picks**: Each user selects 3 songs they're currently loving
2. **Discover friends' music**: See what your friends are recommending each week
3. **Get curated playlists**: Receive a weekly Spotify playlist containing your friends' picks plus intelligent recommendations based on their musical taste

## Key features

- **Friend-based recommendations**: Music discovery through your social network
- **Weekly playlists**: Fresh playlists generated every week and added to your Spotify
- **Smart recommendations**: AI-generated suggestions based on your friends' historical picks
- **Social connection**: See who recommended each song in your playlist
- **Historical access**: Browse and replay playlists from previous weeks

## Technology

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Authentication**: NextAuth.js with Spotify OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel
- **Music API**: Spotify Web API for playlist management and song search

## Getting started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see ENVIRONMENT.md)
4. Run database migrations: `npx prisma db push`
5. Start development server: `npm run dev`

## Environment setup

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `SPOTIFY_CLIENT_ID`: Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify app client secret

See ENVIRONMENT.md and DEPLOYMENT.md for detailed setup instructions.

## License

MIT
