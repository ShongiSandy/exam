"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Calendar,
  CreditCard,
  Settings,
  HelpCircle,
  MessageSquare,
  LayoutDashboard,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationLinksProps {
  isCollapsed: boolean;
}

export default function NavigationLinks({ isCollapsed }: NavigationLinksProps) {
  const currentPath = usePathname();

  const isActive = (href: string) => {
    if (!currentPath) return false;
    if (href === "/customer") {
      return currentPath === "/customer";
    }
    return currentPath.startsWith(href);
  };

  const navItems = [
    { href: "/customer", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/customer/orders", icon: ShoppingBag, label: "My Orders" },
    { href: "/customer/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/customer/subscriptions", icon: Calendar, label: "Subscriptions" },
    { href: "/customer/payment-methods", icon: CreditCard, label: "Payment Methods" },
    { href: "/customer/support", icon: HelpCircle, label: "Support" },
    { href: "/customer/mymessages", icon: MessageSquare, label: "My Messages" },
    { href: "/customer/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="py-4">
      <ul className="space-y-2 px-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="group">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center",
                  "py-3 px-4",
                  "text-base",
                  isCollapsed ? "justify-center" : "justify-start",
                  "text-gray-300 hover:text-white",
                  "rounded-lg",
                  "transition-all duration-500 ease-out", // Slower, smoother transition
                  "transform hover:scale-105 hover:-translate-y-0.5", // Added slight lift effect
                  "hover:bg-gradient-to-r hover:from-[#e87a64] hover:to-[#132541]", // Gradient background on hover
                  active && "bg-gradient-to-r from-[#e87a64] to-[#132541] text-white shadow-lg",
                  "relative overflow-hidden",
                  "hover:shadow-lg hover:shadow-[#e87a64]/20", // Colored shadow
                  "group"
                )}
              >
                <div className="relative z-10 flex items-center w-full">
                  <Icon
                    className={cn(
                      "flex-shrink-0 transition-transform duration-300",
                      isCollapsed ? "transform hover:scale-110 hover:rotate-6" : "mr-4", // Added rotation
                      active ? "text-white" : "text-gray-300",
                      "group-hover:animate-bounce" // Bounce animation instead of pulse
                    )}
                    size={24}
                  />
                  {!isCollapsed && (
                    <span 
                      className={cn(
                        "transform transition-all duration-300",
                        "group-hover:translate-x-1",
                        "group-hover:text-white",
                        "relative after:content-[''] after:absolute after:bottom-0 after:left-0",
                        "after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300",
                        "group-hover:after:w-full" // Underline animation
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
                {/* Enhanced shine effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0",
                    "group-hover:animate-shine-fast" // Faster shine animation
                  )}
                />
                {isCollapsed && (
                  <div 
                    className={cn(
                      "absolute left-full ml-2 px-3 py-2", // Increased padding
                      "bg-gradient-to-r from-[#e87a64] to-[#132541]", // Matching gradient
                      "text-white rounded-lg text-sm whitespace-nowrap",
                      "opacity-0 pointer-events-none",
                      "transform -translate-x-2 transition-all duration-300",
                      "group-hover:opacity-100 group-hover:translate-x-0",
                      "shadow-lg shadow-[#e87a64]/20", // Matching shadow
                      "z-50"
                    )}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}