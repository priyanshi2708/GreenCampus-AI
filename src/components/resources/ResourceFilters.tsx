import { motion } from 'framer-motion';
import { Filter, X, Building2, Users, Calendar } from 'lucide-react';
import type { ResourceFiltersState } from './types';

interface Props {
  filters: ResourceFiltersState;
  onChange: (f: ResourceFiltersState) => void;
  buildings: string[];
  departments: string[];
}

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

const selectBase =
  'bg-[#050816] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primaryGlow/40 focus:shadow-[0_0_0_2px_rgba(0,229,255,0.07)] transition-all duration-200 cursor-pointer';

const ResourceFilters = ({ filters, onChange, buildings, departments }: Props) => {
  const set = (key: keyof ResourceFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });

  const activeCount = Object.values(filters).filter(Boolean).length;

  const clearAll = () =>
    onChange({ building: '', department: '', month: '', year: '', dateFrom: '', dateTo: '' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primaryGlow" />
          <h3 className="text-sm font-semibold text-white">Filters</h3>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-primaryGlow/20 text-primaryGlow text-xs font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primaryGlow transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Building */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Building2 className="w-3 h-3" /> Building
          </label>
          <select value={filters.building} onChange={(e) => set('building', e.target.value)} className={selectBase}>
            <option value="">All Buildings</option>
            {buildings.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Users className="w-3 h-3" /> Department
          </label>
          <select value={filters.department} onChange={(e) => set('department', e.target.value)} className={selectBase}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Calendar className="w-3 h-3" /> Month
          </label>
          <select value={filters.month} onChange={(e) => set('month', e.target.value)} className={selectBase}>
            <option value="">All Months</option>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-medium text-gray-400">
            <Calendar className="w-3 h-3" /> Year
          </label>
          <select value={filters.year} onChange={(e) => set('year', e.target.value)} className={selectBase}>
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Date From */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">From Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            className={`${selectBase} [color-scheme:dark]`}
          />
        </div>

        {/* Date To */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400">To Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            className={`${selectBase} [color-scheme:dark]`}
          />
        </div>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.05]">
          {Object.entries(filters).map(([key, value]) =>
            value ? (
              <span
                key={key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primaryGlow/10 border border-primaryGlow/20 text-xs text-primaryGlow"
              >
                {key}: <strong>{value}</strong>
                <button
                  onClick={() => set(key as keyof ResourceFiltersState, '')}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null,
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ResourceFilters;
