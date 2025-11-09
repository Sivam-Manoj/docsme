"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import {
  FileText,
  Sparkles,
  Share2,
  Download,
  Lock,
  Palette,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Show nothing while redirecting
  if (status === "loading" || status === "authenticated") {
    return null;
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description:
        "Create professional documents instantly with advanced AI technology",
    },
    {
      icon: Palette,
      title: "Rich Editor",
      description:
        "Edit with Canvas-like tools - fonts, colors, sizes, and alignment",
    },
    {
      icon: Share2,
      title: "Easy Sharing",
      description:
        "Share documents via link with optional password protection",
    },
    {
      icon: Download,
      title: "Export Anywhere",
      description: "Download as PDF or image, or share as a public link",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your documents are protected with enterprise-grade security",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate and edit documents in seconds, not hours",
    },
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "5 documents per month",
        "Basic AI generation",
        "PDF export",
        "Public sharing",
      ],
      cta: "Get Started",
      href: "/auth/register",
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      features: [
        "100 documents per month",
        "Advanced AI generation",
        "All export formats",
        "Password protection",
        "Priority support",
      ],
      cta: "Start Free Trial",
      href: "/auth/register",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99.99",
      period: "per month",
      features: [
        "Unlimited documents",
        "Premium AI models",
        "Custom branding",
        "API access",
        "Dedicated support",
        "Team collaboration",
      ],
      cta: "Contact Sales",
      href: "/auth/register",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Create Documents with AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate professional documents instantly, edit with powerful
              tools, and share securely with your team or clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 blur-3xl rounded-full" />
              <div className="relative bg-white p-4 rounded-xl shadow-2xl border border-gray-200">
                <div className="bg-gray-100 rounded-lg p-8 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-6 h-6 text-violet-600" />
                    <span className="font-semibold text-gray-900">
                      AI-Generated Document
                    </span>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <p className="font-semibold text-lg">
                      Project Proposal: Modern Web Application
                    </p>
                    <p>
                      This comprehensive proposal outlines the development of a
                      cutting-edge web application designed to revolutionize
                      digital document management...
                    </p>
                    <div className="h-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded w-3/4" />
                    <div className="h-2 bg-gray-300 rounded w-full" />
                    <div className="h-2 bg-gray-300 rounded w-5/6" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to create, edit, and share documents
              effortlessly
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl border border-gray-200 hover:border-violet-600 hover:shadow-lg transition-all"
              >
                <div className="bg-gradient-to-br from-violet-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`p-8 rounded-xl border-2 ${
                  plan.popular
                    ? "border-violet-600 shadow-xl scale-105 bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600"> / {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals creating better documents with AI
            </p>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 bg-white text-violet-600 hover:bg-gray-100"
              >
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="w-6 h-6" />
            <span className="font-bold text-xl">Docume AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered document generation made simple
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 Docume AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
