"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CTASection } from "@/components/landing/cta-section";
import { TryNowModal } from "@/components/landing/try-now-modal";
import { FileText } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showTryNowModal, setShowTryNowModal] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show nothing while redirecting
  if (status === "loading" || status === "authenticated") {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-white scroll-smooth">
        <Navbar />
        <HeroSection onTryNow={() => setShowTryNowModal(true)} />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection onTryNow={() => setShowTryNowModal(true)} />

        {/* Footer */}
        <footer className="py-12 px-4 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="w-6 h-6" />
              <span className="font-bold text-xl">docsme AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered document generation made simple
            </p>
            <p className="text-gray-500 text-sm">
              &copy; 2024 docsme AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Try Now Modal */}
      <TryNowModal
        isOpen={showTryNowModal}
        onClose={() => setShowTryNowModal(false)}
      />
    </>
  );
}
