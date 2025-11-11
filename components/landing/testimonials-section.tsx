"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content:
      "docsme AI has transformed how our team creates documentation. What used to take hours now takes minutes. The AI understands context perfectly and generates professional content every time.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Freelance Consultant",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content:
      "As a consultant, I create proposals daily. This tool has become indispensable. The quality is outstanding, and my clients are always impressed with the professional documents I deliver.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content:
      "The best investment for our marketing team. We've created hundreds of documents - reports, proposals, briefs - all with consistent quality. The time savings alone justify the cost.",
    rating: 5,
  },
  {
    name: "David Thompson",
    role: "Startup Founder",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content:
      "Running a startup means wearing many hats. docsme AI handles all my document needs so I can focus on building my product. Couldn't imagine working without it now.",
    rating: 5,
  },
  {
    name: "Lisa Park",
    role: "Legal Assistant",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    content:
      "The accuracy and professionalism of the generated documents are remarkable. It's like having an expert writer on the team. Perfect for creating legal summaries and client communications.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Sales Manager",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    content:
      "Our sales proposals have never looked better. The AI captures our value proposition perfectly, and the customization options let us maintain our brand identity. Game changer!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-violet-100/20 to-purple-100/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-100/20 to-violet-100/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full mb-6">
            <Star className="w-4 h-4 text-violet-600 fill-violet-600" />
            <span className="text-sm font-semibold text-violet-900">
              Trusted by 10,000+ Professionals
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Loved by Teams
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Around the World
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how professionals are transforming their document workflow with
            docsme AI
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 min-h-[120px]">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                {/* <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-violet-400 to-purple-400">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div> */}
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Hover Gradient Border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-sm font-medium text-gray-500 mb-8">
            TRUSTED BY LEADING COMPANIES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {[
              "TechCorp",
              "InnovateCo",
              "DesignHub",
              "StartupX",
              "GlobalTech",
            ].map((company) => (
              <div
                key={company}
                className="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
