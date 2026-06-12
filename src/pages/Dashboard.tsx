import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Database, Plus, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import DashboardHero from '../components/dashboard/DashboardHero';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import AIScoreWidget from '../components/dashboard/AIScoreWidget';
import ResourceCharts from '../components/dashboard/ResourceCharts';
import AIInsights from '../components/dashboard/AIInsights';
import Predictions from '../components/dashboard/Predictions';
import AlertCenter from '../components/dashboard/AlertCenter';
import AIAssistantWidget from '../components/dashboard/AIAssistantWidget';
import DashboardLeaderboard from '../components/dashboard/DashboardLeaderboard';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [summaryData, setSummaryData] = useState<any>(null);

  const checkDataStatus = async () => {
    try {
      const [resRes, predRes, repRes] = await Promise.all([
        axios.get('/api/resources'),
        axios.get('/api/predictions'),
        axios.get('/api/reports')
      ]);

      if (resRes.data && resRes.data.success) {
        setResourcesCount(resRes.data.data.length);
        setSummaryData(resRes.data.summary);
      }
      if (predRes.data && predRes.data.success) {
        setPredictionsCount(predRes.data.data.length);
      }
      if (repRes.data && repRes.data.success) {
        setReportsCount(repRes.data.data.length);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDataStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-8 h-8 border-4 border-primaryGlow border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Analyzing database logs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 page-fade">
      
      {/* Greeting Hero */}
      <DashboardHero />

      {/* Onboarding Checklist Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primaryGlow" />
          <h3 className="text-white text-xs font-black uppercase tracking-wider">Campus Onboarding & Setup Guide</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: 1,
              title: 'Add Resource Log',
              desc: 'Log electricity, water or waste entries.',
              completed: resourcesCount > 0,
              link: '/dashboard/resources',
              actionLabel: 'Add Entry'
            },
            {
              step: 2,
              title: 'Generate Predictions',
              desc: 'Requires ≥ 3 logs to train ML model.',
              completed: resourcesCount >= 3 && predictionsCount > 0,
              link: '/dashboard/predictions',
              actionLabel: 'Train AI'
            },
            {
              step: 3,
              title: 'Generate Report',
              desc: 'Export monthly performance PDF.',
              completed: reportsCount > 0,
              link: '/dashboard/reports',
              actionLabel: 'View Reports'
            },
            {
              step: 4,
              title: 'Explore AI Assistant',
              desc: 'Ask our agent optimization questions.',
              completed: resourcesCount > 0,
              link: '/dashboard/assistant',
              actionLabel: 'Open Chat'
            }
          ].map((s) => (
            <div 
              key={s.step} 
              className={`p-4 rounded-xl border flex flex-col justify-between h-32 transition-all ${
                s.completed 
                  ? 'bg-emerald-500/[0.02] border-emerald-500/20' 
                  : 'bg-white/[0.01] border-white/[0.05] hover:border-white/10'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${s.completed ? 'text-emerald-400' : 'text-gray-500'}`}>
                    Step {s.step}
                  </span>
                  {s.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <h4 className="text-white text-xs font-bold mt-1">{s.title}</h4>
                <p className="text-[10px] text-gray-500 leading-normal">{s.desc}</p>
              </div>
              {!s.completed && (
                <Link 
                  to={s.link} 
                  className="text-[10px] font-bold text-primaryGlow flex items-center gap-1 hover:underline self-start mt-2"
                >
                  {s.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <MetricsGrid summary={summaryData} />

      {/* Main Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Charts (takes 2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ResourceCharts resourcesCount={resourcesCount} />
          
          {/* Below Charts: Insights & Predictions */}
          <div className="grid md:grid-cols-2 gap-6">
            <AIInsights resourcesCount={resourcesCount} />
            <Predictions resourcesCount={resourcesCount} />
          </div>
        </div>
        
        {/* Right Column: Score & Alerts (takes 1/3 width) */}
        <div className="flex flex-col gap-6">
          <AIScoreWidget />
          <AlertCenter />
        </div>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AIAssistantWidget />
        </div>
        <div className="lg:col-span-2">
          <DashboardLeaderboard />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
