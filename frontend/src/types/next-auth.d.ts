import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      roles: string[]
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    roles: string[]
    accessToken?: string
  }
}
