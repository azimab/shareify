"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

async function generateSeedRecommendations(accessToken: string): Promise<RecommendationTrack[]> {
  // Popular artists across different genres for new users
  const seedArtists = [
    'Taylor Swift', 'Drake', 'The Weeknd', 'Billie Eilish', 'Post Malone',
    'Ariana Grande', 'Ed Sheeran', 'Dua Lipa', 'Bad Bunny', 'Olivia Rodrigo',
    'Harry Styles', 'Doja Cat', 'Justin Bieber', 'The Beatles', 'Queen'
  ]
  
  const recommendations: RecommendationTrack[] = []
  
  for (const artist of seedArtists.slice(0, 5)) { // Use first 5 artists
    try {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artist)}"&type=track&limit=4`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        const tracks = searchData.tracks.items
        
        for (const track of tracks) {
          recommendations.push({
            id: track.id,
            title: track.name,
            artist: track.artists[0]?.name || 'Unknown',
            album: track.album?.name,
            image: track.album?.images?.[0]?.url,
            uri: track.uri,
            score: 50,
            reason: `Popular track to get you started`
          })
        }
      }
    } catch (error) {
      console.error(`Failed to get seed recommendations for ${artist}:`, error)
    }
  }
  
  return recommendations.slice(0, 20)
}

export interface RecommendationTrack {
  id: string
  title: string
  artist: string
  album?: string
  image?: string
  uri?: string
  score: number
  reason: string
}

export async function generateRecommendations(): Promise<RecommendationTrack[]> {
  const session = await getServerSession(authOptions)
  if (!session?.userId || !session.accessToken) {
    throw new Error("Unauthorized")
  }

  try {
    // Get friend user IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { followerId: session.userId },
          { followingId: session.userId },
        ],
      },
    })

    const friendIds = new Set<string>()
    friendships.forEach((friendship) => {
      if (friendship.followerId === session.userId) {
        friendIds.add(friendship.followingId)
      } else {
        friendIds.add(friendship.followerId)
      }
    })

    // If no friends yet, use some popular artists as seed data
    if (friendIds.size === 0) {
      return await generateSeedRecommendations(session.accessToken)
    }

    // Get friends' historical selections (last 4 weeks)
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const historicalSelections = await prisma.weeklySelection.findMany({
      where: {
        userId: { in: Array.from(friendIds) },
        weekStart: { gte: fourWeeksAgo },
      },
      include: {
        tracks: true,
        user: true,
      },
      orderBy: { weekStart: 'desc' },
    })

    // Analyze music patterns
    const artistFrequency = new Map<string, { count: number, friends: Set<string> }>()
    const genreKeywords = new Map<string, number>()
    const tracksByArtist = new Map<string, Set<string>>()

    historicalSelections.forEach((selection) => {
      selection.tracks.forEach((track) => {
        // Count artist frequency across friends
        const artistKey = track.artist.toLowerCase()
        if (!artistFrequency.has(artistKey)) {
          artistFrequency.set(artistKey, { count: 0, friends: new Set() })
        }
        const artistData = artistFrequency.get(artistKey)!
        artistData.count++
        artistData.friends.add(selection.user.displayName || 'Unknown')

        // Track songs by artist
        if (!tracksByArtist.has(artistKey)) {
          tracksByArtist.set(artistKey, new Set())
        }
        tracksByArtist.get(artistKey)!.add(track.spotifyTrackId)

        // Simple genre detection from artist/album names
        const text = `${track.artist} ${track.album || ''}`.toLowerCase()
        const keywords = ['rock', 'pop', 'hip hop', 'rap', 'indie', 'electronic', 'jazz', 'classical', 'country', 'r&b', 'soul', 'funk', 'blues', 'folk', 'alternative']
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            genreKeywords.set(keyword, (genreKeywords.get(keyword) || 0) + 1)
          }
        })
      })
    })

    // Find popular artists among friends
    const popularArtists = Array.from(artistFrequency.entries())
      .filter(([_, data]) => data.friends.size >= 1) // At least 1 friend likes this artist
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)

    // Get recommendations using Spotify search for similar artists
    const recommendations: RecommendationTrack[] = []

    for (const [artistName, data] of popularArtists) {
      try {
        // Search for more songs by popular artists
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artistName)}"&type=track&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          const tracks = searchData.tracks.items

          for (const track of tracks) {
            // Skip if friends already picked this song
            const alreadyPicked = tracksByArtist.get(artistName.toLowerCase())?.has(track.id)
            if (alreadyPicked) continue

            const score = Math.min(100, data.count * 10 + data.friends.size * 15)
            
            recommendations.push({
              id: track.id,
              title: track.name,
              artist: track.artists[0]?.name || 'Unknown',
              album: track.album?.name,
              image: track.album?.images?.[0]?.url,
              uri: track.uri,
              score,
              reason: `Popular with ${data.friends.size} friends who picked ${data.count} songs by ${artistName}`
            })
          }
        }
      } catch (error) {
        console.error(`Failed to get recommendations for ${artistName}:`, error)
      }
    }

    // Remove duplicates and sort by score
    const uniqueRecommendations = recommendations.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    )
    
    return uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Top 20 recommendations
      
  } catch (error) {
    console.error("Failed to generate recommendations:", error)
    throw new Error("Failed to generate recommendations")
  }
}

export async function getRecommendationStats() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return null
  }

  try {
    // Get friend count
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { followerId: session.userId },
          { followingId: session.userId },
        ],
      },
    })

    const friendIds = new Set<string>()
    friendships.forEach((friendship) => {
      if (friendship.followerId === session.userId) {
        friendIds.add(friendship.followingId)
      } else {
        friendIds.add(friendship.followerId)
      }
    })

    // Get total songs from friends in last 4 weeks
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

    const songCount = await prisma.trackSelection.count({
      where: {
        weeklySelection: {
          userId: { in: Array.from(friendIds) },
          weekStart: { gte: fourWeeksAgo },
        },
      },
    })

    return {
      friendCount: friendIds.size,
      songsAnalyzed: songCount,
      weeksAnalyzed: 4,
    }
  } catch (error) {
    console.error("Failed to get recommendation stats:", error)
    return null
  }
}
