// components/banner/Banner.tsx

'use client';

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/app/SessionProvider";

export interface BannerProps {
  collection: 'headwear' | 'apparel' | 'all';
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  className?: string;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export function Banner({
  collection,
  title,
  description,
  ctaText = 'Shop Now',
  ctaLink = '#',
  imageUrl,
  className = '',
  showEditButton = false,
  onEdit,
}: BannerProps) {
  const { user } = useSession();
  const isEditor = user?.role === 'EDITOR';
  
  // Default banner data based on collection
  const defaultBanners = {
    headwear: {
      title: 'Headwear Collection',
      description: 'Discover our latest headwear styles',
      imageUrl: '/banners/headwear.jpg',
    },
    apparel: {
      title: 'Apparel Collection',
      description: 'Explore our clothing line',
      imageUrl: '/banners/apparel.jpg',
    },
    all: {
      title: 'Featured Collection',
      description: 'Check out our featured products',
      imageUrl: '/banners/featured.jpg',
    },
  };

  // Use provided props or fall back to defaults
  const banner = {
    title: title || defaultBanners[collection]?.title || 'Collection',
    description: description || defaultBanners[collection]?.description || '',
    imageUrl: imageUrl || defaultBanners[collection]?.imageUrl || '/banners/default.jpg',
  };

  return (
    <div className={`relative w-full h-64 md:h-96 rounded-lg overflow-hidden group ${className}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
      <img
        src={banner.imageUrl}
        alt={banner.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-start justify-center p-8 md:p-16 z-20 text-white">
        <h2 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h2>
        {banner.description && (
          <p className="text-lg md:text-xl mb-6 max-w-lg">{banner.description}</p>
        )}
        <Button asChild variant="secondary" size="lg">
          <Link href={ctaLink}>{ctaText}</Link>
        </Button>
      </div>

      {/* Edit Button (Visible to Editors) */}
      {(isEditor && showEditButton) && (
        <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Pencil className="h-4 w-4 mr-2" /> Edit Banner
          </Button>
        </div>
      )}
    </div>
  );
}
