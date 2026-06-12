import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Zap, Droplets, Trash2, Wind, Building2, Users, Calendar, RefreshCw } from 'lucide-react';
import type { ResourceEntry } from './types';
import { calcCarbon, generateId } from './utils';

interface Props {
  onSubmit: (entry: ResourceEntry) => void | Promise<void>;
  editing: ResourceEntry | null;
  onCancel: () => void;
}

const BUILDINGS = [
  'Main Academic Block',
  'Science & Tech Hub',
  'Student Union',
  'Library Complex',
  'Admin Building',
  'Sports Facility',
  'Engineering Block',
];

const DEPARTMENTS: Record<string, string[]> = {
  'Main Academic Block': ['Computer Science', 'Mathematics', 'Physics'],
  'Science & Tech Hub': ['Chemistry', 'Biotechnology', 'Research Lab'],
  'Student Union': ['Events & Culture', 'Canteen', 'Recreation'],
  'Library Complex': ['Digital Resources', 'Archives', 'Reading Halls'],
  'Admin Building': ['HR & Finance', 'Management', 'IT Services'],
  'Sports Facility': ['Athletics', 'Aquatics', 'Gymnasium'],
  'Engineering Block': ['Mechanical', 'Civil', 'Electrical'],
};

const inputBase =
  'w-full bg-[#050816] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-primaryGlow/50 focus:shadow-[0_0_0_3px_rgba(0,229,255,0.08)] transition-all duration-200';

function FieldGroup({
  label,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
    </div>
  );
}

const ResourceEntryForm = ({ onSubmit, editing, onCancel }: Props) => {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    building: '',
    department: '',
    electricity: '',
    water: '',
    waste: '',
    date: today,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) {
      setForm({
        building: editing.building,
        department: editing.department,
        electricity: String(editing.electricity),
        water: String(editing.water),
        waste: String(editing.waste),
        date: editing.date,
      });
    } else {
      setForm({ building: '', department: '', electricity: '', water: '', waste: '', date: today });
    }
    setErrors({});
  }, [editing]);

  const carbon = form.electricity && form.waste
    ? calcCarbon(parseFloat(form.electricity) || 0, parseFloat(form.waste) || 0)
    : 0;

  const departments = form.building ? DEPARTMENTS[form.building] ?? [] : [];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.building) e.building = 'Select a building.';
    if (!form.department) e.department = 'Select a department.';
    if (!form.electricity || isNaN(+form.electricity) || +form.electricity < 0) e.electricity = 'Enter valid kWh.';
    if (!form.water || isNaN(+form.water) || +form.water < 0) e.water = 'Enter valid liters.';
    if (!form.waste || isNaN(+form.waste) || +form.waste < 0) e.waste = 'Enter valid kg.';
    if (!form.date) e.date = 'Pick a date.';
    return e;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await onSubmit({
        id: editing?.id ?? generateId(),
        building: form.building,
        department: form.department,
        electricity: parseFloat(form.electricity),
        water: parseFloat(form.water),
        waste: parseFloat(form.waste),
        carbon,
        date: form.date,
      });
      setForm({ building: '', department: '', electricity: '', water: '', waste: '', date: today });
      setErrors({});
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="glass-panel rounded-2xl p-6 relative overflow-hidden"
      >
        {/* Accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primaryGlow/60 via-accentPurple/40 to-secondaryGlow/60" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Edit Resource Entry' : 'Add Resource Entry'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {editing ? 'Update the values below.' : 'Carbon is automatically calculated.'}
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Building */}
            <FieldGroup label="Building" icon={Building2} color="text-primaryGlow">
              <select
                value={form.building}
                onChange={(e) => {
                  setForm({ ...form, building: e.target.value, department: '' });
                  setErrors({ ...errors, building: '', department: '' });
                }}
                className={inputBase}
              >
                <option value="">Select building…</option>
                {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              {errors.building && <p className="text-red-400 text-xs">{errors.building}</p>}
            </FieldGroup>

            {/* Department */}
            <FieldGroup label="Department" icon={Users} color="text-accentBlue">
              <select
                value={form.department}
                onChange={(e) => { setForm({ ...form, department: e.target.value }); setErrors({ ...errors, department: '' }); }}
                disabled={!form.building}
                className={`${inputBase} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <option value="">Select department…</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-red-400 text-xs">{errors.department}</p>}
            </FieldGroup>

            {/* Date */}
            <FieldGroup label="Date" icon={Calendar} color="text-accentPurple">
              <input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) => { setForm({ ...form, date: e.target.value }); setErrors({ ...errors, date: '' }); }}
                className={`${inputBase} [color-scheme:dark]`}
              />
              {errors.date && <p className="text-red-400 text-xs">{errors.date}</p>}
            </FieldGroup>

            {/* Electricity */}
            <FieldGroup label="Electricity (kWh)" icon={Zap} color="text-primaryGlow">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 450"
                value={form.electricity}
                onChange={(e) => { setForm({ ...form, electricity: e.target.value }); setErrors({ ...errors, electricity: '' }); }}
                className={inputBase}
              />
              {errors.electricity && <p className="text-red-400 text-xs">{errors.electricity}</p>}
            </FieldGroup>

            {/* Water */}
            <FieldGroup label="Water (Liters)" icon={Droplets} color="text-accentBlue">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 2500"
                value={form.water}
                onChange={(e) => { setForm({ ...form, water: e.target.value }); setErrors({ ...errors, water: '' }); }}
                className={inputBase}
              />
              {errors.water && <p className="text-red-400 text-xs">{errors.water}</p>}
            </FieldGroup>

            {/* Waste */}
            <FieldGroup label="Waste (kg)" icon={Trash2} color="text-accentPurple">
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="e.g. 80"
                value={form.waste}
                onChange={(e) => { setForm({ ...form, waste: e.target.value }); setErrors({ ...errors, waste: '' }); }}
                className={inputBase}
              />
              {errors.waste && <p className="text-red-400 text-xs">{errors.waste}</p>}
            </FieldGroup>
          </div>

          {/* Auto-calculated Carbon */}
          <motion.div
            animate={{ opacity: carbon > 0 ? 1 : 0.4 }}
            className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondaryGlow/[0.06] border border-secondaryGlow/20"
          >
            <Wind className="w-4 h-4 text-secondaryGlow flex-shrink-0" />
            <span className="text-sm text-gray-300">
              Auto-calculated Carbon Emissions:{' '}
              <span className="font-bold text-secondaryGlow">
                {carbon.toFixed(2)} kg CO₂e
              </span>
            </span>
            <span className="ml-auto text-xs text-gray-500 hidden sm:block">
              (0.233 × kWh + 0.054 × waste)
            </span>
          </motion.div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] border border-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? undefined : { scale: 1.03 }}
              whileTap={submitting ? undefined : { scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/30 hover:bg-primaryGlow/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {submitting ? (editing ? 'Saving…' : 'Logging…') : (editing ? 'Save Changes' : 'Add Entry')}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResourceEntryForm;
