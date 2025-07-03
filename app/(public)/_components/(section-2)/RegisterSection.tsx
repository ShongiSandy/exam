import React from "react";
import { Truck, ShieldCheck, HeadphonesIcon } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Truck,
      title: "Global Shipping",
      description: "Worldwide delivery with real-time package tracking",
    },
    {
      icon: ShieldCheck,
      title: "Secure Transactions",
      description: "Enterprise-grade security with encrypted payments",
    },
    {
      icon: HeadphonesIcon,
      title: "Premium Support",
      description: "Dedicated customer service team at your service",
    },
  ];

  return (
    <div className="w-full py-6 bg-background dark:bg-[#1A0F0F] border-y border-border"> {/* Added dark: prefix */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-6 bg-background dark:bg-[#1A0F0F] rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300 flex-1"
            >
              <div className="rounded-full bg-secondary p-3">
                <feature.icon className="w-6 h-6 text-primary shrink-0" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
