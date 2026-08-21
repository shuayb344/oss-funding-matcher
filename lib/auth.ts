import { NextAuthOptions, getServerSession } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { supabase } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET || "",
      authorization: {
        params: { scope: "read:user user:email repo" },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        try {
          const githubId = String((profile as any).id || user.id);
          const username = (profile as any).login || user.name || user.email || "unknown";

          
          // Upsert user into Supabase
          const { data: dbUser } = await supabase
            .from("users")
            .upsert(
              {
                github_id: githubId,
                username,
                avatar_url: user.image,
              },
              { onConflict: "github_id" }
            )
            .select("id")
            .single();

          if (dbUser && account.access_token) {
            // Upsert account access token into Supabase
            await supabase.from("accounts").upsert(
              {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
              },
              { onConflict: "provider,providerAccountId" }
            );
          }
        } catch (err) {
          console.error("Error syncing user/account to Supabase:", err);
        }
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.githubId = String((profile as any).id || user?.id);

      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.githubId || token.sub;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

export async function auth() {
  return await getServerSession(authOptions);
}


