"use client"

import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

const SpotifyIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
)

export default function RootPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "authenticated") {
    return null // Will redirect
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              Shareify
            </h1>
          </div>
          
          {/* Sign In Button */}
          <Button
            onClick={() => signIn("spotify")}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white transition-colors"
          >
            <SpotifyIcon />
            <span className="ml-2">Sign In</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Centered and Compact */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Friends
              </span>
              <span className="text-gray-500 mx-4">></span>
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                Algorithms
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get music recommendations from your friends instead of robots.
            </p>
            <Button
              onClick={() => signIn("spotify")}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-4 text-lg font-medium transition-all duration-300 rounded-full shadow-lg hover:shadow-green-500/25"
            >
              <SpotifyIcon />
              <span className="ml-3">Start Discovering</span>
            </Button>
          </div>

          {/* How it Works - Compact */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                1
              </div>
              <h4 className="text-lg font-semibold text-white">Share 3 songs</h4>
              <p className="text-gray-400 text-sm">Pick your weekly favorites</p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                2
              </div>
              <h4 className="text-lg font-semibold text-white">Discover together</h4>
              <p className="text-gray-400 text-sm">See what friends are loving</p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto">
                3
              </div>
              <h4 className="text-lg font-semibold text-white">Get your playlist</h4>
              <p className="text-gray-400 text-sm">Friends' picks + recommendations</p>
            </div>
          </div>

          {/* Features - Compact */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-green-400">Real taste</h4>
              <p className="text-gray-400 text-sm">Friends know good music</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-green-400">New genres</h4>
              <p className="text-gray-400 text-sm">Break out of your bubble</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-green-400">Social connection</h4>
              <p className="text-gray-400 text-sm">Music brings people together</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-green-400">Fresh weekly</h4>
              <p className="text-gray-400 text-sm">New discoveries every week</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
