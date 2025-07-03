'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Image as ImageIcon, Plus, Trash2, Edit, Search, Loader2 } from "lucide-react";
import { Banner } from '@/types/banner';
import { BannerEditor } from '@/components/banner/BannerEditor';
import { toast } from 'sonner';
import { 
  getBanners, 
  deleteBanner, 
  createBannerWithFile, 
  updateBanner 
} from '@/lib/api/banners';
import { useAuth } from '@/hooks/use-auth';

const collections = [
  { id: 'all', name: 'All Collections' },
  { id: 'headwear', name: 'Headwear' },
  { id: 'apparel', name: 'Apparel' },
];

const statuses = [
  { id: 'all', name: 'All Statuses' },
  { id: 'active', name: 'Active' },
  { id: 'draft', name: 'Draft' },
  { id: 'archived', name: 'Archived' },
];

export default function BannersPage() {
  const router = useRouter();
  const { session, status } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>(undefined);

  // Check if user is editor
  const isEditor = session?.user?.role === 'EDITOR' || 
                  session?.user?.role === 'ADMIN' || 
                  session?.user?.role === 'SUPERADMIN';

  // Redirect if not editor
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !isEditor) {
      router.push('/');
    }
  }, [status, isEditor, router]);

  // Fetch banners
  useEffect(() => {
    if (isEditor) {
      fetchBanners();
    }
  }, [isEditor]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter banners based on search and filters
  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        banner.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCollection = selectedCollection === 'all' || 
                            banner.collection === selectedCollection;
    
    const matchesStatus = selectedStatus === 'all' || 
                         banner.status === selectedStatus;
    
    return matchesSearch && matchesCollection && matchesStatus;
  });

  // Handle banner deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      setIsDeleting(id);
      await deleteBanner(id);
      setBanners(banners.filter(banner => banner.id !== id));
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete banner');
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle banner editing
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsEditorOpen(true);
  };

  // Handle closing the editor
  const handleEditorOpenChange = (open: boolean) => {
    setIsEditorOpen(open);
    if (!open) {
      setEditingBanner(undefined);
    }
  };

  // Handle banner creation/update
  const handleSave = async (bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>, file?: File) => {
    try {
      let savedBanner: Banner;
      
      if (editingBanner) {
        // Update existing banner
        savedBanner = await updateBanner(editingBanner.id, bannerData, file);
        setBanners(banners.map(b => b.id === savedBanner.id ? savedBanner : b));
        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        if (!file) {
          throw new Error('Please select an image for the banner');
        }
        savedBanner = await createBannerWithFile(bannerData, file);
        setBanners([savedBanner, ...banners]);
        toast.success('Banner created successfully');
      }
      
      setIsEditorOpen(false);
      setEditingBanner(undefined);
      return savedBanner;
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save banner');
      throw error; // Re-throw to allow the form to handle the error
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Banner Management</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage collection banners
          </p>
        </div>
        <Button onClick={() => {
          setEditingBanner(undefined);
          setIsEditorOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Banners</CardTitle>
              <CardDescription>
                Manage your collection banners
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search banners..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No banners found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedCollection !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new banner'}
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCollection('all');
                setSelectedStatus('all');
                setEditingBanner(undefined);
                setIsEditorOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Create Banner
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banner</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-20 rounded-md bg-muted overflow-hidden">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{banner.title}</div>
                            {banner.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {banner.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {collections.find(c => c.id === banner.collection)?.name || banner.collection}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={banner.status === 'active' ? 'default' : 'secondary'}
                          className={banner.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''}
                        >
                          {banner.status.charAt(0).toUpperCase() + banner.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(banner)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(banner.id)}
                            disabled={isDeleting === banner.id}
                            className="text-destructive hover:text-destructive/90"
                          >
                            {isDeleting === banner.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Editor Dialog */}
      <BannerEditor
        open={isEditorOpen}
        onOpenChange={handleEditorOpenChange}
        banner={editingBanner}
        onSave={handleSave}
      />
    </div>
  );
}
