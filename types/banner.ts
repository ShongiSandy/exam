// types/banner.ts

export interface Banner {
  id: string;
  title: string;
  description?: string;
  collection: 'headwear' | 'apparel' | 'all';
  imageUrl: string;
  link?: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  collection: 'headwear' | 'apparel' | 'all';
  imageUrl: string;
  link?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}

export interface BannerFilters {
  search?: string;
  collection?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
