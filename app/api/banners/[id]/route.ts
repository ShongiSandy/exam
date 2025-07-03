// app/api/banners/[id]/route.ts
import { NextResponse } from 'next/server';
import { lucia } from '@/auth';
import { UserRole } from '@prisma/client';
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

// PATCH /api/banners/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = (await getSession()) || {};
    
    // Only editors and admins can update banners
    if (!user || 
        (user.role !== UserRole.EDITOR && 
         user.role !== UserRole.ADMIN &&
         user.role !== UserRole.SUPERADMIN)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bannerId = params.id;
    const bannerIndex = banners.findIndex(b => b.id === bannerId);
    
    if (bannerIndex === -1) {
      return new NextResponse('Banner not found', { status: 404 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const collection = formData.get('collection') as string | null;
    const link = formData.get('link') as string | null;
    const status = formData.get('status') as string | null;
    const file = formData.get('file') as File | null;
    
    // Update banner with new data
    const updatedBanner = { ...banners[bannerIndex] };
    
    if (title) updatedBanner.title = title;
    if (description !== null) updatedBanner.description = description;
    if (collection) updatedBanner.collection = collection;
    if (link !== null) updatedBanner.link = link;
    if (status) updatedBanner.status = status;
    
    // Handle file upload if a new file is provided
    if (file) {
      // Delete old file if it exists
      if (updatedBanner.imageUrl) {
        try {
          const oldFilePath = join(process.cwd(), 'public', updatedBanner.imageUrl);
          if (existsSync(oldFilePath)) {
            await unlink(oldFilePath);
          }
        } catch (error) {
          console.error('Error deleting old banner image:', error);
        }
      }
      
      // Upload new file
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'banners');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = join(uploadsDir, fileName);
      const publicUrl = `/uploads/banners/${fileName}`;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      updatedBanner.imageUrl = publicUrl;
    }
    
    updatedBanner.updatedAt = new Date().toISOString();
    
    // Update in-memory storage
    banners[bannerIndex] = updatedBanner;
    
    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/banners/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = (await getSession()) || {};
    
    // Only editors and admins can delete banners
    if (!user || 
        (user.role !== UserRole.EDITOR && 
         user.role !== UserRole.ADMIN &&
         user.role !== UserRole.SUPERADMIN)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const bannerId = params.id;
    const bannerIndex = banners.findIndex(b => b.id === bannerId);
    
    if (bannerIndex === -1) {
      return new NextResponse('Banner not found', { status: 404 });
    }
    
    // Delete the banner image file
    const banner = banners[bannerIndex];
    if (banner.imageUrl) {
      try {
        const filePath = join(process.cwd(), 'public', banner.imageUrl);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error('Error deleting banner image:', error);
      }
    }
    
    // Remove from in-memory storage
    banners = banners.filter(b => b.id !== bannerId);
    
    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
