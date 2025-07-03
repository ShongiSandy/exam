"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileEditModal from "./ProfileEditModal";
import AvatarUploadForm from "./AvatarUploadForm";
import UserAvatar from "../UserAvatar";
import { useSession } from "../../SessionProvider";

interface ProfileSectionProps {
  user: {
    id?: string;
    displayName?: string;
    avatarUrl?: string | null;
    backgroundUrl?: string | null;
  };
  isCollapsed: boolean;
}

export default function ProfileSection({
  user: initialUser,
  isCollapsed,
}: ProfileSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: sessionUser, updateProfile } = useSession();

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    sessionUser?.avatarUrl ?? initialUser.avatarUrl ?? null
  );
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<string | null>(
    sessionUser?.backgroundUrl ?? initialUser.backgroundUrl ?? null
  );

  useEffect(() => {
    setCurrentAvatarUrl(sessionUser?.avatarUrl ?? null);
    setCurrentBackgroundUrl(sessionUser?.backgroundUrl ?? null);
  }, [sessionUser?.avatarUrl, sessionUser?.backgroundUrl]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAvatarUpdateSuccess = (
    newAvatarUrl: string | null,
    newBackgroundUrl: string | null
  ) => {
    setCurrentAvatarUrl(newAvatarUrl);
    setCurrentBackgroundUrl(newBackgroundUrl);
    updateProfile({
      avatarUrl: newAvatarUrl ?? undefined,
      backgroundUrl: newBackgroundUrl ?? undefined,
    });
  };

  const displayName =
    sessionUser?.displayName || initialUser.displayName || "Customer Name";

  return (
    <div className={cn(
      "relative transition-all duration-300 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700/50",
      isCollapsed && "h-0 overflow-hidden"
    )}>
      {/* Background Image Container with Gradient Overlay */}
      <div className="relative w-full h-56 overflow-hidden group">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/70 to-gray-900/90 z-10"></div>
        
        {/* Background Image */}
        {currentBackgroundUrl ? (
          <Image
            src={currentBackgroundUrl}
            alt={`${displayName}'s background image`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        )}

        {/* Edit Background Button */}
        <button
          onClick={openModal}
          className="absolute right-4 top-4 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-sm transition-all z-20 border border-gray-700/50 hover:border-gray-600/70 shadow-lg hover:shadow-xl hover:scale-105"
          aria-label="Edit background"
        >
          <Pencil size={18} className="text-gray-200" />
        </button>
      </div>

      {/* Centered Avatar Container */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20">
        <div className="relative group">
          <div className="rounded-full border-4 border-white/90 overflow-hidden shadow-2xl h-32 w-32 ring-4 ring-gray-900/20 group-hover:ring-gray-800/40 transition-all duration-300">
            <UserAvatar
              avatarUrl={currentAvatarUrl}
              size={isCollapsed ? 112 : 128}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
        </div>
      </div>
      
      {/* User Name */}
      <div className="pt-16 pb-6 text-center px-4">
        <h3 className="text-xl font-semibold text-white">{displayName}</h3>
        <p className="text-gray-300 text-sm mt-1">Premium Member</p>
      </div>

      <ProfileEditModal isOpen={isModalOpen} onClose={closeModal}>
        <AvatarUploadForm
          avatarUrl={currentAvatarUrl}
          backgroundUrl={currentBackgroundUrl}
          onSuccess={handleAvatarUpdateSuccess}
          onClose={closeModal}
        />
      </ProfileEditModal>
    </div>
  );
}