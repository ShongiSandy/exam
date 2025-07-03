// app/(public)/(collections)/(routes)/(collections)/layout.tsx

import { ReactNode } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { EditorNavbar } from '@/app/(editor)/_components/EditorNavbar';

export default async function CollectionsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/login');
  }
  
  // Check if user has editor or admin role
  const isEditor = session.user.role === 'EDITOR' || 
                  session.user.role === 'ADMIN' || 
                  session.user.role === 'SUPERADMIN';
  
  // Redirect to home if not authorized
  if (!isEditor) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <EditorNavbar />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
