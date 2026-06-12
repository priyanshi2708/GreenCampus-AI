import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle, ShieldAlert, CheckCircle, Clock, Search, Filter,
  ChevronDown, ChevronUp, RefreshCw, Trash2, Eye, FileText, Check, X,
  TrendingUp, Activity, Zap, Droplet, Trash, Compass
} from 'lucide-react';

interface AlertRootCause {
  whatHappened: string;
  whyFlagged: string;
  potentialCause: string;
  estimatedImpact: string;
  recommendedAction: string;
}

interface AlertData {
  _id: string;
  title: string;
  category: 'Energy' | 'Water' | 'Waste' | 'Carbon';
  building: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Open' | 'Investigating' | 'Resolved';
  description: string;
  impact: string;
  rootCause: AlertRootCause;
  isRead: boolean;
  timestamp: string;
}

const AlertCenter = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeverity, setFilterSeverity] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string>('');
  const { showToast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/alerts');
      if (res.data && res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (e: any) {
      console.error('Failed fetching alerts:', e);
      showToast('Error loading alerts from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'Open' | 'Investigating' | 'Resolved') => {
    setUpdatingId(id);
    try {
      const res = await axios.put(`/api/alerts/${id}`, { status: newStatus });
      if (res.data && res.data.success) {
        setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
        showToast(`Alert status updated to ${newStatus}`, 'success');
      }
    } catch (e) {
      console.error('Failed updating status:', e);
      showToast('Failed to update alert status.', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await axios.put(`/api/alerts/${id}`, { isRead: true });
      if (res.data && res.data.success) {
        setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      }
    } catch (e) {
      console.error('Failed marking alert read:', e);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    try {
      const res = await axios.delete(`/api/alerts/${id}`);
      if (res.data && res.data.success) {
        setAlerts(prev => prev.filter(a => a._id !== id));
        showToast('Alert deleted successfully.', 'success');
      }
    } catch (e) {
      console.error('Failed deleting alert:', e);
      showToast('Failed to delete alert.', 'error');
    }
  };

  const toggleExpand = (alert: AlertData) => {
    if (expandedAlertId === alert._id) {
      setExpandedAlertId(null);
    } else {
      setExpandedAlertId(alert._id);
      if (!alert.isRead) {
        handleMarkAsRead(alert._id);
      }
    }
  };

  // Metrics calculations
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical').length;
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved').length;
  const pendingAlerts = alerts.filter(a => a.status !== 'Resolved').length;

  // Filter alerts
  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.building.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesSeverity = filterSeverity === 'All' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  // Category Colors/Icons helpers
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Energy': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Water': return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'Waste': return <Trash className="w-4 h-4 text-emerald-400" />;
      case 'Carbon': return <Compass className="w-4 h-4 text-indigo-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Info':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Investigating':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'Open':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-8 h-8 text-primaryGlow" />
            AI Alert Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">Detect resource wastage and sustainability risks in real time.</p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Analyze Now
        </button>
      </div>

      {/* ── ANALYTICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: totalAlerts, icon: Activity, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Critical Alerts', value: criticalAlerts, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Resolved Alerts', value: resolvedAlerts, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Pending Alerts', value: pendingAlerts, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((c) => (
          <div key={c.label} className={`glass-panel p-5 rounded-2xl border border-white/[0.04] flex items-center justify-between gap-4 ${c.bg}`}>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">{c.label}</p>
              <h3 className={`text-2xl font-black ${c.color} mt-1 leading-none`}>{c.value}</h3>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── ALERTS TREND CHART SECTION ── */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primaryGlow" />
              Resource Wastage Risk Distribution
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold">Real-Time Continuous Feed</span>
          </div>
          <div className="h-40 w-full flex items-end justify-between px-4 pt-4 border-b border-white/5">
            {[
              { label: 'Science Bldg', energy: 80, water: 40, waste: 20 },
              { label: 'Main Library', energy: 30, water: 90, waste: 10 },
              { label: 'Student Union', energy: 40, water: 20, waste: 80 },
              { label: 'Admin Block', energy: 50, water: 60, waste: 10 },
              { label: 'Sports Complex', energy: 20, water: 30, waste: 30 },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="w-12 flex justify-center items-end gap-1 h-28">
                  <div style={{ height: `${d.energy}%` }} className="w-2.5 rounded-t bg-amber-400/80 group-hover:bg-amber-400 transition-colors" title={`Energy: ${d.energy}`} />
                  <div style={{ height: `${d.water}%` }} className="w-2.5 rounded-t bg-blue-400/80 group-hover:bg-blue-400 transition-colors" title={`Water: ${d.water}`} />
                  <div style={{ height: `${d.waste}%` }} className="w-2.5 rounded-t bg-emerald-400/80 group-hover:bg-emerald-400 transition-colors" title={`Waste: ${d.waste}`} />
                </div>
                <span className="text-[9px] text-gray-500 font-bold truncate max-w-full">{d.label.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-center text-[10px] text-gray-400 pt-1">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-amber-400" /> Energy Spike</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-blue-400" /> Water Leak</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-400" /> Waste Surge</div>
          </div>
        </div>
        
        {/* Quick Insights Widget */}
        <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 md:pl-6 pt-6 md:pt-0">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">AI Incident Summary</h4>
          <div className="space-y-3">
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-1">
              <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-widest">HIGHEST PRIORITY</span>
              <p className="text-white text-xs font-bold leading-snug">Verify Science Building HVAC coolants immediate valve leak checks.</p>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl space-y-1">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">POTENTIAL SAVINGS</span>
              <p className="text-gray-300 text-xs font-medium leading-relaxed">Resolving current critical anomalies could cut daily campus costs by approx. <strong className="text-emerald-400 font-bold">$1,068</strong>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl backdrop-blur-md">
        
        {/* Search */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts or buildings..."
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-white text-xs placeholder-gray-500 focus:border-primaryGlow/50 focus:bg-white/[0.04] focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:justify-end">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Category:</span>
            {['All', 'Energy', 'Water', 'Waste', 'Carbon'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  filterCategory === cat 
                    ? 'bg-primaryGlow text-background shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Severity:</span>
            {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  filterSeverity === sev 
                    ? 'bg-primaryGlow text-background shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Status:</span>
            {['All', 'Open', 'Investigating', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  filterStatus === st 
                    ? 'bg-primaryGlow text-background shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── ALERTS LIST ── */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primaryGlow animate-spin" />
            <p className="text-gray-400 text-sm font-semibold">Running anomaly analytics models...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl border border-white/[0.04] text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-white text-lg font-bold">No Resource Anomalies Detected</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">All systems are running within expected statistical baselines. Clean execution verified.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <motion.div
              layout
              key={alert._id}
              className={`glass-panel rounded-2xl border transition-all overflow-hidden flex flex-col ${
                expandedAlertId === alert._id 
                  ? 'bg-white/[0.03] border-white/15' 
                  : 'bg-[#050816]/30 border-white/[0.05] hover:border-white/12'
              } ${!alert.isRead ? 'shadow-[inset_4px_0_0_#00E5FF]' : ''}`}
            >
              
              {/* Alert Card Header */}
              <div 
                className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                onClick={() => toggleExpand(alert)}
              >
                
                {/* Left side content */}
                <div className="flex items-start gap-4 flex-1">
                  
                  {/* Category icon */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getCategoryIcon(alert.category)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-white text-sm font-bold">{alert.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">{alert.description}</p>
                    
                    <div className="flex items-center gap-3.5 text-[10px] text-gray-500 font-semibold pt-1">
                      <span>Building: <strong className="text-gray-300 font-bold">{alert.building}</strong></span>
                      <span>•</span>
                      <span>Impact: <strong className="text-secondaryGlow font-bold">{alert.impact}</strong></span>
                      <span>•</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(alert); }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {expandedAlertId === alert._id ? 'Hide Root Cause' : 'Analyze'}
                    {expandedAlertId === alert._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteAlert(alert._id); }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Expandable Root Cause Analysis Panel */}
              <AnimatePresence>
                {expandedAlertId === alert._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/[0.06] bg-[#050816]/60"
                  >
                    <div className="p-6 space-y-6">
                      
                      {/* Title block */}
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <AlertTriangle className="w-4 h-4 text-primaryGlow" />
                        <h5 className="text-white text-xs font-black uppercase tracking-wider">AI Root Cause Diagnostics</h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* What happened & why flagged */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">WHAT HAPPENED</span>
                            <p className="text-gray-300 text-xs leading-relaxed mt-1">{alert.rootCause.whatHappened}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">WHY AI FLAGGED IT</span>
                            <p className="text-gray-300 text-xs leading-relaxed mt-1">{alert.rootCause.whyFlagged}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">ESTIMATED IMPACT</span>
                            <p className="text-gray-300 text-xs leading-relaxed mt-1 font-semibold">{alert.rootCause.estimatedImpact}</p>
                          </div>
                        </div>

                        {/* Potential cause & recommended action */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">POTENTIAL CAUSE</span>
                            <p className="text-gray-300 text-xs leading-relaxed mt-1">{alert.rootCause.potentialCause}</p>
                          </div>
                          <div className="p-4 bg-primaryGlow/[0.04] border border-primaryGlow/10 rounded-xl space-y-1">
                            <span className="text-[9px] font-extrabold text-primaryGlow uppercase tracking-widest">RECOMMENDED RESOLUTION ACTION</span>
                            <p className="text-white text-xs font-semibold leading-relaxed mt-1">{alert.rootCause.recommendedAction}</p>
                          </div>
                        </div>

                      </div>

                      {/* Status changer buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                        
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Update Investigation Status:</span>
                          <div className="flex items-center gap-2 mt-1.5">
                            {(['Open', 'Investigating', 'Resolved'] as const).map((status) => (
                              <button
                                key={status}
                                disabled={updatingId === alert._id || alert.status === status}
                                onClick={() => handleUpdateStatus(alert._id, status)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all border disabled:opacity-50 ${
                                  alert.status === status
                                    ? status === 'Resolved'
                                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                      : status === 'Investigating'
                                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                      : 'bg-red-500/20 border-red-500/30 text-red-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                {updatingId === alert._id && alert.status !== status ? 'Updating…' : status}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Actions Logged:</span>
                          <span className="text-[10px] text-gray-300 font-bold bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Email Alert Sent
                          </span>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))
        )}
      </div>

    </div>
  );
};

export default AlertCenter;
