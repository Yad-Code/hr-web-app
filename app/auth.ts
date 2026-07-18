import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { sql } from "@/app/lib/db"; // 👈 Your existing postgres singleton instance
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // 1. Hook into your database using the pg-adapter
  adapter: PostgresAdapter(sql),
  
  // 2. Select Session Strategy (JWT works best for mixed RBAC systems)
  session: { strategy: "jwt" },
  
  // 3. Configure Auth Providers
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch the user from the database securely
        const rows = await sql`
          SELECT * FROM users WHERE email = ${credentials.email as string}
        `;
        const user = rows[0];

        // Replace this with your actual password verification logic (e.g., bcrypt comparison)
        if (user && user.password_hash === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Pass the custom role down into the token metadata
          };
        }
        
        return null;
      }
    })
  ],
  
  // 4. Inject structural role parameters into the session context
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // Custom redirect mapping back to your custom login page
  }
});