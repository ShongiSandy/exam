// app/(public)/(collections)/(routes)/(collections)/[slug]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Banner } from '@/components/banner/Banner';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { getProducts } from '@/lib/api/products';
import { auth } from '@/auth';

interface CollectionPageProps {
  params: {
    slug: string[];
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = params.slug?.[0] || 'all';
  const title = collection === 'all' 
    ? 'All Products' 
    : `${collection.charAt(0).toUpperCase() + collection.slice(1)} Collection`;

  return {
    title: `${title} | Our Store`,
    description: `Browse our ${collection} collection`,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const session = await auth();
  const collection = params.slug?.[0] || 'all';
  
  // Validate collection slug
  const validCollections = ['all', 'headwear', 'apparel'];
  if (!validCollections.includes(collection)) {
    notFound();
  }

  // Fetch products for the collection
  const products = await getProducts(collection, searchParams);
  
  // Collection display names
  const collectionNames: { [key: string]: string } = {
    all: 'All Products',
    headwear: 'Headwear Collection',
    apparel: 'Apparel Collection',
  };

  // Collection descriptions
  const collectionDescriptions: { [key: string]: string } = {
    all: 'Discover our full range of products',
    headwear: 'Find the perfect hat or cap for any occasion',
    apparel: 'Explore our stylish clothing collection',
  };

  return (
    <div className="space-y-8">
      {/* Collection Banner */}
      <Banner 
        collection={collection as 'all' | 'headwear' | 'apparel'}
        title={collectionNames[collection] || collectionNames['all']}
        description={collectionDescriptions[collection] || collectionDescriptions['all']}
        ctaText="Shop Now"
        ctaLink={`/collections/${collection}`}
        showEditButton={session?.user.role === 'EDITOR'}
      />

      {/* Collection Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {collectionNames[collection] || 'Products'}
          </h2>
          {/* Add sorting/filtering UI here if needed */}
        </div>
        
        {products.length > 0 ? (
          <ProductsGrid products={products} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        )}
      </section>
    </div>
  );
}
