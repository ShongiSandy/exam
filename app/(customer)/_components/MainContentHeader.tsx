// app/(customer)/_components/MainContentHeader.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Home, MessageCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import UserButton from "./UserButton";
import { Input } from "@/components/ui/input";

const MainContentHeader = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchValue);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50",
      "h-16 px-8",
      "flex items-center justify-between gap-4",
      "bg-gradient-to-r from-[#e87a64] via-[#e87a64]/90 to-[#e87a64]/80",
      "dark:from-[#132541] dark:via-[#132541]/90 dark:to-[#132541]/80",
      "shadow-lg shadow-[#e87a64]/10 dark:shadow-[#132541]/10",
      "border-b border-white/10",
      "backdrop-blur-md"
    )}>
      {/* Left section */}
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          className={cn(
            "relative p-2.5 rounded-xl",
            "bg-white/5",
            "transition-all duration-300 ease-out",
            "hover:bg-white/15 hover:scale-105 active:scale-95",
            "group"
          )}
        >
          <Home className="w-6 h-6 text-white" />
          <div className={cn(
            "absolute -bottom-12 left-1/2 -translate-x-1/2",
            "px-3 py-1.5 rounded-lg",
            "bg-white/95 backdrop-blur-sm",
            "text-[#e87a64] dark:text-[#132541] font-medium",
            "shadow-lg shadow-black/5",
            "opacity-0 group-hover:opacity-100 transition-all duration-200",
            "pointer-events-none"
          )}>
            Home
          </div>
        </Link>

        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
            className={cn(
              "w-72 h-10 pl-11 pr-4",
              "bg-white/10 border-white/20",
              "text-white placeholder-white/50",
              "rounded-full",
              "transition-all duration-300",
              "focus:bg-white/15 focus:border-white/30 focus:ring-0",
              "hover:bg-white/15"
            )}
          />
          <button
            type="submit"
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "text-white/50 hover:text-white",
              "transition-colors duration-200"
            )}
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-5">
        <button
          className={cn(
            "relative p-2.5 rounded-xl",
            "bg-white/5",
            "transition-all duration-300",
            "hover:bg-white/15 hover:scale-105 active:scale-95",
            "group"
          )}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadMessages > 0 && (
            <div className={cn(
              "absolute -top-1 -right-1",
              "w-4 h-4 rounded-full",
              "bg-gradient-to-r from-yellow-400 to-orange-500",
              "border-2 border-white",
              "transition-transform duration-300",
              "group-hover:scale-110"
            )} />
          )}
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "relative p-2.5 rounded-xl",
            "bg-white/5",
            "transition-all duration-300",
            "hover:bg-white/15 hover:scale-105 active:scale-95",
            "group"
          )}
        >
          {theme === "dark" ? (
            <Sun className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <Moon className="w-6 h-6 text-white transition-transform duration-300 group-hover:-rotate-12" />
          )}
        </button>

        <div className="pl-2 transition-transform duration-300 hover:scale-105">
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default MainContentHeader;