// auth.config.ts
import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Lucia adapter using Prisma
const adapter = new PrismaAdapter(
  prisma.session,
  prisma.user
);

// Initialize Lucia with the adapter
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Set these attributes for the session cookie
    name: "auth_session",
    expires: false, // Session cookies (expire when browser is closed)
    attributes: {
      // Cookie security settings
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax", // CSRF protection
      // Note: httpOnly is handled automatically by Lucia
      path: "/" // Available across the entire site
    }
  },
  getUserAttributes: (databaseUser) => {
    // Transform database user to the user object provided to the auth handlers
    return {
      id: databaseUser.id,
      username: databaseUser.username,
      firstName: databaseUser.firstName,
      lastName: databaseUser.lastName,
      displayName: databaseUser.displayName,
      email: databaseUser.email,
      phoneNumber: databaseUser.phoneNumber,
      streetAddress: databaseUser.streetAddress,
      suburb: databaseUser.suburb,
      townCity: databaseUser.townCity,
      postcode: databaseUser.postcode,
      country: databaseUser.country,
      avatarUrl: databaseUser.avatarUrl,
      backgroundUrl: databaseUser.backgroundUrl,
      role: databaseUser.role,
      tier: databaseUser.tier
    };
  }
});

// Type declaration for better TypeScript support
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      displayName: string;
      email: string;
      passwordHash: string;
      phoneNumber: string;
      streetAddress: string;
      suburb: string | null;
      townCity: string;
      postcode: string;
      country: string;
      avatarUrl: string | null;
      backgroundUrl: string | null;
      agreeTerms: boolean;
      role: string;
      tier: string;
    };
  }
}