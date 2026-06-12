import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Zap, Droplets, Trash2, Wind } from 'lucide-react';
import type { ScenarioParams } from './types';

interface Props {
  baseValues: {
    electricity: number;
    water: number;
    waste: number;
    carbon: number;
  };
}

const ScenarioSimulator = ({ baseValues }: Props) => {
  const [params, setParams] = useState<ScenarioParams>({
    studentCount: 12000,
    buildingsCount: 14,
    labUsage: 65,
    operatingHours: 12,
  });

  const baseStudent = 10000;
  const baseBuildings = 10;
  const baseLabUsage = 50;
  const baseHours = 10;

  const currentImpact = useMemo(() => {
    // Dynamic simulation formulas representing impact changes
    const studentRatio = params.studentCount / baseStudent;
    const buildingRatio = params.buildingsCount / baseBuildings;
    const labRatio = params.labUsage / baseLabUsage;
    const hourRatio = params.operatingHours / baseHours;

    const electricityMulti = (studentRatio * 0.2 + buildingRatio * 0.4 + labRatio * 0.2 + hourRatio * 0.2);
    const waterMulti = (studentRatio * 0.5 + buildingRatio * 0.3 + hourRatio * 0.2);
    const wasteMulti = (studentRatio * 0.6 + buildingRatio * 0.3 + hourRatio * 0.1);

    const electricity = baseValues.electricity * electricityMulti;
    const water = baseValues.water * waterMulti;
    const waste = baseValues.waste * wasteMulti;
    const carbon = electricity * 0.233 + waste * 0.054; // standard calculations

    return { electricity, water, waste, carbon };
  }, [params, baseValues]);

  const changePct = useMemo(() => {
    const elPct = ((currentImpact.electricity - baseValues.electricity) / baseValues.electricity) * 100;
    const waPct = ((currentImpact.water - baseValues.water) / baseValues.water) * 100;
    const wsPct = ((currentImpact.waste - baseValues.waste) / baseValues.waste) * 100;
    const caPct = ((currentImpact.carbon - baseValues.carbon) / baseValues.carbon) * 100;

    return { electricity: elPct, water: waPct, waste: wsPct, carbon: caPct };
  }, [currentImpact, baseValues]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-panel rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-primaryGlow" />
        <div>
          <h3 className="text-white font-semibold">Scenario Simulator</h3>
          <p className="text-gray-400 text-xs mt-0.5">Simulate changes to campus metrics to view dynamic impacts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Control Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Student Count */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Student Population</span>
              <span className="text-primaryGlow font-bold">{params.studentCount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="25000"
              step="500"
              value={params.studentCount}
              onChange={(e) => setParams({ ...params, studentCount: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Active Buildings */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Active Buildings</span>
              <span className="text-primaryGlow font-bold">{params.buildingsCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={params.buildingsCount}
              onChange={(e) => setParams({ ...params, buildingsCount: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Lab Usage Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Lab Usage Intensity</span>
              <span className="text-primaryGlow font-bold">{params.labUsage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={params.labUsage}
              onChange={(e) => setParams({ ...params, labUsage: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Operating Hours */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Daily Operating Hours</span>
              <span className="text-primaryGlow font-bold">{params.operatingHours} hrs</span>
            </div>
            <input
              type="range"
              min="6"
              max="24"
              step="1"
              value={params.operatingHours}
              onChange={(e) => setParams({ ...params, operatingHours: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        {/* Dynamic Impact Display */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {[
            {
              key: 'electricity' as const,
              title: 'Electricity Impact',
              icon: Zap,
              color: 'text-primaryGlow',
              bg: 'bg-primaryGlow/5',
              border: 'border-primaryGlow/10',
              unit: 'kWh',
            },
            {
              key: 'water' as const,
              title: 'Water Impact',
              icon: Droplets,
              color: 'text-accentBlue',
              bg: 'bg-accentBlue/5',
              border: 'border-accentBlue/10',
              unit: 'L',
            },
            {
              key: 'waste' as const,
              title: 'Waste Impact',
              icon: Trash2,
              color: 'text-accentPurple',
              bg: 'bg-accentPurple/5',
              border: 'border-accentPurple/10',
              unit: 'kg',
            },
            {
              key: 'carbon' as const,
              title: 'Carbon Impact',
              icon: Wind,
              color: 'text-secondaryGlow',
              bg: 'bg-secondaryGlow/5',
              border: 'border-secondaryGlow/10',
              unit: 'kg CO₂e',
            },
          ].map((card) => {
            const Icon = card.icon;
            const diff = changePct[card.key];
            const isUp = diff > 0;
            return (
              <div
                key={card.key}
                className={`relative group bg-[#050816] rounded-2xl p-4 border ${card.border} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-semibold">{card.title}</span>
                  <div className={`p-1.5 rounded-lg ${card.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                </div>

                <div>
                  <div className="text-lg font-bold text-white tracking-tight">
                    {currentImpact[card.key].toLocaleString('en-US', { maximumFractionDigits: 1 })}
                    <span className="text-[10px] text-gray-500 font-normal ml-1">{card.unit}</span>
                  </div>

                  <div className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
                    isUp ? 'text-red-400' : 'text-secondaryGlow'
                  }`}>
                    <span>{isUp ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}%</span>
                    <span className="text-gray-500 font-normal">vs baseline</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ScenarioSimulator;
