import { authOptions } from "@/lib/authOptions"
import { getServerSession } from "next-auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() || ""

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query 'q'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const session = await getServerSession(authOptions)
  const accessToken = (session as any)?.accessToken as string | undefined

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const url = `https://api.spotify.com/v1/search?type=track&limit=10&q=${encodeURIComponent(
    query
  )}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text()
    return new Response(
      JSON.stringify({ error: "Spotify API error", details: text }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    )
  }

  const data = await res.json()
  const tracks = (data?.tracks?.items || []).map((t: any) => ({
    id: t.id as string,
    uri: t.uri as string,
    name: t.name as string,
    artists: (t.artists || []).map((a: any) => a.name).join(", "),
    album: t.album?.name as string,
    image: t.album?.images?.[2]?.url || t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || null,
    durationMs: t.duration_ms as number,
  }))

  return new Response(JSON.stringify({ tracks }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}


