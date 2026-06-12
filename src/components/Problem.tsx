import React from 'react';
import { motion } from 'framer-motion';

const Problem = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="problem">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8">
            Campuses run on legacy systems that <span className="text-gray-500">waste resources</span> and <span className="text-gray-500">ignore data</span>.
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Without real-time intelligence, universities bleed capital on inefficient energy usage, water waste, and suboptimal resource allocation. GreenCampus AI bridges the gap between raw data and actionable sustainability.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
