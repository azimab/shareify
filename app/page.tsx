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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Music className="h-7 w-7 text-green-500" />
            <h1 className="text-2xl font-bold text-white">Shareify</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mb-24 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Friends > Algorithms
          </h2>
          <p className="text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Get music recommendations from your friends instead of robots.
          </p>
          <Button
            onClick={() => signIn("spotify")}
            className="bg-green-600 hover:bg-green-500 text-white px-10 py-5 text-xl font-medium transition-colors rounded-full"
          >
            <SpotifyIcon />
            <span className="ml-3">Start Discovering</span>
          </Button>
        </div>

        {/* How it Works */}
        <div className="mb-24">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">1</div>
              <h4 className="text-2xl font-semibold text-white">Share 3 songs</h4>
              <p className="text-gray-400 text-lg">Pick your weekly favorites</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">2</div>
              <h4 className="text-2xl font-semibold text-white">Discover together</h4>
              <p className="text-gray-400 text-lg">See what friends are loving</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">3</div>
              <h4 className="text-2xl font-semibold text-white">Get your playlist</h4>
              <p className="text-gray-400 text-lg">Friends' picks + smart recommendations</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">Better than Spotify's algorithm</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-green-400">🎯 Real taste</h4>
              <p className="text-gray-300">Friends know good music</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-green-400">🌟 New genres</h4>
              <p className="text-gray-300">Break out of your bubble</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-green-400">🤝 Social connection</h4>
              <p className="text-gray-300">Music brings people together</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-green-400">🎵 Fresh weekly</h4>
              <p className="text-gray-300">New discoveries every week</p>
            </div>
          </div>
          
          <Button
            onClick={() => signIn("spotify")}
            className="bg-green-600 hover:bg-green-500 text-white px-10 py-5 text-xl font-medium transition-colors rounded-full mt-12"
          >
            <SpotifyIcon />
            <span className="ml-3">Try it now</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
