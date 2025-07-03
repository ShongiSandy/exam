"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, SessionUser } from "../../SessionProvider";

// Import actions and types
import {
  updateCheckoutPreferences,
  updateCustomerProfileInfo,
  changePassword
} from "./_actions/actions";
import type { ProfileUpdateActionResult } from "./_actions/actions";
import {
  CheckoutDetailsFormValues,
  ProfileUpdateFormValues,
  PasswordChangeFormValues
} from "./_actions/types";

import ProfileInfoForm from "./_components/ProfileInfoForm";
import CheckoutDetailsForm from "./_components/CheckoutDetailsForm";
import PasswordChangeForm from "./_components/PasswordChangeForm";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSettingsPage() {
  const { user: sessionUser, updateProfile: updateClientSessionProfile } = useSession();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const validTabs = ["personal-info", "checkout-details", "security"];
  const defaultTabValue = initialTab && validTabs.includes(initialTab) ? initialTab : "personal-info";

  const [currentUserData, setCurrentUserData] = useState<SessionUser | null>(sessionUser);
  
  useEffect(() => {
    setCurrentUserData(sessionUser);
  }, [sessionUser]);

  const handleProfileInfoSubmit = async (data: ProfileUpdateFormValues): Promise<void> => {
    if (!updateClientSessionProfile) {
      toast.error("Session context error.");
      return;
    }
    setIsSubmittingInfo(true);
    try {
      const result: ProfileUpdateActionResult = await updateCustomerProfileInfo(data);
      if (result.success) {
        toast.success(result.success);
        if (result.updatedUser) {
          updateClientSessionProfile(result.updatedUser);
          setCurrentUserData((prev) => prev ? { ...prev, ...result.updatedUser } : null);
        }
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleCheckoutPreferencesSubmit = async (data: CheckoutDetailsFormValues): Promise<void> => {
    setIsSubmittingCheckout(true);
    try {
      const result = await updateCheckoutPreferences(data);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error updating checkout preferences:", error);
      toast.error("An unexpected error occurred saving preferences.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeFormValues): Promise<void> => {
    setIsSubmittingPassword(true);
    try {
      const result = await changePassword(data);
      if (result.success) {
        toast.success("Password updated successfully");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (!currentUserData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            Account Settings
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your personal information, checkout preferences, and security settings
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <Tabs 
            defaultValue={defaultTabValue} 
            className="w-full"
            activationMode="manual"
          >
            <TabsList className="w-full h-16 px-2 sm:px-6 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 rounded-none">
              <TabsTrigger 
                value="personal-info" 
                className="group relative px-4 py-3.5 text-sm font-medium rounded-lg mx-1 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/50 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <User className="w-4 h-4 mr-2" />
                <span>Personal Info</span>
                <span className="absolute -bottom-px left-1/2 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 group-data-[state=active]:w-4/5 group-data-[state=active]:left-[10%]" />
              </TabsTrigger>
              <TabsTrigger 
                value="checkout-details"
                className="group relative px-4 py-3.5 text-sm font-medium rounded-lg mx-1 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/50 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                <span>Checkout</span>
                <span className="absolute -bottom-px left-1/2 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 group-data-[state=active]:w-4/5 group-data-[state=active]:left-[10%]" />
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="group relative px-4 py-3.5 text-sm font-medium rounded-lg mx-1 transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700/50 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
              >
                <Lock className="w-4 h-4 mr-2" />
                <span>Security</span>
                <span className="absolute -bottom-px left-1/2 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-200 group-data-[state=active]:w-4/5 group-data-[state=active]:left-[10%]" />
              </TabsTrigger>
            </TabsList>

          <AnimatePresence mode="wait">
            <motion.div 
              key={defaultTabValue}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              <TabsContent value="personal-info" className="m-0">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Update your personal details and contact information.
                    </p>
                  </div>
                  <ProfileInfoForm
                    key={`profile-${currentUserData.id}-${JSON.stringify(currentUserData)}`}
                    user={currentUserData}
                    onSubmit={handleProfileInfoSubmit}
                    isSubmitting={isSubmittingInfo}
                  />
                </div>
              </TabsContent>

              <TabsContent value="checkout-details" className="m-0">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout Preferences</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manage your default payment and shipping options.
                    </p>
                  </div>
                  <CheckoutDetailsForm
                    onSubmit={handleCheckoutPreferencesSubmit}
                    isSubmitting={isSubmittingCheckout}
                  />
                </div>
              </TabsContent>

              <TabsContent value="security" className="m-0">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Settings</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Secure your account with a strong password and additional security measures.
                    </p>
                  </div>
                  <PasswordChangeForm
                    onSubmit={handlePasswordChange}
                    isSubmitting={isSubmittingPassword}
                  />
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
}