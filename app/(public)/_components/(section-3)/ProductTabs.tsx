// app/(public)/_components/(section-3)/ProductTabs.tsx
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBestSellersContent } from "./_components/(best-seller)/BestSellers";
import { useOnSaleContent } from "./_components/(on-sale)/OnSale";
import { ProductSlide } from "./_components/ProductSlide";
import { useNewArrivalsContent } from "./_components/(new-arrivals)/NewArrivals";
// --- Use StoreItem type ---
import { StoreItem, Viewport, TabContent } from "./types";
import { useSession } from "@/app/SessionProvider"; // Use the ROOT session provider

// Removed ProductCardProps import as conversion happens in ProductSlide

const ProductTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSession(); // Get user from root session
  const userRole = user?.role ?? "USER"; // Determine user role, default to USER

  // Fetch content using hooks - these now return TabContent type
  const newArrivalsContent = useNewArrivalsContent();
  const bestSellersContent = useBestSellersContent();
  const onSaleContent = useOnSaleContent();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const tabs = [
    { name: "New Arrivals", id: 0, contentHook: newArrivalsContent },
    { name: "Best Sellers", id: 1, contentHook: bestSellersContent },
    { name: "On Sale", id: 2, contentHook: onSaleContent },
  ];

  // Function to get the correct content based on tab and viewport
  const getCurrentContent = (): (StoreItem | { isEmpty: true })[][] => {
    const viewport: Viewport = isMobile ? "mobile" : "desktop";
    const tabData = tabs.find((tab) => tab.id === activeTab)?.contentHook;
    return tabData?.[viewport] ?? [[]]; // Return content or empty slide array
  };

  const currentContentPages = getCurrentContent();
  const currentSlideContent = currentContentPages[activeSlide] ?? []; // Get items for the active slide
  const maxSlides = currentContentPages.length;

  const handleNextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % maxSlides);
  const handlePrevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + maxSlides) % maxSlides);

  // Reset active slide when switching tabs or viewport changes affect maxSlides
  useEffect(() => {
    setActiveSlide(0);
  }, [activeTab, maxSlides]); // Reset also if maxSlides changes (e.g., viewport switch)

  return (
    <section className="w-full py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-gray-800/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 dark:to-gray-950/80" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4">
            Discover Our Products
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our curated collections of premium products
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap
                  ${activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Container */}
        <div className="relative">
          {currentSlideContent.length > 0 ? (
            <ProductSlide
              products={currentSlideContent}
              isMobile={isMobile}
              activeTab={activeTab}
              tabName={tabs[activeTab].name}
              userRole={userRole}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground dark:text-white/70">
              No items to display in this section yet.
            </div>
          )}

          {/* Navigation Buttons */}
          {maxSlides > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-white dark:bg-burgundy-dark/80 border border-border/10 rounded-full p-2 shadow-md hover:bg-secondary dark:hover:bg-burgundy-light/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
                disabled={maxSlides <= 1}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-primary dark:text-white" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-white dark:bg-burgundy-dark/80 border border-border/10 rounded-full p-2 shadow-md hover:bg-secondary dark:hover:bg-burgundy-light/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
                disabled={maxSlides <= 1}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary dark:text-white" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {maxSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(maxSlides)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors
                    ${activeSlide === idx 
                      ? "bg-primary dark:bg-white" 
                      : "bg-secondary dark:bg-white/30 hover:bg-muted dark:hover:bg-white/50"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductTabs;