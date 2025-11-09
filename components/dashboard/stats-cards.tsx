"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye, Zap, TrendingUp } from "lucide-react";

/**
 * Modern Stats Cards Component
 * 
 * Features:
 * - Glass morphism design with backdrop blur
 * - Smooth hover animations and scale effects  
 * - Gradient borders that appear on hover
 * - Animated progress indicators
 * - Fully responsive for mobile, tablet, and desktop
 * - Icon rotation animations on hover
 * 
 * @param documentsCount - Total number of documents
 * @param totalViews - Total views across all documents  
 * @param plan - User's current plan (free/pro/enterprise)
 */

interface StatsCardsProps {
  documentsCount: number;
  totalViews: number;
  plan: string;
}

export function StatsCards({ documentsCount, totalViews, plan }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Documents",
      value: documentsCount,
      icon: FileText,
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      bgGradient: "from-blue-50 to-cyan-50",
      iconBg: "bg-blue-500",
      shadow: "shadow-blue-100",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: Eye,
      gradient: "from-purple-500 via-pink-500 to-purple-600",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-500",
      shadow: "shadow-purple-100",
    },
    {
      label: "Current Plan",
      value: plan.charAt(0).toUpperCase() + plan.slice(1),
      icon: Zap,
      gradient: "from-orange-500 via-yellow-500 to-orange-600",
      bgGradient: "from-orange-50 to-yellow-50",
      iconBg: "bg-orange-500",
      shadow: "shadow-orange-100",
    },
    {
      label: "Status",
      value: "Active",
      icon: TrendingUp,
      gradient: "from-green-500 via-emerald-500 to-green-600",
      bgGradient: "from-green-50 to-emerald-50",
      iconBg: "bg-green-500",
      shadow: "shadow-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
          whileHover={{ y: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card className={`relative border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden group ${stat.shadow} shadow-lg hover:shadow-2xl`}>
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Animated border */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{ padding: '1px' }}>
              <div className="absolute inset-[1px] bg-white rounded-lg" />
            </div>
            
            <CardContent className="relative pt-5 pb-5 sm:pt-6 sm:pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
                    {stat.label}
                  </p>
                  <h3 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </h3>
                </div>
                <motion.div
                  className={`${stat.iconBg} p-2.5 sm:p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
              </div>
              
              {/* Progress indicator */}
              <motion.div
                className={`mt-3 sm:mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
