"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, MapPin, User, Mail, Phone } from "lucide-react";
import { SessionUser } from "@/app/(customer)/SessionProvider";
import { ProfileUpdateFormValues, profileUpdateSchema } from "../_actions/types";

interface ProfileInfoFormProps {
  user: SessionUser;
  onSubmit: (data: ProfileUpdateFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  user,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'address'>('basic');
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      suburb: user.suburb || "",
      townCity: user.townCity || "",
      postcode: user.postcode || "",
      country: user.country || "",
    },
  });

  const handleSuccessfulSubmit = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-1 shadow-lg"
      >
        <div className="bg-background rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <motion.h2 
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              Your Profile
            </motion.h2>
            
            <AnimatePresence>
              {isCelebrating && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-6 top-6"
                >
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex space-x-2 border-b border-muted pb-2">
            {[
              { id: 'basic', icon: <User className="h-4 w-4" />, label: 'Basic' },
              { id: 'contact', icon: <Mail className="h-4 w-4" />, label: 'Contact' },
              { id: 'address', icon: <MapPin className="h-4 w-4" />, label: 'Address' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            handleSuccessfulSubmit();
          })} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'basic' ? -20 : activeTab === 'contact' ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === 'basic' ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {activeTab === 'basic' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([name, label]) => (
                        <motion.div 
                          key={name}
                          whileHover={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <Label htmlFor={name}>{label}</Label>
                          <Input
                            id={name}
                            {...register(name as keyof ProfileUpdateFormValues)}
                            disabled={isSubmitting}
                            className="bg-background"
                          />
                          {errors[name as keyof ProfileUpdateFormValues] && (
                            <motion.p 
                              className="text-sm text-destructive"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {errors[name as keyof ProfileUpdateFormValues]?.message}
                            </motion.p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[['displayName', 'Display Name'], ['username', 'Username']].map(([name, label]) => (
                        <motion.div 
                          key={name}
                          whileHover={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <Label htmlFor={name}>{label}</Label>
                          <Input
                            id={name}
                            {...register(name as keyof ProfileUpdateFormValues)}
                            disabled={isSubmitting}
                            className="bg-background"
                          />
                          {errors[name as keyof ProfileUpdateFormValues] && (
                            <motion.p 
                              className="text-sm text-destructive"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {errors[name as keyof ProfileUpdateFormValues]?.message}
                            </motion.p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'contact' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['email', 'Email'], ['phoneNumber', 'Phone Number']].map(([name, label]) => (
                      <motion.div 
                        key={name}
                        whileHover={{ scale: 1.01 }}
                        className="space-y-2"
                      >
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          type={name === 'email' ? 'email' : 'text'}
                          {...register(name as keyof ProfileUpdateFormValues)}
                          disabled={isSubmitting}
                          placeholder={name === 'phoneNumber' ? "(Optional)" : ""}
                          className="bg-background"
                        />
                        {errors[name as keyof ProfileUpdateFormValues] && (
                          <motion.p 
                            className="text-sm text-destructive"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors[name as keyof ProfileUpdateFormValues]?.message}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'address' && (
                  <div className="space-y-4">
                    {[['streetAddress', 'Street Address'], ['suburb', 'Suburb / Apt / Unit #']].map(([name, label]) => (
                      <motion.div 
                        key={name}
                        whileHover={{ scale: 1.01 }}
                        className="space-y-2"
                      >
                        <Label htmlFor={name}>{label}</Label>
                        <Input
                          id={name}
                          {...register(name as keyof ProfileUpdateFormValues)}
                          disabled={isSubmitting}
                          placeholder={name === 'suburb' ? "(Optional)" : ""}
                          className="bg-background"
                        />
                        {errors[name as keyof ProfileUpdateFormValues] && (
                          <motion.p 
                            className="text-sm text-destructive"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            {errors[name as keyof ProfileUpdateFormValues]?.message}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[['townCity', 'Town / City'], ['postcode', 'Postcode'], ['country', 'Country']].map(([name, label]) => (
                        <motion.div 
                          key={name}
                          whileHover={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <Label htmlFor={name}>{label}</Label>
                          <Input
                            id={name}
                            {...register(name as keyof ProfileUpdateFormValues)}
                            disabled={isSubmitting}
                            className="bg-background"
                          />
                          {errors[name as keyof ProfileUpdateFormValues] && (
                            <motion.p 
                              className="text-sm text-destructive"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {errors[name as keyof ProfileUpdateFormValues]?.message}
                            </motion.p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

<motion.div
  className="flex justify-end"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
  <motion.button
    type="submit"
    disabled={isSubmitting}
    className="relative overflow-hidden group inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
      </>
    ) : (
      <>
        <span className="relative z-10">Save Changes</span>
        <motion.span
          className="absolute inset-0 bg-primary/10"
          initial={{ width: 0 }}
          animate={{ width: isSubmitting ? '100%' : 0 }}
          transition={{ duration: 2 }}
        />
      </>
    )}
  </motion.button>
</motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileInfoForm;