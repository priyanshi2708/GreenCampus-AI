import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import {
  FileText, Download, Eye, Trash2, Search, Calendar, Mail,
  MessageSquare, Sparkles, RefreshCw, Send, Plus, X, Award, ChevronRight, Check
} from 'lucide-react';
import type { ReportData, ReportChatMessage } from '../components/reports/types';

const REPORT_TYPES = [
  { key: 'monthly', label: 'Monthly Report' },
  { key: 'quarterly', label: 'Quarterly Report' },
  { key: 'annual', label: 'Annual Report' },
  { key: 'department', label: 'Department Report' },
  { key: 'building', label: 'Building Report' },
  { key: 'summary', label: 'Executive Summary' },
];

const RECENT_FALLBACK_REPORTS: ReportData[] = [
  {
    _id: 'rep-1',
    title: 'May 2026 Campus Sustainability Report',
    type: 'monthly',
    period: 'May 2026',
    sustainabilityScore: 84,
    summary: 'Comprehensive sustainability audit detailing energy profiles, water consumption limits, waste generation streams, and departmental leaderboard metrics.',
    findings: [
      'Electricity consumption recorded an increase of 12% due to cooling loads.',
      'Water preservation targets met at 94% efficiency due to rainwater harvest expansion.',
      'Waste production rose by 8% in canteen areas during annual event.',
    ],
    recommendations: [
      'Calibrate smart AC thresholds to target 24°C bounds.',
      'Implement reusable utensil guidelines across public campus vendors.',
      'Schedule routine pipe network pressure-checks to identify water supply leaks.',
    ],
    savings: 'Estimated direct savings of ₹22,500 in utility bills.',
    scheduledType: 'monthly',
    emailRecipients: ['principal@greencampus.edu', 'admin@greencampus.edu'],
    createdAt: '2026-05-30T10:00:00Z',
  },
  {
    _id: 'rep-2',
    title: 'Q1 2026 Comprehensive Resource Audit',
    type: 'quarterly',
    period: 'Q1 2026',
    sustainabilityScore: 81,
    summary: 'Synthesized executive summary analyzing campus-wide carbon offsets and resource mitigation performance metrics for the first quarter of fiscal year 2026.',
    findings: [
      'Total carbon emissions tracked at 220,500 kg CO₂e.',
      'Engineering departments achieved rank 1 on conservation leaderboard scores.',
    ],
    recommendations: [
      'Establish occupancy-based smart LED schedules in central halls.',
      'Conduct departmental trash recycling competitions.',
    ],
    savings: 'Estimated savings: ₹48,000 and 12,000 liters of public water supply.',
    scheduledType: 'quarterly',
    emailRecipients: ['principal@greencampus.edu'],
    createdAt: '2026-03-31T15:30:00Z',
  },
];

const ReportsPage = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Form Generation states
  const [selType, setSelType] = useState('monthly');
  const [period, setPeriod] = useState('June 2026');
  
  // Scheduler states
  const [schedule, setSchedule] = useState('monthly');
  const [recipients, setRecipients] = useState<string[]>(['principal@greencampus.edu']);
  const [newRecipient, setNewRecipient] = useState('');
  const [showRecipientForm, setShowRecipientForm] = useState(false);

  // Preview Modal
  const [previewReport, setPreviewReport] = useState<ReportData | null>(null);

  // Chat Panel states
  const [activeReportId, setActiveReportId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ReportChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const { showToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReports(json.data);
          if (json.data.length > 0 && !activeReportId) {
            setActiveReportId(json.data[0]._id);
          }
        } else {
          setReports(RECENT_FALLBACK_REPORTS);
          setActiveReportId(RECENT_FALLBACK_REPORTS[0]._id);
        }
      } else {
        setReports(RECENT_FALLBACK_REPORTS);
        setActiveReportId(RECENT_FALLBACK_REPORTS[0]._id);
      }
    } catch (e) {
      console.log('Failed fetching reports API, applying mock fallback.');
      setReports(RECENT_FALLBACK_REPORTS);
      setActiveReportId(RECENT_FALLBACK_REPORTS[0]._id);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Update chat message feeds when report context changes
  useEffect(() => {
    const activeReport = reports.find(r => r._id === activeReportId);
    if (activeReport) {
      setChatMessages([
        {
          role: 'assistant',
          content: `Hello! I've loaded the details for **${activeReport.title}**. You can ask me to explain findings, analyze predictions, or suggest conservation strategies.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeReportId, reports]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selType,
          period,
          scheduledType: schedule,
          emailRecipients: recipients
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setReports((prev) => [json.data, ...prev]);
          setActiveReportId(json.data._id);
        }
      } else {
        simulateFallbackReportGeneration();
      }
    } catch (e) {
      simulateFallbackReportGeneration();
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const simulateFallbackReportGeneration = () => {
    const capitalizedType = selType.charAt(0).toUpperCase() + selType.slice(1);
    const mockNew: ReportData = {
      _id: `rep-${Date.now()}`,
      title: `${capitalizedType} Sustainability Report (${period})`,
      type: selType,
      period,
      sustainabilityScore: 83,
      summary: `Automated AI analysis generated for period: ${period}. Synthesizes live campus resource data, department recycling performance, and linear regression consumption trends.`,
      findings: [
        'Main Block chillers logged a peak energy consumption period.',
        'Total waste generation index is currently stabilizing at 82 kg/day.',
      ],
      recommendations: [
        'Transition canteen vendor packaging rules to biodegradable utensils.',
        'Optimize computer labs AC cycles using localized schedule controllers.',
      ],
      savings: 'Estimated potential savings: ₹16,500/month in utility bills.',
      scheduledType: schedule,
      emailRecipients: recipients,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [mockNew, ...prev]);
    setActiveReportId(mockNew._id);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Deleted locally.');
    }
    setReports((prev) => prev.filter(r => r._id !== id));
  };

  const handleDownloadPDF = async (report: ReportData) => {
    if (report._id.startsWith('rep-')) {
      alert('This is a local preview report. Generate a real report via the form to download a PDF.');
      return;
    }
    setDownloadingId(report._id);
    showToast('PDF Download Started', 'info');
    try {
      const response = await axios.get(`/api/reports/${report._id}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const safePeriod = report.period
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      a.download = `GreenCampus_Report_${safePeriod}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast('PDF Download Successful', 'success');
    } catch (e: any) {
      console.error('PDF download failed:', e);
      if (e.response && e.response.status === 404) {
        showToast('PDF Not Found', 'error');
      } else {
        showToast('Server Error', 'error');
      }
    } finally {
      setDownloadingId('');
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient('');
      setShowRecipientForm(false);
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeReportId) return;
    
    const userMsg: ReportChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    const promptText = chatInput;
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Regarding the generated report: ${reports.find(r => r._id === activeReportId)?.title}. Question: ${promptText}`
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.message) {
          setChatMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: json.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setChatLoading(false);
          return;
        }
      }
      throw new Error('API fallback');
    } catch (err) {
      setTimeout(() => {
        const activeRep = reports.find(r => r._id === activeReportId);
        const replyText = `Based on the active report details for **${activeRep?.title}**, the sustainability score is currently **${activeRep?.sustainabilityScore}%**. The primary recommendation is: "${activeRep?.recommendations[0] || 'Optimize HVAC scheduling'}". Implementing this strategy is estimated to yield **${activeRep?.savings}**.`;
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setChatLoading(false);
      }, 700);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.period.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 page-fade">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            AI Sustainability{' '}
            <span className="text-primaryGlow text-glow">Reports</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Generate executive-grade sustainability reports instantly.
          </p>
        </div>
      </div>

      {/* ── Grid: Configuration & Scheduler Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Generate Report Config Card */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primaryGlow" />
              Configure Report Generation
            </h3>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Report Type</label>
                <select
                  value={selType}
                  onChange={(e) => setSelType(e.target.value)}
                  className="w-full bg-[#050816] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryGlow"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Audit Period</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g. June 2026"
                  className="w-full bg-[#050816] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primaryGlow"
                />
              </div>
            </div>

            {/* Recipients Email List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accentBlue" />
                  Email Integration (Auto-Send Recipients)
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecipientForm(!showRecipientForm)}
                  className="text-[10px] text-primaryGlow hover:text-white font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Recipient
                </button>
              </div>

              {showRecipientForm && (
                <div className="flex gap-2 bg-[#050816] p-2.5 rounded-xl border border-white/[0.06]">
                  <input
                    type="email"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="e.g. principal@campus.edu"
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleAddRecipient}
                    className="px-3 py-1 rounded-lg bg-accentBlue text-white text-[10px] font-bold"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {recipients.map((email) => (
                  <span
                    key={email}
                    className="text-[10px] bg-white/[0.03] border border-white/[0.05] text-gray-300 font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5"
                  >
                    {email}
                    <button onClick={() => handleRemoveRecipient(email)} className="text-gray-500 hover:text-red-400">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full relative py-3 rounded-xl font-semibold text-xs bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/30 hover:bg-primaryGlow/25 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Compiling Campus Datasets & AI Generation…' : 'Generate AI Sustainability Report'}
            </button>
          </div>
        </div>

        {/* Report Scheduler Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accentPurple" />
              Automated Scheduler Settings
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Define scheduled intervals to automatically parse resource metrics, build PDFs, and email administrators.
            </p>

            <div className="grid grid-cols-3 gap-2 bg-[#050816] p-1.5 rounded-xl border border-white/[0.06]">
              {['weekly', 'monthly', 'quarterly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSchedule(type)}
                  className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    schedule === type ? 'bg-accentPurple text-white shadow-md' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-white/[0.04] mt-5 flex items-center gap-2 text-[10px] text-gray-500">
            <Check className="w-3.5 h-3.5 text-secondaryGlow" />
            <span>Scheduled reports build automatically at midnight UTC.</span>
          </div>
        </div>

      </div>

      {/* ── Grid: Reports History & Report chat AI ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Reports History List */}
        <div className="xl:col-span-7 glass-panel rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-white font-bold text-sm">Generated Reports History</h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search audits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#050816] border border-white/[0.06] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* List content */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report._id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  activeReportId === report._id
                    ? 'bg-white/[0.03] border-primaryGlow/30'
                    : 'bg-[#050816]/30 border-white/[0.05] hover:border-white/15'
                }`}
              >
                <div
                  className="flex-1 cursor-pointer flex items-start gap-3"
                  onClick={() => setActiveReportId(report._id)}
                >
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold hover:text-primaryGlow transition-colors">{report.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{report.type}</span>
                      <span className="text-[10px] text-gray-600">•</span>
                      <span className="text-[10px] text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewReport(report)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white border border-white/10"
                    title="Preview Report"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report)}
                    disabled={downloadingId === report._id || !report.pdfUrl}
                    className="p-2 rounded-lg bg-primaryGlow/10 text-primaryGlow hover:bg-primaryGlow/20 border border-primaryGlow/20 disabled:opacity-50"
                    title="Download PDF"
                  >
                    {downloadingId === report._id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <Download className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <p className="text-gray-500 text-xs py-8 text-center">No reports match your filters.</p>
            )}
          </div>
        </div>

        {/* AI Report Chat Panel */}
        <div className="xl:col-span-5 glass-panel rounded-3xl p-6 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-white/[0.04]">
              <MessageSquare className="w-4 h-4 text-accentPurple animate-pulse" />
              <div>
                <h3 className="text-white text-xs font-bold">AI Report Assistant</h3>
                <p className="text-[10px] text-gray-500">Ask questions regarding active report selection</p>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="space-y-3 py-4 overflow-y-auto max-h-[280px] min-h-[220px]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-5 h-5 rounded-lg bg-accentPurple/10 text-accentPurple shrink-0 flex items-center justify-center border border-accentPurple/20 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}
                  <div className={`p-2.5 rounded-xl text-[10px] max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accentPurple/20 text-white border border-accentPurple/30 font-medium'
                      : 'bg-white/[0.02] text-gray-300 border border-white/[0.05]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-1.5 text-gray-500 text-[10px] pl-7">
                  <Sparkles className="w-3.5 h-3.5 text-accentPurple animate-spin" />
                  Analyzing report...
                </div>
              )}
            </div>
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="relative flex items-center mt-3 pt-3 border-t border-white/[0.04]"
          >
            <input
              type="text"
              placeholder="Ask: 'Explain water findings' or 'What is the savings potential?'"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading || !activeReportId}
              className="w-full bg-[#050816] border border-white/[0.06] rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accentPurple/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim() || !activeReportId}
              className="absolute right-2 p-1.5 rounded-lg bg-accentPurple text-white hover:bg-accentPurple/80 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* ── Report Preview Modal ── */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewReport(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl h-[85vh] bg-[#050816] border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,229,255,0.1)]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-[#050816]/80 backdrop-blur">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primaryGlow" />
                  <h3 className="text-white font-bold text-sm">{previewReport.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1 rounded-lg text-gray-500 hover:text-white bg-white/5 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Document Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-xs">
                
                {/* Score & Header Meta */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl flex items-center gap-3">
                    <Award className="w-8 h-8 text-primaryGlow" />
                    <div>
                      <h4 className="text-[10px] text-gray-500 font-bold uppercase">Sustainability Score</h4>
                      <p className="text-white font-black text-xl">{previewReport.sustainabilityScore}%</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase">Period</h4>
                    <p className="text-white font-bold text-sm mt-1">{previewReport.period}</p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                    <h4 className="text-[10px] text-gray-500 font-bold uppercase">Date Generated</h4>
                    <p className="text-white font-bold text-sm mt-1">{new Date(previewReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Section: Executive Summary */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold border-b border-white/10 pb-1 text-sm">1. Executive Summary</h3>
                  <p className="leading-relaxed text-gray-400">{previewReport.summary}</p>
                </div>

                {/* Section: Key Findings */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold border-b border-white/10 pb-1 text-sm">2. Key Findings</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
                    {previewReport.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                {/* Section: Recommendations */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold border-b border-white/10 pb-1 text-sm">3. Action Recommendations</h3>
                  <ul className="list-inside list-decimal space-y-1.5 text-gray-400">
                    {previewReport.recommendations.map((r, i) => (
                      <li key={i} className="pl-1">{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Section: Savings */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold border-b border-white/10 pb-1 text-sm">4. Potential Savings</h3>
                  <p className="text-secondaryGlow font-semibold flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4" />
                    {previewReport.savings}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-end gap-2 shrink-0 bg-[#050816]/80">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white bg-white/5 border border-white/10 font-bold"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleDownloadPDF(previewReport)}
                  disabled={downloadingId === previewReport._id || !previewReport.pdfUrl}
                  className="px-4 py-2 rounded-xl bg-primaryGlow/10 text-primaryGlow hover:bg-primaryGlow/25 border border-primaryGlow/30 font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {downloadingId === previewReport._id
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />}
                  {downloadingId === previewReport._id ? 'Generating…' : 'Download PDF'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
