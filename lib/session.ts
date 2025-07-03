import { lucia } from "@/lib/auth.config";
import { cookies } from "next/headers"; // Use Next.js built-in cookies API


export async function getSession(req?: any, res?: any) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("auth_session")?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const { session } = await lucia.validateSession(sessionId);
    return session;
  } catch {
    return null;
  }
}

export async function getUserFromSession(req?: any, res?: any) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("auth_session")?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const { user } = await lucia.validateSession(sessionId);
    return user;
  } catch {
    return null;
  }
}
