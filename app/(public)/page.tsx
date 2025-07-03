// app/(public)/page.tsx

import { validateRequest } from "@/auth";
import { getSlides } from "./_components/(section-1)/_crud-actions/get-slides-actions";
import HeroSlider from "./_components/(section-1)/HeroSlide";
import FeaturesSection from "./_components/(section-2)/RegisterSection";
import ProductTabs from "./_components/(section-3)/ProductTabs";

export default async function Home() {
  const [initialSlidesResponse, { user }] = await Promise.all([
    getSlides(),
    validateRequest(),
  ]);

  const userRole = user?.role ?? "USER";

  return (
    <main className="flex min-h-screen flex-col">
    {/* Hero Section - centered in viewport */}
    <div className="w-screen h-[calc(90vh-5rem)] flex items-center justify-center relative -mt-28 overflow-hidden">
      <HeroSlider
        userRole={userRole}
        initialSlides={initialSlidesResponse.data || []}
      />
    </div>
      {/* Features Section */}
      <div className="-mt-16">
        <FeaturesSection />
      </div>

      {/* Product Tabs Section */}
      <div className="mt-4">
        <ProductTabs />
      </div>
    </main>
  );
}