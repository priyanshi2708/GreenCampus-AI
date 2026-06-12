import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Zap, Droplets, Wind } from 'lucide-react';
import type { ResourceEntry, SortKey, SortDir } from './types';
import { fmt } from './utils';

interface Props {
  entries: ResourceEntry[];
  onEdit: (e: ResourceEntry) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (column !== sortKey) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-primaryGlow" />
    : <ChevronDown className="w-3 h-3 text-primaryGlow" />;
}

const COLUMNS: { key: SortKey; label: string; align?: string }[] = [
  { key: 'building',    label: 'Building' },
  { key: 'department',  label: 'Department' },
  { key: 'electricity', label: 'Electricity (kWh)', align: 'right' },
  { key: 'water',       label: 'Water (L)', align: 'right' },
  { key: 'waste',       label: 'Waste (kg)', align: 'right' },
  { key: 'carbon',      label: 'Carbon (kg CO₂e)', align: 'right' },
  { key: 'date',        label: 'Date', align: 'center' },
];

const ResourceHistoryTable = ({ entries, onEdit, onDelete }: Props) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.building.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.date.includes(q),
    );
  }, [entries, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) { onDelete(id); setConfirmDelete(null); }
    else setConfirmDelete(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/[0.06]">
        <div>
          <h3 className="text-white font-semibold">Resource History</h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search building, dept…"
              className="w-full bg-[#050816] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primaryGlow/40 transition-all"
            />
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="bg-[#050816] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-5 py-3.5 text-xs font-semibold text-gray-400 cursor-pointer hover:text-white transition-colors select-none ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-500 text-sm">
                    No records match your filters.
                  </td>
                </tr>
              ) : (
                paged.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors group"
                  >
                    <td className="px-5 py-3.5 text-sm text-white font-medium whitespace-nowrap">
                      {entry.building}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 whitespace-nowrap">
                      {entry.department}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-primaryGlow font-mono font-semibold">
                        <Zap className="w-3 h-3" />
                        {fmt(entry.electricity)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-accentBlue font-mono font-semibold">
                        <Droplets className="w-3 h-3" />
                        {fmt(entry.water)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-accentPurple font-mono font-semibold">
                        {fmt(entry.waste)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-secondaryGlow font-mono font-semibold">
                        <Wind className="w-3 h-3" />
                        {fmt(entry.carbon)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-300 text-xs font-mono">
                        {entry.date}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primaryGlow hover:bg-primaryGlow/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            confirmDelete === entry.id
                              ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40'
                              : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title={confirmDelete === entry.id ? 'Click again to confirm' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
        <p className="text-xs text-gray-500">
          Showing {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '…')[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === '…' ? (
                <span key={`ellipsis-${idx}`} className="text-gray-500 text-xs px-1">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    page === p
                      ? 'bg-primaryGlow/15 text-primaryGlow border border-primaryGlow/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {p}
                </button>
              ),
            )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceHistoryTable;
