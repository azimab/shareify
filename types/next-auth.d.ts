import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    userId?: string
    user: DefaultSession["user"] & {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}


