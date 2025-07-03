// app/(editor)/editor/page.tsx

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Settings, Upload, Users, MessageSquare, BarChart2 } from "lucide-react";

export default function EditorDashboardPage() {
  // Mock data for recent activities
  const recentActivities = [
    { id: 1, type: 'banner', action: 'updated', collection: 'Headwear', time: '2 hours ago' },
    { id: 2, type: 'product', action: 'added', name: 'Summer Collection', time: '5 hours ago' },
    { id: 3, type: 'banner', action: 'uploaded', collection: 'Apparel', time: '1 day ago' },
  ];

  // Quick action buttons
  const quickActions = [
    { 
      title: 'Upload Banner', 
      icon: <Upload className="h-6 w-6" />, 
      href: '/collections/banners/upload',
      description: 'Add new banners to collections'
    },
    { 
      title: 'Manage Banners', 
      icon: <ImageIcon className="h-6 w-6" />, 
      href: '/collections/banners',
      description: 'View and edit existing banners'
    },
    { 
      title: 'Content Management', 
      icon: <FileText className="h-6 w-6" />, 
      href: '/content',
      description: 'Manage website content'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage website content and banners
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/collections/banners/upload">
              <Upload className="mr-2 h-4 w-4" /> Upload Banner
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {action.icon}
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription className="pt-2">
                  {action.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your recent actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 last:pb-0 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium">
                    You {activity.action} {activity.type} "{activity.collection || activity.name}"
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Headwear, Apparel, All</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
