"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

import { upsertCollectionBanner } from "@/app/(public)/(group-products)/_actions/bannerManagementActions";

// Validation Schema
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const bannerEditSchema = z.object({
  image: z
    .custom<FileList>((val) => val instanceof FileList, {
      message: "Please select an image file",
    })
    .refine((files) => files?.length === 1, "One file is required.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    )
    .refine(
      (files) => ALLOWED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported."
    ),
});

type BannerEditFormValues = z.infer<typeof bannerEditSchema>;

interface BannerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryName: string;
  currentImageUrl: string | null | undefined;
  onSuccess: (newImageUrl: string) => void;
}

export default function BannerEditModal({
  isOpen,
  onClose,
  category,
  categoryName,
  currentImageUrl,
  onSuccess,
}: BannerEditModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

// Update the form initialization
const form = useForm<BannerEditFormValues>({
  resolver: zodResolver(bannerEditSchema),
  defaultValues: {
    image: null as unknown as FileList, // This is a workaround for the type issue
  },
});

  useEffect(() => {
    if (isOpen) {
      setImagePreview(currentImageUrl ?? null);
      form.reset();
    } else {
      setImagePreview(null);
    }
  }, [isOpen, currentImageUrl, form]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
          event.target.value = "";
          return;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error("Invalid file type. Please use JPG, PNG, WEBP, or GIF.");
          event.target.value = "";
          return;
        }
        form.setValue("image", files, { shouldValidate: true });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        form.setValue("image", null as unknown as FileList, { shouldValidate: true });
        setImagePreview(currentImageUrl ?? null);
      }
    },
    [form, currentImageUrl]
  );
  const handleFormSubmit = async (values: BannerEditFormValues) => {
    try {
      const file = values.image?.[0];
      if (!file) {
        toast.error("Please select an image file.");
        return;
      }

      setIsSaving(true);
      const formData = new FormData();
      formData.append("image", file);

      const result = await upsertCollectionBanner(category, formData);

      if (!result) {
        throw new Error("No response received from server");
      }

      if (result.success && result.newImageUrl) {
        toast.success(result.message || "Banner updated successfully!");
        onSuccess(result.newImageUrl);
        onClose();
      } else {
        throw new Error(result.error || "Failed to update banner.");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving the banner."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Banner for {categoryName}</DialogTitle>
          <DialogDescription>
            Upload a new banner image. Recommended aspect ratio: wide (e.g., 4:1).
            Max size 6MB.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-2"
          >
            <FormItem>
              <FormLabel>Image Preview</FormLabel>
              <div className="mt-1 aspect-[4/1] relative w-full h-auto rounded border border-dashed border-border overflow-hidden bg-secondary flex items-center justify-center text-muted-foreground">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Banner preview"
                    layout="fill"
                    objectFit="contain"
                  />
                ) : (
                  <span>Upload an image to preview</span>
                )}
              </div>
            </FormItem>

            <FormField
              control={form.control}
              name="image"
              render={({ field: { ref, name, onBlur } }) => (
                <FormItem>
                  <FormLabel>New Banner Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(",")}
                      ref={ref}
                      name={name}
                      onBlur={onBlur}
                      onChange={handleFileChange}
                      disabled={isSaving}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Uploading..." : "Upload & Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}