"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { CheckoutDetailsFormValues, checkoutDetailsSchema } from "../_actions/types";

interface CheckoutDetailsFormProps {
  userCheckoutPreferences?: {
    shippingAddress?: string;
    billingAddress?: string;
    shippingMethod?: string;
    paymentMethod?: string;
    saveInfo?: boolean;
  };
  onSubmit: (data: CheckoutDetailsFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const CheckoutDetailsForm: React.FC<CheckoutDetailsFormProps> = ({
  userCheckoutPreferences,
  onSubmit,
  isSubmitting,
}) => {
  const [isCelebrating, setIsCelebrating] = React.useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutDetailsFormValues>({
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: {
      shippingAddress: userCheckoutPreferences?.shippingAddress || "",
      billingAddress: userCheckoutPreferences?.billingAddress || "",
      shippingMethod: userCheckoutPreferences?.shippingMethod || "standard",
      paymentMethod: userCheckoutPreferences?.paymentMethod || "credit_card",
      saveInfo: userCheckoutPreferences?.saveInfo || false
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
              Checkout Details
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

          <form onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            handleSuccessfulSubmit();
          })} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['shippingAddress', 'Shipping Address'], ['billingAddress', 'Billing Address']].map(([name, label]) => (
                  <motion.div 
                    key={name}
                    whileHover={{ scale: 1.01 }}
                    className="space-y-2"
                  >
                    <Label htmlFor={name}>{label}</Label>
                    <Input
                      id={name}
                      {...register(name as keyof CheckoutDetailsFormValues)}
                      disabled={isSubmitting}
                      className="bg-background"
                    />
                    {errors[name as keyof CheckoutDetailsFormValues] && (
                      <motion.p 
                        className="text-sm text-destructive"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {errors[name as keyof CheckoutDetailsFormValues]?.message}
                      </motion.p>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="shippingMethod">Shipping Method</Label>
                  <select
                    id="shippingMethod"
                    {...register('shippingMethod')}
                    disabled={isSubmitting}
                    className="bg-background border rounded-md p-2 w-full"
                  >
                    <option value="standard">Standard Shipping</option>
                    <option value="express">Express Shipping</option>
                    <option value="priority">Priority Shipping</option>
                  </select>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="space-y-2"
                >
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    {...register('paymentMethod')}
                    disabled={isSubmitting}
                    className="bg-background border rounded-md p-2 w-full"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </motion.div>
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  id="saveInfo"
                  {...register('saveInfo')}
                  disabled={isSubmitting}
                  className="h-4 w-4"
                />
                <Label htmlFor="saveInfo">Save this information for next time</Label>
              </motion.div>
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutDetailsForm;