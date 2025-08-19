import type { NextAuthOptions } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import { prisma } from "./prisma"

const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-modify-private",
  "playlist-modify-public",
  "ugc-image-upload",
].join(" ")

async function refreshAccessToken(token: any) {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64")

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    })

    const refreshed = await response.json()

    if (!response.ok) {
      throw new Error(refreshed?.error || "Failed to refresh access token")
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in as number) * 1000,
      refreshToken: refreshed.refresh_token || token.refreshToken,
    }
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope: SPOTIFY_SCOPES },
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user, profile }) {
      // Initial sign in - sync user to database
      if (account && user && profile) {
        try {
          const spotifyProfile = profile as any
          const dbUser = await prisma.user.upsert({
            where: { spotifyId: spotifyProfile.id },
            update: {
              email: user.email || "",
              displayName: user.name || spotifyProfile.display_name || "",
              image: user.image || spotifyProfile.images?.[0]?.url || null,
            },
            create: {
              spotifyId: spotifyProfile.id,
              email: user.email || "",
              displayName: user.name || spotifyProfile.display_name || "",
              image: user.image || spotifyProfile.images?.[0]?.url || null,
            },
          })

          return {
            ...token,
            accessToken: account.access_token,
            accessTokenExpires: (account.expires_at as number) * 1000,
            refreshToken: account.refresh_token,
            userId: dbUser.id,
            user: {
              id: dbUser.id,
              name: dbUser.displayName,
              email: dbUser.email,
              image: dbUser.image,
            },
          }
        } catch (error) {
          console.error("Failed to sync user to database:", error)
          if (process.env.NODE_ENV === "development") {
            console.error("Spotify profile data:", profile)
          }
          // Fallback to original behavior
          return {
            ...token,
            accessToken: account.access_token,
            accessTokenExpires: (account.expires_at as number) * 1000,
            refreshToken: account.refresh_token,
            user,
          }
        }
      }

      // Return previous token if not expired yet
      if (token.accessToken && token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      ;(session as any).accessToken = token.accessToken
      ;(session as any).userId = token.userId
      if (token.user) {
        session.user = {
          ...(session.user || {}),
          id: (token.user as any).id,
          name: (token.user as any).name,
          email: (token.user as any).email,
          image: (token.user as any).image,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, profile }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Sign in event:", { user: user?.email, account: account?.provider, profile: profile?.name })
      }
    },
    async signOut({ token }) {
      if (process.env.NODE_ENV === "development") {
        console.log("Sign out event:", { userId: token?.userId })
      }
    },
  },
}


