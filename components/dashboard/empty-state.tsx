"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Zap, Rocket } from "lucide-react";

/**
 * Modern Empty State Component
 * 
 * Features:
 * - Engaging animations with spring physics
 * - Floating icon with continuous motion
 * - Feature highlights with decorative elements
 * - Call-to-action button with gradient
 * - Fully responsive for all devices
 * - Glass morphism design
 * 
 * @param onCreateClick - Callback function when create button is clicked
 */

interface EmptyStateProps {
  onCreateClick: () => void;
}


export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-10 left-10 w-32 h-32 bg-violet-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
            animate={{
              x: [0, -30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <CardContent className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 text-center px-4 sm:px-6">
          {/* Floating Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
            className="relative inline-block mb-6 sm:mb-8"
          >
            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-full shadow-2xl">
                <FileText className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
              </div>
            </motion.div>
            
            {/* Decorative rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-violet-300"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              No documents yet
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Start creating <span className="font-semibold text-violet-600">amazing documents</span> with AI assistance. 
              Your first masterpiece is just a prompt away! 🚀
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onCreateClick}
              size="lg"
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 hover:from-violet-700 hover:via-purple-700 hover:to-violet-700 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Create Your First Document
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: Sparkles, text: "AI-Powered", gradient: "from-violet-500 to-purple-500" },
              { icon: Zap, text: "Lightning Fast", gradient: "from-purple-500 to-pink-500" },
              { icon: Rocket, text: "Professional", gradient: "from-pink-500 to-violet-500" },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center gap-2 sm:gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}>
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
