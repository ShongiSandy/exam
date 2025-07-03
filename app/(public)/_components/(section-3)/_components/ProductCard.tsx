// app/(public)/_components/(section-3)/_components/ProductCard.tsx
import React from "react";
import Image from "next/image";
import { Package, Star, Pencil, Trash2 } from "lucide-react";
import {
  ProductCardProps as ImportedProductCardProps,
  BaseProductProps,
  RegularProductProps,
  SaleProductProps,
} from "../types";
import { cn } from "@/lib/utils";

type ProductCardComponentProps = ImportedProductCardProps & {
  userRole?: string;
  onEdit?: (item: ImportedProductCardProps) => void;
  onDelete?: (item: ImportedProductCardProps) => void;
};

const ProductCard: React.FC<ProductCardComponentProps> = (props) => {
  const { id, name, rating, image, userRole, onEdit, onDelete } = props;
  const isEditor = userRole === "EDITOR";

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(props);
    } else {
      console.warn("onEdit handler not provided to ProductCard for item:", id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(props);
    } else {
      console.warn(
        "onDelete handler not provided to ProductCard for item:",
        id,
      );
    }
  };

  const renderPrice = () => {
    if ("price" in props && typeof props.price === "string") {
      return (
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          R{props.price}
        </span>
      );
    } else if (
      "salePrice" in props &&
      typeof props.salePrice === "string" &&
      "originalPrice" in props &&
      typeof props.originalPrice === "string"
    ) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-red-500 dark:text-red-400">
            R{props.salePrice}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
            R{props.originalPrice}
          </span>
        </div>
      );
    }
    return <span className="text-lg font-semibold text-gray-900 dark:text-white">--</span>;
  };

  const renderStars = () => {
    const starCount = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < starCount
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            )}
            strokeWidth={i < starCount ? 0 : 1}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="group relative overflow-hidden rounded-xl transition-all duration-300
        bg-white dark:bg-gray-800/50 backdrop-blur-sm
        hover:shadow-2xl hover:shadow-gray-200/40 dark:hover:shadow-gray-900/20
        hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700/60
        hover:border-gray-200 dark:hover:border-gray-600"
    >
      {/* Image container with hover effect */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-700/30">
        {image ? (
          <>
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-700/40">
            <Package className="h-12 w-12 text-gray-300 dark:text-gray-500" />
          </div>
        )}
        
        {/* Action buttons */}
        {isEditor && (
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleEditClick}
              className="p-2 bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-200
                rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-all duration-200
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Edit ${name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-200
                rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all duration-200
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Delete ${name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        
        {/* Quick view button */}
        <button 
          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 
            text-sm font-medium text-gray-800 dark:text-white py-2 px-4 rounded-full opacity-0 
            group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300
            hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900
            shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          Quick View
        </button>
      </div>
      
      {/* Product info */}
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {name}
          </h3>
          <div className="flex-shrink-0">
            {renderPrice()}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            {renderStars()}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({Math.floor(Math.random() * 100) + 10})
            </span>
          </div>
          
          <button 
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        
        <button 
          className="w-full mt-4 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg
            transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2
            focus:ring-gray-900 focus:ring-offset-2 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;