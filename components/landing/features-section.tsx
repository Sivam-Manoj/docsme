"use client";

import { motion } from "framer-motion";
import { Sparkles, Palette, Share2, Download, Lock, Zap, FileText, Eye } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Advanced AI creates professional documents instantly. Just describe what you need, and watch the magic happen in seconds.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Palette,
    title: "Rich Visual Editor",
    description:
      "Customize every detail with our intuitive editor. Fonts, colors, layouts - full creative control at your fingertips.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Share2,
    title: "Instant Sharing",
    description:
      "Share documents with anyone via secure links. Add password protection for sensitive information.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Download as PDF, PNG, or share as web links. Compatible with all major platforms and devices.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-level encryption keeps your documents safe. SOC 2 compliant with regular security audits.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate documents in under 3 seconds. Real-time collaboration without lag or delays.",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-white relative">
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
            <FileText className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-900">
              Everything You Need
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Professional Documents
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All the tools you need to create, edit, and share stunning documents.
            No learning curve required.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-violet-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex items-center gap-2 text-violet-600">
            <Eye className="w-5 h-5" />
            <span className="font-medium">
              And many more features to discover...
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
