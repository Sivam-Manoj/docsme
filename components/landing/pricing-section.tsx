"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Docume AI",
    features: [
      "5 documents per month",
      "Basic AI generation",
      "PDF export",
      "Public sharing",
      "Community support",
    ],
    cta: "Get Started",
    href: "/auth/register",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "per month",
    description: "For professionals and teams",
    features: [
      "100 documents per month",
      "Advanced AI generation",
      "All export formats",
      "Password protection",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    href: "/auth/register",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99.99",
    period: "per month",
    description: "For large organizations",
    features: [
      "Unlimited documents",
      "Premium AI models",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Team collaboration",
      "SSO & SAML",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/auth/register",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-900">
              Simple Pricing
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl ${
                plan.popular
                  ? "bg-gradient-to-br from-violet-600 to-purple-600 p-[2px]"
                  : "bg-gray-200 p-[1px]"
              }`}
            >
              <div
                className={`h-full rounded-3xl p-8 ${
                  plan.popular ? "bg-white" : "bg-white"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * idx }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={plan.href} className="block">
                  <Button
                    size="lg"
                    className={`w-full font-semibold ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600">
            All plans include{" "}
            <span className="font-semibold text-gray-900">
              SSL encryption, regular backups, and 99.9% uptime
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Need a custom plan?{" "}
            <Link href="/auth/register" className="text-violet-600 hover:underline font-medium">
              Contact us
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
