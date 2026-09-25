import NextAuth, { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "servicenow",
      name: "ServiceNow",
      type: "oauth",
      authorization: {
        url: `${process.env.NEXT_PUBLIC_SN_INSTANCE_URL}/oauth_auth.do`,
        params: { response_type: "code" },
      },
      token: `${process.env.NEXT_PUBLIC_SN_INSTANCE_URL}/oauth_token.do`,
      userinfo: `${process.env.NEXT_PUBLIC_SN_INSTANCE_URL}/api/now/table/sys_user?sysparm_limit=1`,
      clientId: process.env.SN_CLIENT_ID,
      clientSecret: process.env.SN_CLIENT_SECRET,
      profile(profile) {
        // ServiceNow typically returns an array of records for the table API
        const user = profile.result?.[0] || profile;
        return {
          id: user.sys_id,
          name: user.name || user.user_name,
          email: user.email,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
        
        // Fetch roles from ServiceNow if we just logged in
        // Real implementation would query sys_user_has_role joined with sys_user
        // For this frontend demo, we will mock the roles assignment based on the auth config
        // In a real scenario:
        // const res = await fetch(`${process.env.NEXT_PUBLIC_SN_INSTANCE_URL}/api/now/table/sys_user_has_role?sysparm_query=user=${user.id}`, { headers: { Authorization: `Bearer ${account.access_token}` }})
        // const rolesData = await res.json()
        
        // Mocked roles for the demo (granting admin to anyone for the sake of the UI layout working locally)
        token.roles = ["x_swreq.employee", "x_swreq.manager", "x_swreq.it_support", "x_swreq.admin"];
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.user.roles = token.roles || [];
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
