// lib/api/banners.ts

import { Banner, CreateBannerDto, UpdateBannerDto } from '@/types/banner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    (error as any).status = response.status;
    throw error;
  }
  
  return data.data || data;
}

// Fetch all banners
export async function getBanners(): Promise<Banner[]> {
  try {
    const response = await fetch('/api/banners', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { tags: ['banners'] },
    });

    return handleResponse<Banner[]>(response);
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
}

// Create a new banner with file upload
export async function createBannerWithFile(
  data: Omit<CreateBannerDto, 'imageUrl'>,
  file: File
): Promise<Banner> {
  try {
    const formData = new FormData();
    
    // Append banner data as JSON string
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('collection', data.collection);
    if (data.link) formData.append('link', data.link);
    formData.append('status', data.status || 'draft');
    
    // Append the file
    formData.append('file', file);

    const response = await fetch('/api/banners', {
      method: 'POST',
      body: formData,
    });

    return handleResponse<Banner>(response);
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
}

// Update a banner with optional file upload
export async function updateBanner(
  id: string,
  updates: UpdateBannerDto,
  file?: File
): Promise<Banner> {
  try {
    const formData = new FormData();
    
    // Append banner data
    if (updates.title) formData.append('title', updates.title);
    if (updates.description !== undefined) formData.append('description', updates.description);
    if (updates.collection) formData.append('collection', updates.collection);
    if (updates.link !== undefined) formData.append('link', updates.link || '');
    if (updates.status) formData.append('status', updates.status);
    
    // Append file if provided
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`/api/banners/${id}`, {
      method: 'PATCH',
      body: formData,
    });

    return handleResponse<Banner>(response);
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
}

// Delete a banner
export async function deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/banners/${id}`, {
      method: 'DELETE',
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
}

// Get banners by collection
export async function getBannersByCollection(collection: string): Promise<Banner[]> {
  const banners = await getBanners();
  return banners.filter(banner => 
    banner.collection === collection || banner.collection === 'all'
  );
}
