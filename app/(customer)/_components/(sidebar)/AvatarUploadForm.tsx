// app/(customer)/_components/(sidebar)/AvatarUploadForm.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // For Background Image
import { User as UserIcon, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { uploadAvatar } from "./_profile-actions/profile-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploadFormProps {
  avatarUrl: string | null;
  backgroundUrl: string | null;
  onSuccess: (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null,
  ) => void;
  onClose: () => void;
}

export default function AvatarUploadForm({
  avatarUrl,
  backgroundUrl,
  onSuccess,
  onClose,
}: AvatarUploadFormProps) {
  // State for the files selected by the user
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [selectedBackgroundFile, setSelectedBackgroundFile] =
    useState<File | null>(null);

  // State for the URL to *display* in the preview (can be original URL or temporary blob URL)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    avatarUrl,
  );
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<
    string | null
  >(backgroundUrl);

  // State specifically to track the *currently active blob URLs* created by this component instance
  const [currentAvatarBlobUrl, setCurrentAvatarBlobUrl] = useState<
    string | null
  >(null);
  const [currentBackgroundBlobUrl, setCurrentBackgroundBlobUrl] = useState<
    string | null
  >(null);

  // State for loading indicator
  const [isUploading, setIsUploading] = useState(false);

  // Refs for the hidden file input elements
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // --- Helper Function to Revoke Blob URLs ---
  const revokeUrl = (url: string | null) => {
    // Only revoke if it's a blob URL
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // --- File Selection Handlers ---
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedAvatarFile(file); // Store the selected file

    // Revoke the *previous* blob URL if one existed for the avatar
    revokeUrl(currentAvatarBlobUrl);

    // Create a *new* temporary blob URL for preview
    const newPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(newPreviewUrl); // Update the display URL
    setCurrentAvatarBlobUrl(newPreviewUrl); // Store the new blob URL for later revocation
  };

  const handleBackgroundFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedBackgroundFile(file); // Store the selected file

    // Revoke the *previous* blob URL if one existed for the background
    revokeUrl(currentBackgroundBlobUrl);

    // Create a *new* temporary blob URL for preview
    const newPreviewUrl = URL.createObjectURL(file);
    setBackgroundPreviewUrl(newPreviewUrl); // Update the display URL
    setCurrentBackgroundBlobUrl(newPreviewUrl); // Store the new blob URL for later revocation
  };

  // --- Blob URL Cleanup Effect ---
  // This effect runs when the component unmounts to prevent memory leaks
  useEffect(() => {
    // Capture the current blob URLs when the effect is set up
    const avatarBlobToRevoke = currentAvatarBlobUrl;
    const backgroundBlobToRevoke = currentBackgroundBlobUrl;

    // Return a cleanup function
    return () => {
      revokeUrl(avatarBlobToRevoke);
      revokeUrl(backgroundBlobToRevoke);
    };
    // Dependency array ensures cleanup targets the blobs from this specific render cycle
  }, [currentAvatarBlobUrl, currentBackgroundBlobUrl]);

  // --- Form Submission Handler ---
  const handleSubmit = async () => {
    const isAvatarSelected = !!selectedAvatarFile;
    const isBackgroundSelected = !!selectedBackgroundFile;

    // Check if at least one *new* file has been selected
    if (!isAvatarSelected && !isBackgroundSelected) {
      toast.error("Please select a new avatar or background image to upload.");
      return;
    }

    setIsUploading(true); // Show loading state
    const formData = new FormData();

    // Append files to FormData *only if they were selected*
    if (isAvatarSelected && selectedAvatarFile) {
      formData.append("avatar", selectedAvatarFile);
    }
    if (isBackgroundSelected && selectedBackgroundFile) {
      formData.append("background", selectedBackgroundFile);
    }

    try {
      // --- Call the Server Action ---
      const response = await uploadAvatar(formData);

      if (response.success) {
        // Determine the final URLs to pass back
        // Use the URL from the response if it exists (meaning that image was uploaded)
        // Otherwise, keep the original URL passed in via props (meaning that image wasn't changed)
        const finalAvatarUrl = response.avatarUrl ?? avatarUrl;
        const finalBackgroundUrl = response.backgroundUrl ?? backgroundUrl;

        // --- Call parent's success handler with PERMANENT URLs ---
        onSuccess(finalAvatarUrl, finalBackgroundUrl);

        // --- Show Success Toast ---
        let successMessage = "";
        if (isAvatarSelected && isBackgroundSelected) {
          successMessage =
            "Amazing!!! You've successfully updated your profile and background images!!!";
        } else if (isAvatarSelected) {
          successMessage =
            "Amazing!!! You've successfully updated your profile image!!!";
        } else {
          // Only background was selected
          successMessage =
            "Amazing!!! You've successfully updated your background image!!!";
        }
        toast.success(successMessage);

        // --- Close Modal After Delay ---
        setTimeout(() => {
          onClose();
        }, 2000); // 2 seconds delay
      } else {
        // Handle errors reported by the server action
        console.error("Upload failed:", response.error);
        toast.error(response.error || "Upload failed. Please try again.");
        setIsUploading(false); // Stop loading on server error
      }
    } catch (error) {
      // Handle unexpected errors (e.g., network issues)
      console.error("Error calling upload action:", error);
      toast.error("An error occurred during upload. Please try again.");
      setIsUploading(false); // Stop loading on unexpected error
    }
    // No finally block setting isUploading=false here, because onClose handles modal dismissal
  };

  // --- JSX Structure ---
  return (
    <div className="text-center p-1">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Update Your Profile
      </h2>
      
      {/* Combined background and profile image preview */}
      <div className="mb-8 mx-auto relative group">
        {/* Background Image Preview */}
        <div
          className="w-full h-48 rounded-xl overflow-hidden relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 shadow-xl"
          aria-label="Background image preview container"
        >
          {backgroundPreviewUrl ? (
            <Image
              src={backgroundPreviewUrl}
              alt="Background Preview"
              fill
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              width={400}
              height={160}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No background selected</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* Edit background button */}
          <button
            type="button"
            onClick={() => backgroundFileInputRef.current?.click()}
            className="absolute bottom-4 right-4 bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-sm text-gray-200 rounded-full p-2.5 shadow-lg transition-all hover:scale-105 border border-gray-600/50 hover:border-gray-500/70"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={backgroundFileInputRef}
            onChange={handleBackgroundFileSelect}
            accept="image/*"
            className="hidden"
            aria-label="Upload background image"
          />
        </div>

        {/* Avatar Preview */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <div className="relative group">
            <div className="h-28 w-28 rounded-full border-4 border-white/90 overflow-hidden shadow-2xl bg-gray-800 ring-4 ring-gray-900/20 group-hover:ring-gray-700/40 transition-all duration-300">
              {avatarPreviewUrl ? (
                <Image
                  src={avatarPreviewUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <UserIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110 border-2 border-white/90"
              aria-label="Edit profile picture"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>{" "}
      {/* End of preview container */}
      {/* Hidden file inputs - These are necessary */}
      <input
        ref={backgroundFileInputRef}
        id="background-upload"
        type="file"
        accept="image/*" // Allow standard image types
        className="hidden" // Keep them hidden
        onChange={handleBackgroundFileSelect}
        aria-label="Upload background image input" // More specific label
      />
      <input
        ref={avatarFileInputRef}
        id="avatar-upload"
        type="file"
        accept="image/*" // Allow standard image types
        className="hidden" // Keep them hidden
        onChange={handleAvatarFileSelect}
        aria-label="Upload profile picture input" // More specific label
      />
      {/* Buttons to trigger hidden inputs */}
      <div className="mb-6 mt-16">
        {" "}
        {/* Added spacing */}
        <button
          type="button" // Prevent accidental form submission
          onClick={() => backgroundFileInputRef.current?.click()} // Trigger the hidden input
          className="w-full py-3 px-3 bg-teal-500 text-white rounded text-center font-medium hover:bg-teal-400 transition cursor-pointer"
          aria-label="Select new background image"
        >
          {/* Dynamic button text */}
          {selectedBackgroundFile
            ? "Change Background Image"
            : "Select Background Image"}
        </button>
        {/* Display name of selected file */}
        {selectedBackgroundFile && (
          <p className="mt-2 text-sm text-gray-500" aria-live="polite">
            Selected: {selectedBackgroundFile.name}
          </p>
        )}
      </div>
      <div className="mb-6">
        <button
          type="button" // Prevent accidental form submission
          onClick={() => avatarFileInputRef.current?.click()} // Trigger the hidden input
          className="w-full py-3 px-3 bg-teal-500 text-white rounded text-center font-medium hover:bg-teal-400 transition cursor-pointer"
          aria-label="Select new profile picture"
        >
          {/* Dynamic button text */}
          {selectedAvatarFile ? "Change Avatar" : "Select Avatar"}
        </button>
        {/* Display name of selected file */}
        {selectedAvatarFile && (
          <p className="mt-2 text-sm text-gray-500" aria-live="polite">
            Selected: {selectedAvatarFile.name}
          </p>
        )}
      </div>
      {/* Action Buttons (Cancel/Save) */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose} // Close modal immediately on cancel
          className="w-1/2 py-3 px-3 bg-slate-200 rounded text-slate-800 text-center font-medium hover:bg-slate-300 transition"
          disabled={isUploading} // Disable cancel while upload is in progress (optional, but good practice)
          aria-label="Cancel changes"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit} // Trigger the upload process
          className="w-1/2 py-3 px-3 bg-teal-500 rounded text-white text-center font-medium hover:bg-teal-400 transition disabled:bg-teal-300 disabled:cursor-not-allowed"
          disabled={
            // Disable if EITHER no new file is selected OR an upload is in progress
            (!selectedAvatarFile && !selectedBackgroundFile) || isUploading
          }
          aria-label="Save profile changes"
        >
          {isUploading ? "Saving..." : "Save"}
        </button>
      </div>
    </div> // End of the single top-level parent element
  );
}
