"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Check } from "lucide-react";
import { PasswordChangeFormValues, passwordChangeSchema } from "../_actions/types";

interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [isCelebrating, setIsCelebrating] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const handleSuccessfulSubmit = () => {
    setIsCelebrating(true);
    setIsSuccess(true);
    setTimeout(() => {
      setIsCelebrating(false);
      reset();
    }, 2000);
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
              Change Password
            </motion.h2>
            
            <AnimatePresence>
              {isCelebrating && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-6 top-6"
                >
                  {isSuccess ? (
                    <Check className="h-8 w-8 text-green-500" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            handleSuccessfulSubmit();
          })} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              
{['currentPassword', 'newPassword', 'confirmNewPassword'].map((name) => (
  <motion.div 
    key={name}
    whileHover={{ scale: 1.01 }}
    className="space-y-2"
  >
    <Label htmlFor={name}>
      {name === 'currentPassword' ? 'Current Password' : 
       name === 'newPassword' ? 'New Password' : 'Confirm New Password'}
    </Label>
    <Input
      id={name}
      type="password"
      {...register(name as keyof PasswordChangeFormValues)}
      disabled={isSubmitting}
      className="bg-background"
    />
    {errors[name as keyof PasswordChangeFormValues] && (
      <motion.p 
        className="text-sm text-destructive"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {errors[name as keyof PasswordChangeFormValues]?.message}
      </motion.p>
    )}
  </motion.div>
))}
            </motion.div>

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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordChangeForm;