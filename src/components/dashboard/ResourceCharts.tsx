import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AreaChart as ChartIcon } from 'lucide-react';

interface ResourceChartsProps {
  resourcesCount?: number;
}

const mockData = [
  { time: '00:00', energy: 1200, water: 800 },
  { time: '04:00', energy: 900, water: 600 },
  { time: '08:00', energy: 3200, water: 2400 },
  { time: '12:00', energy: 4500, water: 3100 },
  { time: '16:00', energy: 4100, water: 2800 },
  { time: '20:00', energy: 2800, water: 1500 },
  { time: '23:59', energy: 1500, water: 900 },
];

const ResourceCharts = ({ resourcesCount = 0 }: ResourceChartsProps) => {
  const [activeTab, setActiveTab] = useState<'energy' | 'water'>('energy');

  if (resourcesCount === 0) {
    return (
      <div className="bg-card border border-white/[0.05] rounded-3xl p-6 relative flex flex-col justify-between min-h-[380px]">
        <div>
          <h3 className="text-white font-semibold">Resource Analytics</h3>
          <p className="text-gray-400 text-sm mt-1">Real-time consumption across campus</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-10">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
            <ChartIcon className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-xs max-w-sm">
            No resource logs registered yet. Consumption analytics will automatically populate here once log entries are created.
          </p>
        </div>
        <div className="flex justify-between items-center text-[10px] text-gray-600 border-t border-white/[0.05] pt-4 mt-4">
          <span>Source: Smart Meters IoT Grid</span>
          <span>Last Sync: Pending logs</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-white font-semibold">Resource Analytics</h3>
          <p className="text-gray-400 text-sm mt-1">Real-time consumption across campus</p>
        </div>
        
        <div className="flex bg-[#050816] rounded-lg p-1 border border-white/[0.05]">
          <button 
            onClick={() => setActiveTab('energy')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'energy' ? 'bg-primaryGlow/10 text-primaryGlow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Energy
          </button>
          <button 
            onClick={() => setActiveTab('water')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'water' ? 'bg-accentBlue/10 text-accentBlue' : 'text-gray-400 hover:text-white'
            }`}
          >
            Water
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#050816', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            {activeTab === 'energy' ? (
              <Area name="Energy (kWh)" type="monotone" dataKey="energy" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
            ) : (
              <Area name="Water (Liters)" type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-white/[0.05] pt-4 mt-6">
        <span>Source: Smart Meters IoT Grid</span>
        <span>Last Sync: Just now</span>
      </div>
    </div>
  );
};

export default ResourceCharts;
