"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Users, Calendar, Search, Plus, X, UserPlus, UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export interface TrackData {
  id: string
  title: string
  artist: string
  album?: string
  image?: string
  uri?: string
}

// Client-side wrappers for server actions
async function saveWeeklySelection(tracks: TrackData[]) {
  const { saveWeeklySelection } = await import("@/lib/actions/weekly-selections")
  return saveWeeklySelection(tracks)
}

async function getWeeklySelection() {
  const { getWeeklySelection } = await import("@/lib/actions/weekly-selections")
  return getWeeklySelection()
}

async function getCurrentWeekTracks() {
  const { getCurrentWeekTracks } = await import("@/lib/actions/weekly-selections")
  return getCurrentWeekTracks()
}

async function generateWeeklyPlaylist() {
  const { generateWeeklyPlaylist } = await import("@/lib/actions/playlist-generation")
  return generateWeeklyPlaylist()
}

async function getWeeklyPlaylist() {
  const { getWeeklyPlaylist } = await import("@/lib/actions/playlist-generation")
  return getWeeklyPlaylist()
}

// Friends management functions
async function getFriends() {
  const { getFriends } = await import("@/lib/actions/friends")
  return getFriends()
}

async function searchUsers(query: string) {
  const { searchUsers } = await import("@/lib/actions/friends")
  return searchUsers(query)
}

async function addFriend(friendId: string) {
  const { addFriend } = await import("@/lib/actions/friends")
  return addFriend(friendId)
}

async function removeFriend(friendId: string) {
  const { removeFriend } = await import("@/lib/actions/friends")
  return removeFriend(friendId)
}

async function getFriendSuggestions() {
  const { getFriendSuggestions } = await import("@/lib/actions/friends")
  return getFriendSuggestions()
}

const SpotifyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null // Will redirect
  }

  return <MainApp />
}

function MainApp() {
  const { data: session } = useSession()
  const [showAccountPopup, setShowAccountPopup] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<TrackData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [currentWeekTracks, setCurrentWeekTracks] = useState([])
  const [weeklyPlaylist, setWeeklyPlaylist] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false)
  const [friends, setFriends] = useState([])
  const [friendSearchQuery, setFriendSearchQuery] = useState("")
  const [friendSearchResults, setFriendSearchResults] = useState([])
  const [isSearchingFriends, setIsSearchingFriends] = useState(false)
  const [friendSuggestions, setFriendSuggestions] = useState([])
  const [isLoadingFriends, setIsLoadingFriends] = useState(true)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showAccountPopup && !target.closest('.relative')) {
        setShowAccountPopup(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showAccountPopup])

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [selection, tracks, playlist, friendsList, suggestions] = await Promise.all([
          getWeeklySelection(),
          getCurrentWeekTracks(),
          getWeeklyPlaylist(),
          getFriends(),
          getFriendSuggestions(),
        ])

        if (selection) {
          setSelectedSongs(
            selection.tracks.map((track) => ({
              id: track.spotifyTrackId,
              title: track.title,
              artist: track.artist,
              album: track.album || undefined,
              image: track.image || undefined,
              uri: track.uri || undefined,
            }))
          )
        }

        setCurrentWeekTracks(tracks)
        setWeeklyPlaylist(playlist)
        setFriends(friendsList)
        setFriendSuggestions(suggestions)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoadingFriends(false)
      }
    }

    if (session?.userId) {
      loadData()
    }
  }, [session?.userId])

  const pastPlaylists = [
    { id: 1, week: "Dec 30, 2024", songs: 15, friends: 5 },
    { id: 2, week: "Dec 23, 2024", songs: 12, friends: 4 },
    { id: 3, week: "Dec 16, 2024", songs: 18, friends: 6 },
  ]

  const addSong = async (song: TrackData) => {
    if (selectedSongs.length < 3) {
      const newSongs = [...selectedSongs, song]
      setSelectedSongs(newSongs)
      
      // Auto-save to database
      try {
        setIsSaving(true)
        await saveWeeklySelection(newSongs)
        // Refresh current week tracks to show updated data
        const tracks = await getCurrentWeekTracks()
        setCurrentWeekTracks(tracks)
      } catch (error) {
        console.error("Failed to save selection:", error)
        // Show user-friendly error message
        alert(`Failed to save song: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`)
        // Revert on error
        setSelectedSongs(selectedSongs)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const removeSong = async (songId: string) => {
    const newSongs = selectedSongs.filter((song) => song.id !== songId)
    setSelectedSongs(newSongs)
    
    try {
      setIsSaving(true)
      if (newSongs.length === 0) {
        await saveWeeklySelection([])
      } else {
        await saveWeeklySelection(newSongs)
      }
      // Refresh current week tracks
      const tracks = await getCurrentWeekTracks()
      setCurrentWeekTracks(tracks)
    } catch (error) {
      console.error("Failed to save selection:", error)
      // Revert on error
      setSelectedSongs([...selectedSongs])
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeneratePlaylist = async () => {
    try {
      setIsGeneratingPlaylist(true)
      const result = await generateWeeklyPlaylist()
      if (result.success) {
        // Refresh playlist data
        const playlist = await getWeeklyPlaylist()
        setWeeklyPlaylist(playlist)
      }
    } catch (error) {
      console.error("Failed to generate playlist:", error)
    } finally {
      setIsGeneratingPlaylist(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      const q = searchQuery.trim()
      if (!q) {
        setSearchResults([])
        setSearchError("")
        return
      }
      try {
        setIsSearching(true)
        setSearchError("")
        const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }
        const data = await res.json()
        setSearchResults(data.tracks || [])
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setSearchError("Failed to search Spotify")
        }
      } finally {
        setIsSearching(false)
      }
    }
    const id = setTimeout(run, 400)
    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [searchQuery])

  // Friend search
  useEffect(() => {
    const controller = new AbortController()
    const run = async () => {
      const q = friendSearchQuery.trim()
      if (!q) {
        setFriendSearchResults([])
        return
      }
      try {
        setIsSearchingFriends(true)
        const results = await searchUsers(q)
        setFriendSearchResults(results)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Friend search failed:", err)
        }
      } finally {
        setIsSearchingFriends(false)
      }
    }
    const id = setTimeout(run, 400)
    return () => {
      clearTimeout(id)
      controller.abort()
    }
  }, [friendSearchQuery])

  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend(friendId)
      // Refresh friends list and search results
      const [friendsList, suggestions] = await Promise.all([
        getFriends(),
        getFriendSuggestions(),
      ])
      setFriends(friendsList)
      setFriendSuggestions(suggestions)
      // Update search results to reflect new connection status
      if (friendSearchQuery) {
        const results = await searchUsers(friendSearchQuery)
        setFriendSearchResults(results)
      }
    } catch (error) {
      console.error("Failed to add friend:", error)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend(friendId)
      // Refresh friends list
      const friendsList = await getFriends()
      setFriends(friendsList)
      // Refresh current week tracks since friend's songs might be removed
      const tracks = await getCurrentWeekTracks()
      setCurrentWeekTracks(tracks)
    } catch (error) {
      console.error("Failed to remove friend:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Shareify</h1>
            </div>

             <div className="relative">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-800/50 p-2 rounded-none transition-all duration-200"
                onClick={() => setShowAccountPopup(!showAccountPopup)}
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt={session.user.name || "Profile"} className="w-8 h-8 rounded-none object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-green-600 rounded-none flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{session?.user?.name?.slice(0, 2).toUpperCase() || "??"}</span>
                  </div>
                )}
                <span className="text-white font-medium">{session?.user?.name || "User"}</span>
              </div>

              {showAccountPopup && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-none shadow-xl z-50">
                    <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                        {session?.user?.image ? (
                          <img src={session.user.image} alt={session.user.name || "Profile"} className="w-12 h-12 rounded-none object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-green-600 rounded-none flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{session?.user?.name?.slice(0, 2).toUpperCase() || "??"}</span>
                          </div>
                        )}
                      <div>
                          <p className="font-semibold text-white">{session?.user?.name || "User"}</p>
                          <p className="text-sm text-gray-400">{session?.user?.email || ""}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      
                       <Button
                         onClick={() => signOut()}
                         variant="ghost"
                         className="w-full justify-start text-left hover:bg-gray-700 text-red-400 rounded-none"
                       >
                         Sign Out
                       </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 rounded-none border border-gray-700">
            <TabsTrigger
              value="dashboard"
              className="rounded-none data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-none data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="pick"
              className="rounded-none data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Pick Songs
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-none data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300 hover:text-white"
            >
              <Music className="h-4 w-4 mr-2" />
              Past Playlists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">This Week's Playlist</h2>
              <p className="text-gray-300 text-lg">
                Week of January 6, 2025 • {currentWeekTracks.length} songs from friends
                {isSaving && <span className="ml-2 text-yellow-400">(saving...)</span>}
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="w-48 h-48 mx-auto rounded-lg mb-6 hover:scale-105 transition-transform duration-300 shadow-lg overflow-hidden">
                {weeklyPlaylist?.image ? (
                  <img 
                    src={weeklyPlaylist.image}
                    alt="Playlist Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if Spotify image fails
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ${weeklyPlaylist?.image ? 'hidden' : ''}`}>
                  <Music className="h-16 w-16 text-white" />
                </div>
              </div>

              <div className="text-center mb-8 space-y-4">
                {weeklyPlaylist?.url ? (
                  <Button 
                    asChild
                    className="bg-green-600 hover:bg-green-700 rounded-lg hover:scale-105 transition-all duration-200 px-6 py-3 text-lg font-semibold shadow-lg"
                  >
                    <a href={weeklyPlaylist.url} target="_blank" rel="noopener noreferrer">
                      <SpotifyIcon />
                      <span className="ml-2">Play on Spotify</span>
                    </a>
                  </Button>
                ) : (
                  <Button 
                    onClick={handleGeneratePlaylist}
                    disabled={isGeneratingPlaylist || currentWeekTracks.length === 0}
                    className="bg-green-600 hover:bg-green-700 rounded-lg hover:scale-105 transition-all duration-200 px-6 py-3 text-lg font-semibold shadow-lg disabled:opacity-50"
                  >
                    <SpotifyIcon />
                    <span className="ml-2">
                      {isGeneratingPlaylist ? "Creating Playlist..." : "Create Playlist"}
                    </span>
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {currentWeekTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 bg-gray-800/40 border border-gray-700/50 rounded-lg border-l-4 border-l-green-500 hover:bg-gray-800/60 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {track.image ? (
                        <img 
                          src={track.image} 
                          alt={`${track.album} cover`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient if album image fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ${track.image ? 'hidden' : ''}`}>
                        <Music className="h-6 w-6 text-gray-300" />
                      </div>
                    </div>
                    <span className="text-gray-300 w-8 text-center font-medium text-lg">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg leading-tight">{track.title}</p>
                      <p className="text-gray-300 text-base mt-1">{track.artist}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-gray-700/80 text-gray-200 border border-gray-600 px-3 py-1"
                    >
                      from {track.friend}
                    </Badge>
                    <span className="text-gray-300 text-base font-medium min-w-[3rem] text-right">
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Your Music Circle</h2>
              <p className="text-gray-300 text-lg">Friends who share music with you each week</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Friends */}
              <Card className="bg-gray-800/40 border border-gray-700/50 rounded-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <Search className="h-5 w-5" />
                    Find Friends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search by name or email..."
                    value={friendSearchQuery}
                    onChange={(e) => setFriendSearchQuery(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />

                  {isSearchingFriends && (
                    <div className="text-center text-gray-300 py-4">Searching...</div>
                  )}

                  <div className="space-y-3">
                    {friendSearchResults.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg"
                      >
                        {user.image ? (
                          <img src={user.image} alt={user.displayName} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white text-sm">
                              {user.displayName.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white text-lg">{user.displayName}</p>
                          <p className="text-gray-300 text-base">{user.email}</p>
                        </div>
                        <Button
                          variant={user.isConnected ? "outline" : "default"}
                          size="sm"
                          onClick={() => user.isConnected ? handleRemoveFriend(user.id) : handleAddFriend(user.id)}
                          className={user.isConnected 
                            ? "rounded-lg border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                            : "rounded-lg border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-green-600"
                          }
                        >
                          {user.isConnected ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Friends */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Your Friends ({friends.length})</h3>
                
                {isLoadingFriends ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="bg-gray-800/40 border border-gray-700/50 rounded-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="w-14 h-14 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : friends.length === 0 ? (
                  <Card className="bg-gray-800/40 border border-gray-700/50 rounded-lg">
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-300 text-lg mb-2">No friends yet</p>
                      <p className="text-gray-500">Search above to find and connect with friends</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {friends.map((friend: any) => (
                      <Card
                        key={friend.id}
                        className="bg-gray-800/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/60 transition-all duration-200 hover:shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            {friend.image ? (
                              <img src={friend.image} alt={friend.name} className="w-14 h-14 rounded-lg object-cover shadow-md" />
                            ) : (
                              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="font-bold text-white text-lg">{friend.avatar}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-lg">{friend.name}</h3>
                              <p className="text-gray-300 text-base">{friend.username}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="rounded-md border-green-500 text-green-400 bg-green-500/10 px-3 py-1"
                              >
                                {friend.songsThisWeek} songs
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFriend(friend.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Friend Suggestions */}
              {friendSuggestions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Suggested Friends</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {friendSuggestions.map((suggestion: any) => (
                      <Card
                        key={suggestion.id}
                        className="bg-gray-800/30 border border-gray-700/30 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {suggestion.image ? (
                              <img src={suggestion.image} alt={suggestion.displayName} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="font-bold text-white text-sm">{suggestion.avatar}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-white">{suggestion.displayName}</p>
                              <p className="text-gray-400 text-sm">{suggestion.username}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddFriend(suggestion.id)}
                              className="rounded-lg border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pick" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Pick Your Songs</h2>
              <p className="text-gray-300 text-lg">
                Choose 1-3 songs to share this week ({selectedSongs.length}/3 selected)
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {selectedSongs.length > 0 && (
                <Card className="bg-gray-800/40 border border-gray-700/50 rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Your Picks This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedSongs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-4 bg-gray-700/40 border border-gray-600/50 rounded-lg border-l-4 border-l-green-500"
                      >
                        {song.image ? (
                          <img src={song.image} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white text-lg">{song.title}</p>
                          <p className="text-gray-300 text-base">{song.artist}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSong(song.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gray-800/40 border border-gray-700/50 rounded-lg">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <Search className="h-5 w-5" />
                    Search Songs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search for songs or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-white placeholder:text-gray-400"
                  />

                  {isSearching && (
                    <div className="text-center text-gray-300 py-6">Searching…</div>
                  )}
                  {!!searchError && (
                    <div className="text-center text-red-400 py-6">{searchError}</div>
                  )}

                  {!isSearching && !searchError && searchQuery && searchResults.length === 0 && (
                    <div className="text-center text-gray-400 py-6">No results</div>
                  )}

                  <div className="space-y-3">
                    {searchResults.map((track: any) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        {track.image ? (
                          <img src={track.image} alt={track.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Music className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-white text-lg">{track.name}</p>
                          <p className="text-gray-300 text-base">{track.artists}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSong({ id: track.id, title: track.name, artist: track.artists, uri: track.uri, image: track.image })}
                          disabled={selectedSongs.length >= 3 || selectedSongs.some((s) => s.id === track.id)}
                          className="rounded-lg border-green-500 text-green-400 hover:bg-green-500 hover:text-white disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-white">Past Playlists</h2>
              <p className="text-gray-300 text-lg">Your previous weekly collaborative playlists</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4">
              {pastPlaylists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-lg hover:bg-gray-800/60 transition-all duration-200 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                        <Music className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">Week of {playlist.week}</h3>
                        <p className="text-gray-300 text-base">
                          {playlist.songs} songs from {playlist.friends} friends
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-lg border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-transparent"
                      >
                        <SpotifyIcon />
                        <span className="ml-2">Play</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
