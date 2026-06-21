import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import clientPromise from "./db";

const client = await clientPromise;
const db = client.db("ticketbari");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "FPEGw0QsAYl62IAoLJTM6Udxuz9Aubln",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFraud: user.isFraud,
          };
        },
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: true,
      },
      isFraud: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});
