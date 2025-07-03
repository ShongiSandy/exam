// @/lib/config/tiers.ts

// Define the tier levels as string literals for better type compatibility
export type TierLevel = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

// Define discount percentages for each tier
export const TIER_DISCOUNTS: Record<string, number> = {
  "BRONZE": 0,
  "SILVER": 0.05, // 5% discount
  "GOLD": 0.10,   // 10% discount
  "PLATINUM": 0.15 // 15% discount
};

// Helper function to get discount percentage for a specific tier
export function getDiscountPercentage(tier: string | null | undefined): number {
  if (!tier) return 0;
  
  const upperTier = tier.toUpperCase();
  return TIER_DISCOUNTS[upperTier] || 0;
}

// Helper function to validate a tier string
export function validateTierLevel(tier: string | null | undefined): TierLevel {
  if (!tier) return "BRONZE";
  
  const upperTier = tier.toUpperCase() as TierLevel;
  return (upperTier === "BRONZE" || upperTier === "SILVER" || 
          upperTier === "GOLD" || upperTier === "PLATINUM") 
          ? upperTier : "BRONZE";
}