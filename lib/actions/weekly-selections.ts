"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { revalidatePath } from "next/cache"

export interface TrackData {
  id: string
  title: string
  artist: string
  album?: string
  image?: string
  uri?: string
}

function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function saveWeeklySelection(tracks: TrackData[]) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    throw new Error("Unauthorized")
  }

  if (tracks.length === 0 || tracks.length > 3) {
    throw new Error("Must select 1-3 tracks")
  }

  const weekStart = getWeekStart()

  try {
    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // Delete existing selection for this week if any
      const existingSelection = await tx.weeklySelection.findUnique({
        where: {
          userId_weekStart: {
            userId: session.userId!,
            weekStart,
          },
        },
      })

      if (existingSelection) {
        await tx.trackSelection.deleteMany({
          where: { weeklySelectionId: existingSelection.id },
        })
        await tx.weeklySelection.delete({
          where: { id: existingSelection.id },
        })
      }

      // Create new selection
      const weeklySelection = await tx.weeklySelection.create({
        data: {
          userId: session.userId!,
          weekStart,
        },
      })

      // Add tracks
      await tx.trackSelection.createMany({
        data: tracks.map((track) => ({
          weeklySelectionId: weeklySelection.id,
          spotifyTrackId: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album || null,
          image: track.image || null,
          uri: track.uri || null,
        })),
      })
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to save weekly selection:", error)
    throw new Error("Failed to save selection")
  }
}

export async function getWeeklySelection() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return null
  }

  const weekStart = getWeekStart()

  try {
    const selection = await prisma.weeklySelection.findUnique({
      where: {
        userId_weekStart: {
          userId: session.userId,
          weekStart,
        },
      },
      include: {
        tracks: true,
      },
    })

    return selection
  } catch (error) {
    console.error("Failed to get weekly selection:", error)
    return null
  }
}

export async function getCurrentWeekTracks() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return []
  }

  const weekStart = getWeekStart()

  try {
    // Get current user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { followerId: session.userId },
          { followingId: session.userId },
        ],
      },
      include: {
        follower: true,
        following: true,
      },
    })

    // Get all friend user IDs (exclude self from the feed)
    const userIds = new Set<string>()
    friendships.forEach((friendship) => {
      // Add the other person in the friendship (not the current user)
      if (friendship.followerId === session.userId) {
        userIds.add(friendship.followingId)
      } else {
        userIds.add(friendship.followerId)
      }
    })

    // Get all weekly selections for this week from friends
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

    // Flatten tracks and add friend info
    const tracks = selections.flatMap((selection) =>
      selection.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        image: track.image,
        uri: track.uri,
        duration: "3:20", // TODO: Get from Spotify API or store in DB
        friend: selection.user.displayName || "Unknown",
        addedAt: track.addedAt,
      }))
    )

    return tracks.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
  } catch (error) {
    console.error("Failed to get current week tracks:", error)
    return []
  }
}
