import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";


export const authOptions = {

  providers: [

    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return user;
        } catch (error) {
          console.log("Error: ", error);
        } 
      },
    }),
  ],

  // callbacks: {
  //   async session({ session, user, token }) {
  //     console.log("session:",{session, user, token});
  //     return session
  //   },
  //   async jwt({ token, user, account, profile, isNewUser }) {
  //     console.log("jwt:",{token, user, account, profile, isNewUser});
  //     return token
  //   },
  // },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/auth/login",
  },
};



const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };