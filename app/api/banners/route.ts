// app/api/banners/route.ts

import { NextResponse } from 'next/server';
import { lucia } from '@/auth';
import { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { cookies } from 'next/headers';

// In-memory storage for demo purposes
// In a real app, you would use a database
let banners: any[] = [];

// Helper function to get the current session
async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  
  const { session, user } = await lucia.validateSession(sessionId);
  return { session, user };
}

// GET /api/banners
export async function GET() {
  try {
    const { user } = (await getSession()) || {};
    
    // Only editors and admins can access the banners
    if (!user || 
        (user.role !== UserRole.EDITOR && 
         user.role !== UserRole.ADMIN &&
         user.role !== UserRole.SUPERADMIN)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Sort by updatedAt in descending order (newest first)
    const sortedBanners = [...banners].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ 
      success: true,
      data: sortedBanners 
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/banners
export async function POST(request: Request) {
  try {
    const { user } = (await getSession()) || {};
    
    // Only editors and admins can create banners
    if (!user || 
        (user.role !== UserRole.EDITOR && 
         user.role !== UserRole.ADMIN &&
         user.role !== UserRole.SUPERADMIN)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const collection = formData.get('collection') as string;
    const link = formData.get('link') as string | null;
    const status = formData.get('status') as string || 'draft';
    const file = formData.get('file') as File | null;
    
    // Validate required fields
    if (!title || !collection || !file) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new NextResponse('Invalid file type. Please upload an image.', { status: 400 });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new NextResponse('File size too large. Maximum size is 5MB.', { status: 400 });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = join(uploadsDir, fileName);
    const publicUrl = `/uploads/banners/${fileName}`;
    
    // Convert file to buffer and save to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Create banner object
    const newBanner = {
      id: `banner_${Date.now()}`,
      title,
      description: description || null,
      collection,
      link: link || null,
      status,
      imageUrl: publicUrl,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to in-memory storage
    banners.push(newBanner);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Banner created successfully',
      data: newBanner 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}


