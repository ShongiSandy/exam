import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "../lib/prisma";
import { UserRole, Tier } from "@prisma/client";

// Define user attributes type
declare module "lucia" {
  interface DatabaseUserAttributes {
    username: string;
    email: string;
    role: UserRole;
    tier: Tier;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    backgroundUrl: string | null;
    streetAddress: string | null;
    townCity: string | null;
    stateProvince: string | null;
    postalCode: string | null;
    country: string | null;
  }
}

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      tier: attributes.tier,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      displayName: attributes.displayName,
      avatarUrl: attributes.avatarUrl,
      backgroundUrl: attributes.backgroundUrl,
      streetAddress: attributes.streetAddress,
      townCity: attributes.townCity,
      stateProvince: attributes.stateProvince,
      postalCode: attributes.postalCode,
      country: attributes.country,
    };
  },
});

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export type AuthRequest = {
  userId: string;
  sessionId: string;
  role: UserRole;
  tier: Tier;
};

// ... existing code ...
export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    try {
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        const cookieStore = await cookies();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        const cookieStore = await cookies();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {}
    return result;
  }
);

export async function logout(): Promise<void> {
  const { session } = await validateRequest();
  if (!session) return;
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}