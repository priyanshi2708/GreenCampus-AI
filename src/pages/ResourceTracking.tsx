import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import ResourceKPICards from '../components/resources/ResourceKPICards';
import ResourceEntryForm from '../components/resources/ResourceEntryForm';
import ResourceHistoryTable from '../components/resources/ResourceHistoryTable';
import ResourceFilters from '../components/resources/ResourceFilters';
import ResourceAnalyticsCharts from '../components/resources/ResourceAnalyticsCharts';
import ResourceHealthScore from '../components/resources/ResourceHealthScore';
import type { ResourceEntry, ResourceFiltersState } from '../components/resources/types';

const ResourceTracking = () => {
  const [entries, setEntries] = useState<ResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  
  const [filters, setFilters] = useState<ResourceFiltersState>({
    building: '',
    department: '',
    month: '',
    year: '',
    dateFrom: '',
    dateTo: '',
  });
  const [editingEntry, setEditingEntry] = useState<ResourceEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await axios.get('/api/resources');
      if (res.data && res.data.success) {
        const mapped = res.data.data.map((r: any) => ({
          id: r._id,
          building: r.building,
          department: r.department,
          electricity: r.electricity,
          water: r.water,
          waste: r.waste,
          carbon: r.carbon,
          date: r.date.split('T')[0],
        }));
        setEntries(mapped);
      }
    } catch (e: any) {
      console.error(e);
      showToast('Failed to load resource data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    const d = new Date(e.date);
    if (filters.building && e.building !== filters.building) return false;
    if (filters.department && e.department !== filters.department) return false;
    if (filters.month && String(d.getMonth() + 1).padStart(2, '0') !== filters.month) return false;
    if (filters.year && String(d.getFullYear()) !== filters.year) return false;
    if (filters.dateFrom && e.date < filters.dateFrom) return false;
    if (filters.dateTo && e.date > filters.dateTo) return false;
    return true;
  });

  const handleAdd = async (entry: ResourceEntry) => {
    try {
      const payload = {
        building: entry.building,
        department: entry.department,
        electricity: entry.electricity,
        water: entry.water,
        waste: entry.waste,
        date: entry.date,
      };

      if (editingEntry) {
        const res = await axios.put(`/api/resources/${editingEntry.id}`, payload);
        if (res.data.success) {
          showToast('Resource entry updated successfully.', 'success');
          fetchResources();
        }
      } else {
        const res = await axios.post('/api/resources', payload);
        if (res.data.success) {
          showToast('Resource entry logged successfully.', 'success');
          fetchResources();
        }
      }
      setShowForm(false);
      setEditingEntry(null);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to save resource entry.', 'error');
    }
  };

  const handleEdit = (entry: ResourceEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource entry?')) return;
    try {
      const res = await axios.delete(`/api/resources/${id}`);
      if (res.data.success) {
        showToast('Resource entry deleted successfully.', 'success');
        fetchResources();
      }
    } catch (e: any) {
      showToast('Failed to delete resource entry.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setShowForm(false);
  };

  // Unique buildings & departments for filters
  const buildings = [...new Set(entries.map((e) => e.building))].sort();
  const departments = [...new Set(entries.map((e) => e.department))].sort();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="w-10 h-10 border-4 border-primaryGlow border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-semibold animate-pulse">Loading campus resources database...</p>
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
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Resource Tracking{' '}
            <span className="text-primaryGlow text-glow">Center</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Monitor, analyze and optimize campus resource consumption in real time.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setShowForm(!showForm); setEditingEntry(null); }}
          className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primaryGlow/10 text-primaryGlow border border-primaryGlow/30 hover:bg-primaryGlow/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-all duration-300"
        >
          <span className="text-lg leading-none">{showForm ? '✕' : '+'}</span>
          {showForm ? 'Close Form' : 'Add Entry'}
        </motion.button>
      </motion.div>

      {/* ── KPI Cards ── */}
      <ResourceKPICards entries={filteredEntries} />

      {/* ── Entry Form ── */}
      {showForm && (
        <ResourceEntryForm
          onSubmit={handleAdd}
          editing={editingEntry}
          onCancel={handleCancelEdit}
        />
      )}

      {/* ── Filters ── */}
      <ResourceFilters
        filters={filters}
        onChange={setFilters}
        buildings={buildings}
        departments={departments}
      />

      {/* ── Charts & Health Score ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ResourceAnalyticsCharts entries={filteredEntries} />
        </div>
        <div>
          <ResourceHealthScore entries={filteredEntries} />
        </div>
      </div>

      {/* ── History Table ── */}
      <ResourceHistoryTable
        entries={filteredEntries}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ResourceTracking;
