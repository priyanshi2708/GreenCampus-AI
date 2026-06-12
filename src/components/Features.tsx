import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, BarChart3, Cloud, FileText, Leaf } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6 text-accentPurple" />,
    title: "AI Forecasting",
    description: "Predict energy spikes and resource shortages before they happen using machine learning models trained on campus data."
  },
  {
    icon: <Activity className="w-6 h-6 text-accentCyan" />,
    title: "Sustainability Score",
    description: "A real-time, dynamic health metric combining carbon footprint, water usage, and waste generation."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-accentBlue" />,
    title: "Resource Tracking",
    description: "Granular dashboard tracking every kilowatt and gallon across departments and residential halls."
  },
  {
    icon: <Cloud className="w-6 h-6 text-accentGreen" />,
    title: "Carbon Analytics",
    description: "Automated Scope 1, 2, and 3 emissions calculations to streamline your path to net-zero."
  },
  {
    icon: <FileText className="w-6 h-6 text-pink-500" />,
    title: "Smart Reports",
    description: "Instantly generate compliance and ESG reports for stakeholders with one click."
  },
  {
    icon: <Leaf className="w-6 h-6 text-emerald-400" />,
    title: "Eco-Optimization",
    description: "Automated HVAC and lighting adjustments based on occupancy and weather patterns."
  }
];

const Features = () => {
  return (
    <section className="py-24 relative" id="features">
      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Intelligence at Scale
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to monitor, analyze, and optimize every aspect of your campus environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel p-8 rounded-3xl glass-card-hover group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
