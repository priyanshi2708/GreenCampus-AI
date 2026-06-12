import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const alerts = [
  {
    id: 1,
    title: 'High Electricity Spike Detected',
    time: '10 mins ago',
    type: 'critical',
    desc: 'Library HVAC system running outside normal parameters.',
  },
  {
    id: 2,
    title: 'Water Leakage Risk',
    time: '1 hr ago',
    type: 'warning',
    desc: 'Continuous flow detected in Science Block restrooms.',
  },
  {
    id: 3,
    title: 'Unusual Resource Consumption',
    time: '3 hrs ago',
    type: 'info',
    desc: 'Hostel A energy usage +12% above daily average.',
  }
];

const getAlertConfig = (type: string) => {
  switch (type) {
    case 'critical': return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    case 'warning': return { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
    default: return { icon: Info, color: 'text-accentBlue', bg: 'bg-accentBlue/10', border: 'border-accentBlue/20' };
  }
};

const AlertCenter = () => {
  return (
    <div className="bg-card border border-white/[0.05] rounded-3xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-semibold">Alert Center</h3>
        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">3 New</span>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {alerts.map((alert, i) => {
          const config = getAlertConfig(alert.type);
          return (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`p-4 rounded-xl border ${config.border} bg-white/[0.02] flex gap-3 group hover:bg-white/[0.04] transition-colors cursor-pointer`}
            >
              <div className={`p-2 rounded-lg h-fit shrink-0 ${config.bg}`}>
                <config.icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white text-sm font-medium pr-2">{alert.title}</h4>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap">{alert.time}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{alert.desc}</p>
                <button className="text-[11px] font-semibold text-white/70 hover:text-white transition-colors">Take Action &rarr;</button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertCenter;
