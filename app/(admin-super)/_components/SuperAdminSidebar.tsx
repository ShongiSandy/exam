// app/(admin-super)/_components/SuperAdminSidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '../SessionProvider'; // Use session from this layout
import UserAvatar from './UserAvatar'; // Use local avatar
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, Users, BarChart2, Settings, LogOut, ChevronDown, LayoutDashboard, Bell, Star, CreditCard, HelpCircle, Sun, Moon } from 'lucide-react'; // Add/remove icons as needed
import { useTheme } from 'next-themes';

// Dummy Nav Items based on example image (replace with actual routes)
const dummyNavItems = [
    { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard }, // Point base to routing hub or actual dashboard
    { name: "Notifications", href: "#", icon: Bell },
    { name: "Assign Roles", href: "#", icon: Star },
    { name: "Billing", href: "#", icon: CreditCard },
    { name: "Help", href: "#", icon: HelpCircle },
    // Add more items based on example if needed (Audience, Posts, Schedules, Income, Promote)
];

const SuperAdminSidebar = () => {
    const pathname = usePathname();
    const { user } = useSession(); // Get user data for display
    const { theme, setTheme } = useTheme();

    if (!user) {
        // Should ideally not happen due to layout protection, but good practice
        return null;
    }

    return (
        <aside className={cn(
            "flex h-screen w-64 flex-col",
            "border-r border-gray-800 bg-gray-900",
            "relative z-30"
        )}>
            {/* Logo/Title Section */}
            <div className="flex h-16 items-center border-b border-gray-800 px-6 shrink-0">
                <Link href="/routing-hub" className="flex items-center gap-2 font-semibold text-lg text-white">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                        </svg>
                    </div>
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Super Admin</span>
                </Link>
            </div>

            {/* 2. User Info Dropdown (optional based on example) */}
             {/* <div className="border-b border-border px-4 py-3 shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <div className='flex items-center gap-2'>
                                <UserAvatar avatarUrl={user.avatarUrl} size={24} />
                                <span className='text-sm font-medium truncate'>{user.displayName}</span>
                            </div>
                             <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             </div> */}

            {/* 3. Scrollable Navigation Section */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {dummyNavItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            "text-gray-300 hover:bg-gray-800 hover:text-white",
                            (pathname === item.href || (item.href !== "/routing-hub" && pathname.startsWith(item.href)))
                                ? "bg-gray-800 text-white shadow-lg"
                                : ""
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* 4. Bottom Section (e.g., Theme Toggle) */}
            <div className="mt-auto border-t border-gray-800 p-4 shrink-0">
                <div className="flex items-center justify-between px-2">
                    <div className="text-xs text-gray-500">
                        v1.0.0
                    </div>
                    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                        <button 
                            onClick={() => setTheme('light')} 
                            className={`p-1.5 rounded-md ${theme === 'light' ? 'bg-gray-700 text-yellow-400' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Sun className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => setTheme('dark')} 
                            className={`p-1.5 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            <Moon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                {/* Add other items like settings link or logout if needed */}
            </div>
        </aside>
    );
}

export default SuperAdminSidebar;