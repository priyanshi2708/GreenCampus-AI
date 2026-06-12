import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import {
  Trophy, Award, Target, Flame, Cpu, MessageSquare, ChevronRight,
  TrendingUp, RefreshCw, Plus, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Minus, Zap, Droplet, Wind, Sparkles, Star, Users, Calendar, Clock,
  Shield, User, Gift, HelpCircle
} from 'lucide-react';

interface StudentData {
  _id: string;
  name: string;
  campus: string;
  points: number;
  streak: number;
  sustainabilityScore: number;
  rank: number;
}

interface DepartmentData {
  name: string;
  score: number;
  points: number;
  rank: number;
  trend: string;
  change: string;
}

interface ChallengeData {
  _id: string;
  title: string;
  description: string;
  category: 'Energy' | 'Water' | 'Waste' | 'Carbon';
  type: 'Weekly' | 'Monthly' | 'Campus';
  pointsReward: number;
  targetValue: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  isJoined: boolean;
  progress: number;
  status: 'not_joined' | 'active' | 'completed';
}

interface BadgeData {
  _id: string;
  title: string;
  description: string;
  icon: string;
  type: 'Streak' | 'Milestone' | 'Special';
  requirement: string;
  isUnlocked: boolean;
}

const LeaderboardPage = () => {
  // Tabs: 'leaderboard' | 'challenges' | 'achievements'
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'achievements'>('leaderboard');
  const [leaderboardType, setLeaderboardType] = useState<'departments' | 'students'>('departments');
  
  const [students, setStudents] = useState<StudentData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  
  const [profileStats, setProfileStats] = useState({
    points: 380,
    streak: 4,
    completedCount: 2,
    sustainabilityScore: 84
  });

  const [loading, setLoading] = useState(false);
  const [coachResponse, setCoachResponse] = useState<string>('');
  const [coachCalculating, setCoachCalculating] = useState(false);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch leaderboard
      const lbRes = await axios.get('/api/leaderboard');
      if (lbRes.data && lbRes.data.success) {
        setStudents(lbRes.data.data.students);
        setDepartments(lbRes.data.data.departments);
      }

      // Fetch challenges
      const chRes = await axios.get('/api/challenges');
      if (chRes.data && chRes.data.success) {
        setChallenges(chRes.data.data);
      }

      // Fetch badges and profile details
      const bgRes = await axios.get('/api/badges');
      if (bgRes.data && bgRes.data.success) {
        setBadges(bgRes.data.data.badges);
        setProfileStats({
          points: bgRes.data.data.points,
          streak: bgRes.data.data.streak,
          completedCount: bgRes.data.data.completedCount,
          sustainabilityScore: bgRes.data.data.sustainabilityScore
        });
      }
    } catch (e) {
      console.error('Error fetching gamification data:', e);
      showToast('Error fetching gamification data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await axios.post(`/api/challenges/${challengeId}/join`);
      if (res.data && res.data.success) {
        showToast('Successfully joined challenge! +10% Initial Progress', 'success');
        loadData(); // reload challenges and updated profile stats
      }
    } catch (e: any) {
      console.error('Error joining challenge:', e);
      showToast(e.response?.data?.message || 'Failed to join challenge.', 'error');
    }
  };

  const handleCoachQuery = (queryType: 'suggest' | 'recommend' | 'predict' | 'explain') => {
    setCoachCalculating(true);
    setCoachResponse('');
    setTimeout(() => {
      let responseText = '';
      if (queryType === 'suggest') {
        responseText = `Based on your profile, I suggest joining the "Restroom Leak Hunting Campaign". You've already unlocked the 'Green Novice' streak badge, and completing this will secure you the prestigious 'Water Guardian' special badge and add 250 points to your profile!`;
      } else if (queryType === 'recommend') {
        responseText = `I recommend adjusting your building HVAC timers inside your dormitory room. Reducing heating/cooling by just 1.5°C during off-hours will save an estimated 320 kWh of electricity per month and bump up your personal sustainability rating!`;
      } else if (queryType === 'predict') {
        responseText = `If you successfully complete both the "LED Conversion Sprint" and the "Double-Sided Printing Drive" weekly challenges, your personal Sustainability Score will improve from ${profileStats.sustainabilityScore}/100 to ${(profileStats.sustainabilityScore + 4)}/100 by next Monday!`;
      } else if (queryType === 'explain') {
        responseText = `The School of Engineering leads with a score of 94 because of a 92% plastic-free audit rating and their recent HVAC scheduling optimization program. The Student Union sits in 3rd place with 82 points due to high food waste recycling compliance.`;
      }
      setCoachResponse(responseText);
      setCoachCalculating(false);
    }, 1200);
  };

  // Podium sorting: Rank 2 (Left), Rank 1 (Center), Rank 3 (Right)
  const getPodiumList = () => {
    if (leaderboardType === 'departments') {
      if (departments.length < 3) return [];
      return [departments[1], departments[0], departments[2]];
    } else {
      if (students.length < 3) return [];
      return [students[1], students[0], students[2]];
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Trophy': return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'Wind': return <Wind className="w-6 h-6 text-sky-400" />;
      case 'Droplet': return <Droplet className="w-6 h-6 text-blue-400" />;
      case 'Award': return <Award className="w-6 h-6 text-emerald-400" />;
      default: return <Star className="w-6 h-6 text-primaryGlow" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Energy': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Water': return <Droplet className="w-4 h-4 text-blue-400" />;
      case 'Waste': return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'Carbon': return <Sparkles className="w-4 h-4 text-indigo-400" />;
      default: return <Star className="w-4 h-4 text-primaryGlow" />;
    }
  };

  const getPodiumLabel = (rank: number) => {
    if (rank === 1) return { text: '1st Place', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    if (rank === 2) return { text: '2nd Place', color: 'text-gray-300 bg-gray-300/10 border-gray-300/20' };
    return { text: '3rd Place', color: 'text-amber-600 bg-amber-600/10 border-amber-600/20' };
  };

  const podiumItems = getPodiumList();
  const remainingItems = leaderboardType === 'departments' 
    ? departments.slice(3) 
    : students.slice(3);

  return (
    <div className="space-y-8 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-primaryGlow" />
            Sustainability Leaderboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Unlock badges, win weekly challenges, and drive your campus towards net-zero.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-bold disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* ── GRID: STUDENT PROFILE & AI COACH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primaryGlow/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accentPurple to-primaryGlow flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.25)] border border-white/10">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-sm font-bold">Active Administrator</h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Campus Coordinator</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Points</span>
                <p className="text-white text-sm font-black">{profileStats.points}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1 animate-pulse" />
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Streak</span>
                <p className="text-white text-sm font-black">{profileStats.streak} Days</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Completed</span>
                <p className="text-white text-sm font-black">{profileStats.completedCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-extrabold text-gray-500 uppercase tracking-widest">SUSTAINABILITY SCORE</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-primaryGlow">{profileStats.sustainabilityScore}</span>
                <span className="text-xs text-gray-500 font-medium">/100</span>
              </div>
            </div>
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primaryGlow rounded-full" style={{ width: `${profileStats.sustainabilityScore}%` }} />
            </div>
          </div>
        </div>

        {/* AI Sustainability Coach */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-secondaryGlow animate-pulse" />
              AI Sustainability Coach
            </h3>
            <span className="text-[9px] text-gray-500 font-bold uppercase">Real-Time Recommendations</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { id: 'suggest', label: 'Suggest Challenge', desc: 'Find suitable events' },
              { id: 'recommend', label: 'Recommend Action', desc: 'Daily carbon reduction' },
              { id: 'predict', label: 'Predict Score', desc: 'Simulate score changes' },
              { id: 'explain', label: 'Explain Rankings', desc: 'Review leaderboards' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleCoachQuery(btn.id as any)}
                className="bg-white/5 border border-white/10 hover:border-secondaryGlow/40 p-3 rounded-xl text-left hover:bg-white/[0.08] transition-all group"
              >
                <span className="text-white text-xs font-bold block group-hover:text-secondaryGlow transition-colors">{btn.label}</span>
                <span className="text-[9px] text-gray-500 font-medium block mt-0.5 leading-snug">{btn.desc}</span>
              </button>
            ))}
          </div>

          {/* Prompt Result Box */}
          <div className="p-4 bg-secondaryGlow/[0.03] border border-secondaryGlow/10 rounded-xl min-h-[72px] flex items-center justify-center">
            {coachCalculating ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-secondaryGlow animate-spin" />
                <span className="text-xs font-bold text-secondaryGlow uppercase tracking-wider">AI Coach is analyzing campus logs...</span>
              </div>
            ) : coachResponse ? (
              <p className="text-gray-300 text-xs leading-relaxed w-full font-medium flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-secondaryGlow shrink-0 mt-0.5" />
                {coachResponse}
              </p>
            ) : (
              <p className="text-gray-500 text-xs text-center font-medium">Click any module above to calculate and trigger coach diagnostics.</p>
            )}
          </div>
        </div>

      </div>

      {/* ── NAV TABS ── */}
      <div className="flex border-b border-white/5 gap-6">
        {[
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'challenges', label: 'Campus Challenges', icon: Target },
          { id: 'achievements', label: 'Badges & Achievements', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'border-primaryGlow text-white' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── MAIN TABS CONTENT AREA ── */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primaryGlow animate-spin" />
            <p className="text-gray-400 text-sm font-semibold">Analyzing campus statistics...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* 1. LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                
                {/* Ranking toggle sub-bar */}
                <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLeaderboardType('departments')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                        leaderboardType === 'departments' 
                          ? 'bg-primaryGlow text-background shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Department Rankings
                    </button>
                    <button
                      onClick={() => setLeaderboardType('students')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                        leaderboardType === 'students' 
                          ? 'bg-primaryGlow text-background shadow-[0_0_10px_rgba(0,229,255,0.25)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Student Rankings
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Monthly Competition Cycle</span>
                </div>

                {/* Animated Podium for Top 3 */}
                {podiumItems.length >= 3 && (
                  <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 pt-10 pb-4">
                    
                    {/* Rank 2 (Left) */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                      className="w-full sm:w-48 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[220px] relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 text-xs font-bold text-gray-400">#2</div>
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-gray-300" />
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-bold truncate max-w-[160px]">
                          {leaderboardType === 'departments' 
                            ? (podiumItems[0] as any).name 
                            : (podiumItems[0] as any).name}
                        </h4>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          {leaderboardType === 'departments' 
                            ? `${(podiumItems[0] as any).points} Points` 
                            : `${(podiumItems[0] as any).points} pts`}
                        </p>
                      </div>
                      <div className="w-full mt-4 bg-white/5 border border-white/10 rounded-lg py-2">
                        <span className="text-gray-300 text-xs font-bold">
                          {leaderboardType === 'departments' 
                            ? `Score: ${(podiumItems[0] as any).score}`
                            : `Score: ${(podiumItems[0] as any).sustainabilityScore}`}
                        </span>
                      </div>
                    </motion.div>

                    {/* Rank 1 (Center) */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.05, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                      className="w-full sm:w-52 bg-primaryGlow/[0.04] border border-primaryGlow/25 rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[250px] relative overflow-hidden shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                    >
                      <div className="absolute top-2 right-2 text-xs font-bold text-yellow-400">#1</div>
                      <div className="absolute top-0 inset-x-0 h-1 bg-primaryGlow" />
                      <div className="w-14 h-14 rounded-full bg-primaryGlow/10 border border-primaryGlow/20 flex items-center justify-center mb-3">
                        <Trophy className="w-7 h-7 text-yellow-400 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-black truncate max-w-[180px]">
                          {leaderboardType === 'departments' 
                            ? (podiumItems[1] as any).name 
                            : (podiumItems[1] as any).name}
                        </h4>
                        <p className="text-primaryGlow text-[10px] font-bold mt-0.5">
                          {leaderboardType === 'departments' 
                            ? `${(podiumItems[1] as any).points} Points` 
                            : `${(podiumItems[1] as any).points} pts`}
                        </p>
                      </div>
                      <div className="w-full mt-4 bg-primaryGlow/10 border border-primaryGlow/20 rounded-lg py-2">
                        <span className="text-white text-xs font-extrabold">
                          {leaderboardType === 'departments' 
                            ? `Score: ${(podiumItems[1] as any).score}`
                            : `Score: ${(podiumItems[1] as any).sustainabilityScore}`}
                        </span>
                      </div>
                    </motion.div>

                    {/* Rank 3 (Right) */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                      className="w-full sm:w-48 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center justify-between text-center min-h-[200px] relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 text-xs font-bold text-amber-600">#3</div>
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-bold truncate max-w-[160px]">
                          {leaderboardType === 'departments' 
                            ? (podiumItems[2] as any).name 
                            : (podiumItems[2] as any).name}
                        </h4>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          {leaderboardType === 'departments' 
                            ? `${(podiumItems[2] as any).points} Points` 
                            : `${(podiumItems[2] as any).points} pts`}
                        </p>
                      </div>
                      <div className="w-full mt-4 bg-white/5 border border-white/10 rounded-lg py-2">
                        <span className="text-gray-300 text-xs font-bold">
                          {leaderboardType === 'departments' 
                            ? `Score: ${(podiumItems[2] as any).score}`
                            : `Score: ${(podiumItems[2] as any).sustainabilityScore}`}
                        </span>
                      </div>
                    </motion.div>

                  </div>
                )}

                {/* Leaderboard Table List (Rank 4+) */}
                <div className="glass-panel rounded-2xl border border-white/[0.04] overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-gray-500">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-5 md:col-span-6">Name</div>
                    <div className="col-span-3 md:col-span-2 text-right">Points / Score</div>
                    <div className="col-span-2 text-right">Activity / Trend</div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {remainingItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.01] transition-all">
                        
                        <div className="col-span-2 flex justify-center">
                          <span className="text-xs font-bold text-gray-400 font-mono">#{idx + 4}</span>
                        </div>
                        
                        <div className="col-span-5 md:col-span-6">
                          <h4 className="text-white text-xs font-bold">{item.name}</h4>
                          <span className="text-[9px] text-gray-500 font-medium">
                            {leaderboardType === 'departments' ? 'Department Unit' : (item as any).campus}
                          </span>
                        </div>
                        
                        <div className="col-span-3 md:col-span-2 text-right">
                          <span className="text-white text-xs font-bold font-mono">
                            {leaderboardType === 'departments' ? (item as DepartmentData).points : (item as StudentData).points}
                          </span>
                          <span className="text-[10px] text-gray-500 ml-1 font-mono">
                            ({leaderboardType === 'departments' ? `${(item as DepartmentData).score}` : `${(item as StudentData).sustainabilityScore}`}%)
                          </span>
                        </div>
                        
                        <div className="col-span-2 flex justify-end">
                          {leaderboardType === 'departments' ? (
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                              (item as DepartmentData).trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 
                              (item as DepartmentData).trend === 'down' ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-white/5'
                            }`}>
                              {(item as DepartmentData).trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : (item as DepartmentData).trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                              {(item as DepartmentData).change}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                              <Flame className="w-3 h-3" />
                              {(item as StudentData).streak} Days
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* 2. CHALLENGES TAB */}
            {activeTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {challenges.map((c) => (
                  <div key={c._id} className="glass-panel p-5 rounded-2xl border border-white/[0.04] bg-[#050816]/30 flex flex-col justify-between space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          {getCategoryIcon(c.category)}
                        </div>
                        <div>
                          <h4 className="text-white text-xs font-bold leading-snug">{c.title}</h4>
                          <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-widest">{c.type} Challenge</span>
                        </div>
                      </div>
                      
                      <span className="bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/25 text-[10px] font-black px-2 py-1 rounded-lg">
                        +{c.pointsReward} Points
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed">{c.description}</p>

                    {/* Progress details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase">
                        <span>Participants: <strong className="text-gray-300 font-extrabold">{c.currentParticipants}</strong></span>
                        {c.isJoined && (
                          <span className="text-primaryGlow">Progress: {c.progress}%</span>
                        )}
                      </div>
                      
                      {c.isJoined && (
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primaryGlow rounded-full" style={{ width: `${c.progress}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[9px] text-gray-500 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Ends: {new Date(c.endDate).toLocaleDateString()}
                      </span>

                      {c.isJoined ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold flex items-center gap-1 disabled:opacity-80"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Joined
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinChallenge(c._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-primaryGlow hover:bg-primaryGlow/90 text-background text-[10px] font-black transition-all flex items-center gap-1 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Join Challenge
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </motion.div>
            )}

            {/* 3. ACHIEVEMENTS TAB */}
            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                
                {/* Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge._id}
                      className={`glass-panel p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                        badge.isUnlocked
                          ? 'bg-primaryGlow/[0.02] border-primaryGlow/30'
                          : 'bg-[#050816]/30 border-white/[0.04] opacity-60'
                      }`}
                    >
                      <div className={`p-3 rounded-xl border shrink-0 ${
                        badge.isUnlocked
                          ? 'bg-primaryGlow/10 border-primaryGlow/20'
                          : 'bg-white/5 border-white/10'
                      }`}>
                        {getBadgeIcon(badge.icon)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-white text-xs font-black leading-none">{badge.title}</h4>
                          {badge.isUnlocked && (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-extrabold uppercase px-1 rounded">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">{badge.description}</p>
                        <div className="pt-1.5">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                            REQ: {badge.requirement}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Achievements Milestones / Certificates widget */}
                <div className="glass-panel p-6 rounded-2xl border border-white/[0.04] bg-[#050816]/30 space-y-4">
                  <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Sustainability Certificates Gallery
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <h5 className="text-white text-xs font-bold">Conservation Pioneer Certificate</h5>
                        <p className="text-[10px] text-gray-500 mt-1 leading-snug">Unlocked upon completing 2 challenges and achieving an 80+ sustainability score.</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-background text-[10px] font-black shadow-md">
                        Download PDF
                      </button>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between gap-4 opacity-50">
                      <div>
                        <h5 className="text-white text-xs font-bold">Net-Zero Advocate Certificate</h5>
                        <p className="text-[10px] text-gray-500 mt-1 leading-snug">Locks until user earns 1,000 total points and unlock 5 milestones.</p>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold">Locked</span>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

export default LeaderboardPage;
