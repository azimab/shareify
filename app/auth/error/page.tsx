"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You cancelled the authorization process.",
  Verification: "The verification token has expired or has already been used.",
  OAuthCallback: "There was an error with the OAuth provider. This might be due to:",
  Default: "An unexpected error occurred during authentication.",
}

const oauthCallbackReasons = [
  "Your Spotify app is in Development Mode and your account hasn't been added to the allowed users list",
  "The Spotify app credentials are incorrect or missing",
  "The redirect URI in your Spotify app settings doesn't match the callback URL",
  "Your Spotify account doesn't have the necessary permissions",
]

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") || "Default"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-800/40 border-gray-700/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-xl text-white">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-center">
            {errorMessages[error as keyof typeof errorMessages] || errorMessages.Default}
          </p>

          {error === "OAuthCallback" && (
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Possible causes:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {oauthCallbackReasons.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => signIn("spotify")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-400">
                <strong>Debug info:</strong> Error type: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
