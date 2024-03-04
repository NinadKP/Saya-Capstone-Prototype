import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';


import User from '@models/user';
import { connectToDB } from '@utils/database';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
        }
      }
    })
  ],
  redirect: false,
  session: {
    jwt: true,
    secret: 'b69efdb2dcf21c672d6012cec579914290c00404f2494f130c2ef39f96bea0fd6ad81adc97a30cde83381c39623faeac4e96afa3289f38b20d586cbee2db37fba308edcce388c7d06aa333c783f77481',
    secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    cookie: {
      secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  },
  callbacks: {

    async session({ session, token, user }) {

      if (typeof token !== typeof undefined) {
        session.token = token.token;
        session.user = token.token.user;
    
        try {
          const sessionUser = await User.findOne({ email: session.user.email });
          if (sessionUser) {
            session.user.id = sessionUser._id.toString();
          }
          session.accessToken = token.token.account.access_token;
        } catch (error) {
          console.error("Error fetching user from database:", error);
        }
    
        
      }
      

      return session;
    },

    async jwt(token, user, account) {
      if (typeof user !== typeof undefined)
      {
          token.token.user = user;
      }

    return token
  

  },
    async signIn({ account, profile, user, credentials }) {
      try {
        await connectToDB();
        
        // check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
            access_token: account.access_token
          });
        }

        return true
      } catch (error) {
        console.log("Error checking if user exists: ", error.message);
        return false
      }
    },
  },

})

export { handler as GET, handler as POST }