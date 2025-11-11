"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";

interface HeroSectionProps {
  onTryNow: () => void;
}

export function HeroSection({ onTryNow }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen sm:min-h-[95vh] flex items-center justify-center overflow-hidden py-12 sm:py-16 md:py-20"
    >
      {/* Animated Background - Enhanced for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-violet-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center sm:text-left space-y-4 sm:space-y-5 md:space-y-6"
          >
            {/* Badge - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex  mt-11 xl:mt-2 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-violet-200 shadow-md hover:shadow-lg transition-all"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Documents
              </span>
            </motion.div>

            {/* Heading - Mobile optimized */}
            <div className="space-y-3 sm:space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl  font-bold leading-[1.1] tracking-tight"
              >
                <span className="block bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                  Create Stunning
                </span>
                <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Documents in Seconds
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-xl mx-auto sm:mx-0 leading-relaxed"
              >
                Transform your ideas into professional documents with AI. No
                design skills needed. Just describe what you need, and watch
                magic happen.
              </motion.p>
            </div>

            {/* CTA Buttons - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
            >
              <Button
                size="lg"
                onClick={onTryNow}
                className="group relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 text-sm sm:text-base font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Try Now - It's Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group border-2 border-gray-300 hover:border-violet-600 hover:bg-violet-50 px-6 sm:px-8 py-3 sm:py-4 h-12 sm:h-14 text-sm sm:text-base font-bold transition-all"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:text-violet-600 transition-colors" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats - Mobile optimized with better spacing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-2 sm:pt-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center sm:text-left bg-white/60 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-violet-100"
              >
                <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  50K+
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">
                  Documents
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center sm:text-left bg-white/60 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-purple-100"
              >
                <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">
                  Users
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center sm:text-left bg-white/60 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-pink-100"
              >
                <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 to-violet-600 bg-clip-text text-transparent">
                  4.9★
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-medium">
                  Rating
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Mobile Feature Cards - Only on mobile/tablet */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="lg:hidden grid sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border-2 border-violet-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Lightning Fast
                  </h3>
                  <p className="text-xs text-gray-600">Generate in seconds</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-violet-100 rounded-full w-full" />
                <div className="h-2 bg-violet-100 rounded-full w-4/5" />
                <div className="h-2 bg-violet-100 rounded-full w-3/5" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    Professional
                  </h3>
                  <p className="text-xs text-gray-600">Ready to share</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 bg-purple-100 rounded-full w-full" />
                <div className="h-2 bg-purple-100 rounded-full w-5/6" />
                <div className="h-2 bg-purple-100 rounded-full w-4/5" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border-2 border-pink-100 shadow-lg hover:shadow-xl transition-all sm:col-span-2"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    No Design Skills Needed
                  </h3>
                  <p className="text-xs text-gray-600">
                    AI does the work for you
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-16 sm:h-20 bg-gradient-to-br from-pink-50 to-violet-50 rounded-lg border border-pink-200" />
                <div className="h-16 sm:h-20 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Image Preview with Scroll Animation - Desktop only */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Main Preview Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Header */}
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white px-4 py-1.5 rounded-lg text-xs text-gray-600 font-medium border border-gray-200 shadow-sm">
                      docsme.ai/editor
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded w-3/4" />
                      </div>
                    </div>

                    <div className="space-y-3 pl-1">
                      <div className="h-3 bg-gray-300 rounded-full w-full" />
                      <div className="h-3 bg-gray-300 rounded-full w-5/6" />
                      <div className="h-3 bg-gray-300 rounded-full w-4/5" />
                      <div className="h-3 bg-gray-200 rounded-full w-3/4 mt-4" />
                      <div className="h-3 bg-gray-200 rounded-full w-full" />
                      <div className="h-3 bg-gray-200 rounded-full w-2/3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg" />
                      <div className="h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">
                      AI Generated
                    </div>
                    <div className="text-xs text-gray-500">In 2.3 seconds</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">
                      Professional
                    </div>
                    <div className="text-xs text-gray-500">Ready to share</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator - Enhanced */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-xs font-semibold tracking-wide">
            Scroll to explore
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-violet-300 bg-white/50 backdrop-blur-sm flex justify-center p-2 shadow-sm">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-2 bg-gradient-to-b from-violet-600 to-purple-600 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
