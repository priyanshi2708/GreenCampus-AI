import { Zap, Droplet, Trash2, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricsGridProps {
  summary?: {
    totalElectricity?: number;
    totalWater?: number;
    totalWaste?: number;
    totalCarbon?: number;
    avgElectricity?: number;
    avgWater?: number;
    avgWaste?: number;
    avgCarbon?: number;
  } | null;
}

const MetricsGrid = ({ summary }: MetricsGridProps) => {
  const electricityVal = summary?.totalElectricity != null ? `${summary.totalElectricity.toLocaleString()} kWh` : '0 kWh';
  const waterVal = summary?.totalWater != null ? `${summary.totalWater.toLocaleString()} L` : '0 L';
  const wasteVal = summary?.totalWaste != null ? `${summary.totalWaste.toLocaleString()} kg` : '0 kg';
  const carbonVal = summary?.totalCarbon != null ? `${summary.totalCarbon.toFixed(1)} kg CO₂e` : '0 kg CO₂e';

  const metrics = [
    {
      title: 'Energy Consumption',
      value: electricityVal,
      badge: 'Electricity',
      icon: Zap,
      color: 'text-primaryGlow',
      bg: 'bg-primaryGlow/10',
      border: 'border-primaryGlow/20',
    },
    {
      title: 'Water Consumption',
      value: waterVal,
      badge: 'Water',
      icon: Droplet,
      color: 'text-accentBlue',
      bg: 'bg-accentBlue/10',
      border: 'border-accentBlue/20',
    },
    {
      title: 'Waste Diverted',
      value: wasteVal,
      badge: 'Waste',
      icon: Trash2,
      color: 'text-accentPurple',
      bg: 'bg-accentPurple/10',
      border: 'border-accentPurple/20',
    },
    {
      title: 'Carbon Footprint',
      value: carbonVal,
      badge: 'Total CO₂e',
      icon: Cloud,
      color: 'text-secondaryGlow',
      bg: 'bg-secondaryGlow/10',
      border: 'border-secondaryGlow/20',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="group relative bg-card border border-white/[0.05] rounded-2xl p-6 overflow-hidden cursor-pointer"
        >
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${metric.bg} ${metric.border} border`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/5 text-gray-400">
              {metric.badge}
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-gray-400 text-sm font-medium mb-1">{metric.title}</h3>
            <div className="text-2xl font-bold text-white tracking-tight">{metric.value}</div>
          </div>
          
          {/* Decorative Sparkline placeholder (simplified with SVG) */}
          <svg className="absolute bottom-0 left-0 w-full h-12 opacity-30 group-hover:opacity-50 transition-opacity" preserveAspectRatio="none" viewBox="0 0 100 20">
            <path d="M0,20 L10,15 L20,18 L30,8 L40,12 L50,5 L60,10 L70,2 L80,6 L90,0 L100,8 L100,20 Z" fill="currentColor" className={metric.color} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricsGrid;
