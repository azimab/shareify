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
        <div className="max-w-4xl mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your social replacement for Discover Weekly
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Tired of Spotify's algorithm recommending the same songs? Get music recommendations from your friends instead. 
            Share 3 songs weekly, discover what your friends are listening to, and get personalized playlists based on real human taste.
          </p>
          <Button
            onClick={() => signIn("spotify")}
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-lg font-medium transition-colors"
          >
            <SpotifyIcon />
            <span className="ml-3">Connect Spotify</span>
          </Button>
        </div>

        {/* How it Works */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-12">How it works</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>
              <h4 className="text-xl font-semibold text-white">Pick your weekly songs</h4>
              <p className="text-gray-400">Choose 1-3 songs you're loving this week. Could be anything - new discoveries, old favorites, guilty pleasures.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">2</div>
              <h4 className="text-xl font-semibold text-white">See what friends picked</h4>
              <p className="text-gray-400">Browse through your friends' weekly picks. Discover new artists, genres, and songs you never would have found otherwise.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">3</div>
              <h4 className="text-xl font-semibold text-white">Get your playlist</h4>
              <p className="text-gray-400">We create a Spotify playlist combining your friends' picks plus smart recommendations based on their taste.</p>
            </div>
          </div>
        </div>

        {/* Why Better Than Algorithms */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8">Why friends > algorithms</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">Real human curation</h4>
                <p className="text-gray-400">Your friends know good music. They have context, emotions, and stories behind their picks that no algorithm can match.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">Break out of your bubble</h4>
                <p className="text-gray-400">Algorithms keep you in the same genres. Friends introduce you to completely new styles of music you'd never discover alone.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">Social connection</h4>
                <p className="text-gray-400">Music is social. Share discoveries, discuss songs, and bond over new finds with the people who matter most.</p>
              </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">What you get every week:</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Fresh playlist with friends' picks
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Smart recommendations based on group taste
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  See who recommended what
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Discover new artists and genres
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to discover better music?</h3>
          <p className="text-gray-400 mb-8">Join your friends and start sharing music that actually matters.</p>
          <Button
            onClick={() => signIn("spotify")}
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-lg font-medium transition-colors"
          >
            <SpotifyIcon />
            <span className="ml-3">Get Started with Spotify</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
