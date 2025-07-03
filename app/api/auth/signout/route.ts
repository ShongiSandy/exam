import { NextResponse } from 'next/server';
import { validateRequest } from '@/auth';

export async function POST() {
  try {
    const { session } = await validateRequest();
    
    if (session) {
      // Invalidate the session in your auth system
      // This depends on your auth implementation
      // For Lucia, you would do something like:
      // await lucia.invalidateSession(session.sessionId);
    }
    
    // Clear the session cookie
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Clear the auth cookie
    response.cookies.set({
      name: 'auth-session',
      value: '',
      expires: new Date(0),
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
