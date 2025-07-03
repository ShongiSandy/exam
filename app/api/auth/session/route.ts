import { NextResponse } from 'next/server';
import { lucia } from '@/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
    const result = await lucia.validateSession(sessionId || '');
    
    if (!result.session || !result.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    // Return only the necessary user data
    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
        // Add other user fields you need from result.user
      },
    });
    
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
