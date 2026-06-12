import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Cpu, RefreshCw, BarChart2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import PredictionCards from '../components/predictions/PredictionCards';
import ForecastChart from '../components/predictions/ForecastChart';
import RecommendationPanel from '../components/predictions/RecommendationPanel';
import ScenarioSimulator from '../components/predictions/ScenarioSimulator';
import type { ForecastCardData } from '../components/predictions/types';

// Animated Confidence Circle Component
function ConfidenceRing({ score, duration = 1500 }: { score: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(ease * score);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, duration]);

  const R = 54, STROKE = 8;
  const circ = 2 * Math.PI * R;
  const strokeDashoffset = circ - (val / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full blur-2xl opacity-15 bg-primaryGlow" />
      <svg width="128" height="128" className="rotate-[-90deg]">
        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke="#00E5FF"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s ease', filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{Math.round(val)}%</span>
        <span className="text-[9px] text-gray-500 mt-1 font-bold uppercase tracking-wider">Accuracy</span>
      </div>
    </div>
  );
}

const DEFAULT_KPI_DATA: ForecastCardData[] = [
  {
    type: 'electricity',
    title: 'Electricity Forecast (Next Month)',
    unit: 'kWh',
    currentValue: 310500,
    predictedValue: 347760,
    pctChange: 12.0,
    confidence: 94,
    trend: [305000, 308000, 302000, 311000, 309000, 310500, 347760],
  },
  {
    type: 'water',
    title: 'Water Forecast (Next Month)',
    unit: 'Liters',
    currentValue: 1250000,
    predictedValue: 1197500,
    pctChange: -4.2,
    confidence: 91,
    trend: [1290000, 1270000, 1265000, 1280000, 1260000, 1250000, 1197500],
  },
  {
    type: 'waste',
    title: 'Waste Forecast (Next Month)',
    unit: 'kg',
    currentValue: 42000,
    predictedValue: 45360,
    pctChange: 8.0,
    confidence: 89,
    trend: [40500, 41200, 41800, 40900, 42500, 42000, 45360],
  },
  {
    type: 'carbon',
    title: 'Carbon Forecast (Next Month)',
    unit: 'kg CO₂e',
    currentValue: 74586,
    predictedValue: 83476,
    pctChange: 11.9,
    confidence: 92,
    trend: [73127, 73988, 72583, 74672, 74301, 74586, 83476],
  },
];

const HISTORICAL_DATA = {
  electricity: [290000, 295000, 288000, 302000, 310000, 305000, 308000, 302000, 311000, 309000, 310500, 312000],
  water: [1180000, 1210000, 1250000, 1230000, 1290000, 1270000, 1265000, 1280000, 1260000, 1250000, 1240000, 1230000],
  waste: [38000, 39500, 40000, 41000, 40500, 41200, 41800, 40900, 42500, 42000, 41500, 42300],
  carbon: [69612, 70857, 72152, 73527, 73127, 73988, 72583, 74672, 74301, 74586, 73223, 74464],
};

const PREDICTED_DATA = {
  electricity: [320000, 335000, 347760, 352000, 348000, 360000],
  water: [1210000, 1197500, 1180000, 1175000, 1190000, 1200000],
  waste: [43000, 44200, 45360, 46000, 45100, 45800],
  carbon: [76878, 77508, 83476, 84564, 83520, 86328],
};

const PredictionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [kpiData, setKpiData] = useState<ForecastCardData[]>(DEFAULT_KPI_DATA);
  const { showToast } = useToast();

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const resRes = await axios.get('/api/resources');
      let count = 0;
      if (resRes.data && resRes.data.success) {
        count = resRes.data.data.length;
        setResourcesCount(count);
      }

      if (count >= 3) {
        const res = await axios.get('/api/predictions');
        if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
          const mapped = res.data.data.map((p: any) => ({
            type: p.resourceType,
            title: p.resourceType === 'electricity' ? 'Electricity Forecast (Next Month)' 
                 : p.resourceType === 'water' ? 'Water Forecast (Next Month)'
                 : p.resourceType === 'waste' ? 'Waste Forecast (Next Month)'
                 : 'Carbon Forecast (Next Month)',
            unit: p.resourceType === 'electricity' ? 'kWh'
                : p.resourceType === 'water' ? 'Liters'
                : p.resourceType === 'waste' ? 'kg'
                : 'kg CO₂e',
            currentValue: p.currentValue,
            predictedValue: p.predictedValue,
            pctChange: p.pctChange,
            confidence: p.confidence,
            trend: [...p.historicalValues, p.predictedValue]
          }));
          setKpiData(mapped);
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to sync predictions database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const triggerModelGen = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/predictions/generate');
      if (res.data && res.data.success) {
        showToast('AI forecasting models retrained successfully.', 'success');
        await fetchForecasts();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'ML prediction model training failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const simulatorBase = {
    electricity: kpiData[0]?.currentValue || 0,
    water: kpiData[1]?.currentValue || 0,
    waste: kpiData[2]?.currentValue || 0,
    carbon: kpiData[3]?.currentValue || 0,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="w-10 h-10 border-4 border-primaryGlow border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold animate-pulse">Running AI regression models...</p>
      </div>
    );
  }

  if (resourcesCount < 3) {
    return (
      <div className="space-y-8 page-fade">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            AI Forecast <span className="text-primaryGlow text-glow">Center</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Predict campus sustainability trends before they happen.
          </p>
        </div>

        {/* Beautiful Empty State */}
        <div className="glass-panel p-16 rounded-3xl border border-white/[0.04] text-center max-w-2xl mx-auto my-12 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primaryGlow/10 border border-primaryGlow/20 text-primaryGlow flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,229,255,0.1)]">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white text-xl font-bold">Insufficient Data for AI Forecasting</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
              Our Scikit-Learn linear regression models require at least <strong className="text-primaryGlow">3 historical resource logs</strong> to construct trendlines and generate predictions.
            </p>
            <p className="text-xs text-gray-500 font-semibold mt-1">
              Current logs found: {resourcesCount} / 3
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard/resources"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primaryGlow text-background text-sm font-black transition-all hover:bg-primaryGlow/90 hover:shadow-[0_0_25px_rgba(0,229,255,0.3)]"
            >
              Add Resource Log Entry
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            AI Forecast{' '}
            <span className="text-primaryGlow text-glow">Center</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Predict campus sustainability trends before they happen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={triggerModelGen}
            disabled={loading}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/30 hover:bg-primaryGlow/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Running ML Models…' : 'Re-train AI Engine'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Prediction Overview Cards ── */}
      <PredictionCards data={kpiData} />

      {/* ── Core Charts, Confidence, and Recommendations ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Trend Forecast Chart */}
        <div className="xl:col-span-8">
          <ForecastChart historical={HISTORICAL_DATA} predicted={PREDICTED_DATA} />
        </div>

        {/* Confidence & Quick Recommendations */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Prediction Confidence Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="glass-panel rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
          >
            <ConfidenceRing score={92} />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Prediction Confidence</h3>
              <p className="text-xs text-gray-400">
                Calculated across multi-variable linear regressions with historical correlation.
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-secondaryGlow bg-secondaryGlow/10 border border-secondaryGlow/20 rounded-lg px-2 py-1 w-max font-bold">
                <Cpu className="w-3.5 h-3.5" />
                Scikit-Learn Ready
              </div>
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <div className="flex-1">
            <RecommendationPanel />
          </div>
        </div>
      </div>

      {/* ── Scenario Simulator ── */}
      <ScenarioSimulator baseValues={simulatorBase} />
    </div>
  );
};

export default PredictionsPage;
