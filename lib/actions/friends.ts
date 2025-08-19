"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { revalidatePath } from "next/cache"

export async function searchUsers(query: string) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    throw new Error("Unauthorized")
  }

  if (!query.trim()) {
    return []
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.userId } }, // Exclude self
          {
            OR: [
              { displayName: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        image: true,
      },
      take: 10,
    })

    if (users.length === 0) {
      return []
    }

    const userIds = users.map((user) => user.id)

    // Check friendships from session user to found users
    const followingFriendships = await prisma.friendship.findMany({
      where: {
        followerId: session.userId,
        followingId: { in: userIds },
      },
      select: {
        followingId: true,
      },
    })
    const followingIds = new Set(followingFriendships.map((f) => f.followingId))

    // Check friendships from found users to session user
    const followerFriendships = await prisma.friendship.findMany({
      where: {
        followerId: { in: userIds },
        followingId: session.userId,
      },
      select: {
        followerId: true,
      },
    })
    const followerIds = new Set(followerFriendships.map((f) => f.followerId))

    return users.map((user) => ({
      id: user.id,
      displayName: user.displayName || "Unknown User",
      email: user.email,
      image: user.image,
      isConnected: followingIds.has(user.id) && followerIds.has(user.id),
    }))
  } catch (error) {
    console.error("Failed to search users:", error)
    throw new Error("Failed to search users")
  }
}

export async function addFriend(friendId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    throw new Error("Unauthorized")
  }

  if (friendId === session.userId) {
    throw new Error("Cannot add yourself as friend")
  }

  try {
    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { followerId: session.userId, followingId: friendId },
          { followerId: friendId, followingId: session.userId },
        ],
      },
    })

    if (existingFriendship) {
      throw new Error("Already connected")
    }

    // Create mutual friendship (both directions)
    await prisma.$transaction([
      prisma.friendship.create({
        data: {
          followerId: session.userId,
          followingId: friendId,
        },
      }),
      prisma.friendship.create({
        data: {
          followerId: friendId,
          followingId: session.userId,
        },
      }),
    ])

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to add friend:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add friend")
  }
}

export async function removeFriend(friendId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    throw new Error("Unauthorized")
  }

  try {
    // Remove both directions of friendship
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { followerId: session.userId, followingId: friendId },
          { followerId: friendId, followingId: session.userId },
        ],
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Failed to remove friend:", error)
    throw new Error("Failed to remove friend")
  }
}

export async function getFriends() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return []
  }

  try {
    const friendships = await prisma.friendship.findMany({
      where: { followerId: session.userId },
      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            email: true,
            image: true,
            weeklySelections: {
              where: {
                weekStart: {
                  // Get current week
                  gte: (() => {
                    const now = new Date()
                    const day = now.getDay()
                    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                    const monday = new Date(now.setDate(diff))
                    monday.setHours(0, 0, 0, 0)
                    return monday
                  })(),
                },
              },
              include: {
                tracks: true,
              },
            },
          },
        },
      },
    })

    return friendships.map((friendship) => ({
      id: friendship.following.id,
      name: friendship.following.displayName || "Unknown User",
      email: friendship.following.email,
      image: friendship.following.image,
      username: `@${friendship.following.email?.split("@")[0] || "user"}`,
      songsThisWeek: friendship.following.weeklySelections[0]?.tracks.length || 0,
      avatar: friendship.following.displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??",
    }))
  } catch (error) {
    console.error("Failed to get friends:", error)
    return []
  }
}

export async function getFriendSuggestions() {
  const session = await getServerSession(authOptions)
  if (!session?.userId) {
    return []
  }

  try {
    // Get users who are not already friends
    const currentFriendIds = await prisma.friendship.findMany({
      where: { followerId: session.userId },
      select: { followingId: true },
    })

    const friendIds = currentFriendIds.map((f) => f.followingId)
    friendIds.push(session.userId) // Exclude self

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: friendIds },
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        image: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    })

    return suggestions.map((user) => ({
      id: user.id,
      displayName: user.displayName || "Unknown User",
      email: user.email,
      image: user.image,
      username: `@${user.email?.split("@")[0] || "user"}`,
      avatar: user.displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??",
    }))
  } catch (error) {
    console.error("Failed to get friend suggestions:", error)
    return []
  }
}
