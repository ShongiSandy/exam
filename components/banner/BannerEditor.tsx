// components/banner/BannerEditor.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Upload as UploadIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Banner } from '@/types/banner';

type BannerFormData = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>;

export interface BannerEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner;
  onSave: (bannerData: BannerFormData, file?: File) => Promise<Banner>;
}

export function BannerEditor({ 
  open, 
  onOpenChange, 
  banner: initialBanner,
  onSave 
}: BannerEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    collection: 'all',
    imageUrl: '',
    link: '',
    status: 'draft',
  });

  const collections = [
    { id: 'headwear', name: 'Headwear' },
    { id: 'apparel', name: 'Apparel' },
    { id: 'all', name: 'All Collections' },
  ] as const;
  
  const statuses = [
    { id: 'draft', name: 'Draft' },
    { id: 'active', name: 'Active' },
    { id: 'archived', name: 'Archived' },
  ] as const;

  // Initialize form with banner data when editing
  useEffect(() => {
    if (initialBanner) {
      const { id, createdAt, updatedAt, ...bannerData } = initialBanner;
      setFormData(bannerData);
      setPreviewUrl(initialBanner.imageUrl);
    } else {
      // Reset form for new banner
      setFormData({
        title: '',
        description: '',
        collection: 'all',
        imageUrl: '',
        link: '',
        status: 'draft',
      });
      setPreviewUrl(null);
      setFile(null);
    }
  }, [initialBanner, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.collection) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // For new banners, we need a file
    if (!initialBanner && !file) {
      toast.error('Please upload an image for the banner');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare banner data - ensure all required fields are included
      const bannerData: BannerFormData = {
        ...formData,
        // Ensure we have default values for required fields
        title: formData.title.trim(),
        collection: formData.collection as 'headwear' | 'apparel' | 'all',
        status: formData.status as 'draft' | 'active' | 'archived',
        // For new banners, we'll get the imageUrl from the server response
        // For updates, we'll use the existing imageUrl if no new file is provided
        imageUrl: initialBanner?.imageUrl || ''
      };
      
      // Call the onSave handler with the banner data and file
      await onSave(bannerData, file || undefined);
      
      // Reset form and close the dialog
      setFormData({
        title: '',
        description: '',
        collection: 'all',
        imageUrl: '',
        link: '',
        status: 'draft',
      });
      setPreviewUrl(null);
      setFile(null);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save banner');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {initialBanner ? 'Edit Banner' : 'Create New Banner'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Summer Collection"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="collection">Collection *</Label>
                  <Select
                    value={formData.collection}
                    onValueChange={(value) => handleSelectChange('collection', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter a description for this banner"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">Link URL</Label>
                  <Input
                    id="link"
                    name="link"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.link}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Image</Label>
                {previewUrl ? (
                  <div className="relative rounded-md border border-dashed p-4">
                    <div className="relative h-40 w-full overflow-hidden rounded-md">
                      <img
                        src={previewUrl}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      <Label
                        htmlFor="banner-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                      >
                        <span>Upload an image</span>
                        <input
                          id="banner-upload"
                          name="banner-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Label>
                      <p className="mt-1 text-xs">or drag and drop</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>
              
              {!initialBanner && !previewUrl && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ImageIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Image required</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Please upload an image for your banner.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || (!initialBanner && !previewUrl)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {initialBanner ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      {initialBanner ? 'Update Banner' : 'Create Banner'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
