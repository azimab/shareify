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

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }
  
  return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}`
}

export async function generateWeeklyPlaylist() {
  const session = await getServerSession(authOptions)
  if (!session?.userId || !session.accessToken) {
    throw new Error("Unauthorized")
  }

  const weekStart = getWeekStart()
  const weekRange = formatWeekRange(weekStart)

  try {
    // Check if playlist already exists for this week
    const existingPlaylist = await prisma.weeklyPlaylist.findUnique({
      where: {
        weekStart_ownerUserId: {
          weekStart,
          ownerUserId: session.userId,
        },
      },
    })

    // Get current user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { followerId: session.userId },
          { followingId: session.userId },
        ],
      },
    })

    // Get all friend user IDs (exclude self from playlist)
    const userIds = new Set<string>()
    friendships.forEach((friendship) => {
      // Add the other person in the friendship (not the current user)
      if (friendship.followerId === session.userId) {
        userIds.add(friendship.followingId)
      } else {
        userIds.add(friendship.followerId)
      }
    })

    // Get all tracks for this week from friends
    const selections = await prisma.weeklySelection.findMany({
      where: {
        userId: { in: Array.from(userIds) },
        weekStart,
      },
      include: {
        tracks: true,
        user: true,
      },
    })

    // Get friend tracks
    const friendTracks = selections.flatMap((selection) =>
      selection.tracks.map((track) => ({
        uri: track.uri,
        title: track.title,
        artist: track.artist,
        isRecommendation: false
      })).filter(track => track.uri)
    )

    if (friendTracks.length === 0) {
      throw new Error("No tracks found for this week")
    }

    // Auto-add recommendations if we have friend songs but fewer than 20 total
    let allTracks = [...friendTracks]
    if (friendTracks.length > 0 && friendTracks.length < 20) {
      try {
        const { generateRecommendations } = await import("./recommendations")
        const recommendations = await generateRecommendations()
        
        const neededCount = 20 - friendTracks.length
        const recommendedTracks = recommendations
          .slice(0, neededCount)
          .map(rec => ({
            uri: rec.uri,
            title: rec.title,
            artist: rec.artist,
            isRecommendation: true
          }))
          .filter(track => track.uri)
        
        allTracks = [...friendTracks, ...recommendedTracks]
      } catch (error) {
        console.error("Failed to add recommendations:", error)
        // Continue with just friend tracks if recommendations fail
      }
    }

    const trackUris = allTracks.map(track => track.uri).filter(Boolean)

    let playlistId: string
    let playlistUrl: string

    if (existingPlaylist?.spotifyPlaylistId) {
      // Update existing playlist
      playlistId = existingPlaylist.spotifyPlaylistId

      // Clear existing tracks
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [] }),
      })

      // Add new tracks
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      })

      playlistUrl = `https://open.spotify.com/playlist/${playlistId}`
    } else {
      // Create new playlist
      const userResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
      
      if (!userResponse.ok) {
        throw new Error("Failed to get user profile")
      }
      
      const userProfile = await userResponse.json()

      const createResponse = await fetch(
        `https://api.spotify.com/v1/users/${userProfile.id}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: `SocialSpot - ${weekRange}`,
            description: `Weekly collaborative playlist from your music circle for ${weekRange}. ${allTracks.length > friendTracks.length ? `Includes ${allTracks.length - friendTracks.length} auto-recommended songs.` : ''}`,
            public: false,
          }),
        }
      )

      if (!createResponse.ok) {
        const error = await createResponse.text()
        throw new Error(`Failed to create playlist: ${error}`)
      }

      const playlist = await createResponse.json()
      playlistId = playlist.id
      playlistUrl = playlist.external_urls.spotify

      // Add tracks to new playlist
      if (trackUris.length > 0) {
        await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: trackUris }),
        })
      }
    }

    // Save/update playlist in database
    await prisma.weeklyPlaylist.upsert({
      where: {
        weekStart_ownerUserId: {
          weekStart,
          ownerUserId: session.userId,
        },
      },
      update: {
        spotifyPlaylistId: playlistId,
        url: playlistUrl,
        trackCount: trackUris.length,
        name: `SocialSpot - ${weekRange}`,
        description: `Weekly collaborative playlist from your music circle for ${weekRange}. ${allTracks.length > friendTracks.length ? `Includes ${allTracks.length - friendTracks.length} auto-recommended songs.` : ''}`,
      },
      create: {
        weekStart,
        ownerUserId: session.userId,
        spotifyPlaylistId: playlistId,
        url: playlistUrl,
        trackCount: trackUris.length,
        name: `SocialSpot - ${weekRange}`,
        description: `Weekly collaborative playlist from your music circle for ${weekRange}. ${allTracks.length > friendTracks.length ? `Includes ${allTracks.length - friendTracks.length} auto-recommended songs.` : ''}`,
      },
    })

    return { 
      success: true, 
      playlistUrl, 
      trackCount: trackUris.length,
      friendTrackCount: friendTracks.length,
      recommendedTrackCount: allTracks.length - friendTracks.length
    }
  } catch (error) {
    console.error("Failed to generate weekly playlist:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to generate playlist")
  }
}

export async function getWeeklyPlaylist() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return null
  }

  const weekStart = getWeekStart()

  try {
    const playlist = await prisma.weeklyPlaylist.findUnique({
      where: {
        weekStart_ownerUserId: {
          weekStart,
          ownerUserId: session.userId,
        },
      },
    })

    return playlist
  } catch (error) {
    console.error("Failed to get weekly playlist:", error)
    return null
  }
}
