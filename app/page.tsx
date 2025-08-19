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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full animate-ping delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 bg-gray-900/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-none border border-green-500/30">
                <Music className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                SocialSpot
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-white via-green-200 to-green-400 bg-clip-text text-transparent">
                Music that brings
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                friends together
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Share your favorite songs with friends every week and discover new music through
              <span className="text-green-400 font-semibold"> collaborative playlists</span> that evolve with your
              circle.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: "🎵",
                title: "Weekly Picks",
                description: "Choose 1-3 songs each week to share with your friends",
              },
              {
                icon: "👥",
                title: "Friend Circle",
                description: "Connect with friends and discover their musical taste",
              },
              {
                icon: "🎧",
                title: "Auto Playlists",
                description: "Get curated playlists from everyone's weekly selections",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-none backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="space-y-6 pt-12">
            <Button
              onClick={() => signIn("spotify")}
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-lg font-semibold rounded-none border-2 border-green-500 hover:border-green-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
            >
              <SpotifyIcon />
              <span className="ml-3">Login with Spotify</span>
            </Button>

            <p className="text-sm text-gray-500">Connect your Spotify account to start sharing music with friends</p>
          </div>
        </div>
      </main>
    </div>
  )
}
