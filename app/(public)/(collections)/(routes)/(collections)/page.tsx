// app/(public)/(collections)/(routes)/(collections)/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Banner } from '@/components/banner/Banner';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { getProducts } from '@/lib/api/products';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Browse our collections',
};

export default async function CollectionsPage() {
  const session = await auth();
  
  // In a real app, you would fetch the featured products
  const featuredProducts = await getProducts('featured', { limit: 8 });

  return (
    <div className="space-y-8">
      {/* Featured Banner */}
      <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
        <Banner 
          collection="all"
          title="Featured Collection"
          description="Discover our latest products"
          ctaText="Shop Now"
          ctaLink="/collections/all"
          showEditButton={session?.user.role === 'EDITOR'}
        />
      </Suspense>

      {/* Featured Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <ProductsGrid products={featuredProducts} />
      </section>
    </div>
  );
}
