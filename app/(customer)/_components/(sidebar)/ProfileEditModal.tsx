"use client"; // <<< MUST BE THE VERY FIRST LINE

// You can put comments *after* the directive
// This modal provides the backdrop and close functionality

import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  children,
}: ProfileEditModalProps) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, onClose]);

  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced overlay with gradient backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 backdrop-blur-md transition-all duration-500"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Enhanced modal container */}
      <div className="relative w-full max-w-2xl mx-auto z-10 transform transition-all duration-500 ease-out scale-95 opacity-0 animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-xl">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10 opacity-50"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 z-20 shadow-lg hover:scale-110"
            aria-label="Close modal"
          >
            <X size={22} className="text-gray-200" />
          </button>

          {/* Modal header */}
          <div className="border-b border-gray-700/50 px-8 py-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Edit Profile
            </h2>
            <p className="text-gray-400 mt-1 text-sm">
              Update your profile picture and background
            </p>
          </div>

          {/* Modal content */}
          <div className="p-8 pt-6">
            <div className="relative space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
