'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

interface Session {
  user: User;
  sessionId: string;
  // Add other session properties as needed
}

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          setStatus('unauthenticated');
          return;
        }

        const data = await response.json();
        
        if (!data || !data.user) {
          setStatus('unauthenticated');
          return;
        }

        setSession(data);
        setStatus('authenticated');
      } catch (error) {
        console.error('Auth error:', error);
        setStatus('unauthenticated');
      }
    }

    checkAuth();
  }, [router]);

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setSession(null);
        setStatus('unauthenticated');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    session,
    status,
    signOut,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
