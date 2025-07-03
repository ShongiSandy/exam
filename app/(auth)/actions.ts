"use server";

import { lucia, validateRequest } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  try {
    const { session } = await validateRequest();

    if (session) {
      try {
        await lucia.invalidateSession(session.id);
      } catch (error) {
        console.error('Error invalidating session:', error);
        // Continue with logout even if session invalidation fails
      }
    }

    // Clear the session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    
    // Create a new response and set the cookie
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: "/auth/signin",
        'Set-Cookie': `${sessionCookie.name}=${sessionCookie.value}; Path=/; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}HttpOnly; SameSite=Lax; Expires=${new Date(0).toUTCString()}`
      }
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return redirect("/auth/signin");
  }
}
