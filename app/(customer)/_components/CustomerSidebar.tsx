// app/(customer)/_components/CustomerSidebar.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SessionUser } from "../SessionProvider";
import ProfileSection from "./(sidebar)/ProfileSection";
import NavigationLinks from "./(sidebar)/NavigationLinks";
import { useTheme } from "next-themes";

interface CustomerSidebarProps {
  user: SessionUser;
  orderCount: number;
  wishlistCount: number;
}

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  user,
  orderCount,
  wishlistCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useTheme();
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col",
        "bg-primary dark:bg-primary-dark text-white/90",
        "transition-all duration-500 ease-in-out",
        "relative z-30",
        "border-r border-primary/20 dark:border-primary-dark/20",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex-shrink-0">
        <ProfileSection user={user} isCollapsed={isCollapsed} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavigationLinks isCollapsed={isCollapsed} />
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className={cn(
          "absolute top-1/2 -right-3 transform -translate-y-1/2",
          "w-6 h-6 rounded-full",
          "bg-white dark:bg-primary-dark",
          "flex items-center justify-center",
          "hover:scale-110 transition-transform duration-200",
          "border border-primary/20 dark:border-white/20",
          "text-primary dark:text-white/90",
          "shadow-md"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};

export default CustomerSidebar;