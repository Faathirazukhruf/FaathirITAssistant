import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, Search, Filter, Sparkles, Plus, Layers, MapPin, 
  Wrench, CheckCircle2, Clock, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { TroubleshootItem, CategoryType, CATEGORIES, COMMON_LOCATIONS } from './types';
import { dbService } from './services/db';
import { openWithGoogleLens } from './utils/image';
import { Navbar } from './components/Navbar';
import { TroubleshootCard } from './components/TroubleshootCard';
import { TroubleshootFormModal } from './components/TroubleshootFormModal';
import { TroubleshootDetailModal } from './components/TroubleshootDetailModal';
import { BackupModal } from './components/BackupModal';

export const App: React.FC = () => {
  const [items, setItems] = useState<TroubleshootItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TroubleshootItem | null>(null);
  const [detailItem, setDetailItem] = useState<TroubleshootItem | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Load items from IndexedDB
  const loadData = async () => {
    try {
      setLoading(true);
      await dbService.seedSampleDataIfEmpty();
      const all = await dbService.getAll();
      setItems(all);
    } catch (err) {
      console.error('Gagal memuat database IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search by title, problem, solution, device code, or tags
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.problemDescription?.toLowerCase().includes(q);
        const matchSol = item.solutionSteps?.toLowerCase().includes(q);
        const matchDev = item.deviceCode?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));

        if (!matchTitle && !matchDesc && !matchSol && !matchDev && !matchLoc && !matchTag) {
          return false;
        }
      }

      // Filter by category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Filter by location
      if (selectedLocation !== 'all' && item.location !== selectedLocation) {
        return false;
      }

      // Filter by status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedLocation, selectedStatus]);

  // Statistics
  const resolvedCount = items.filter((i) => i.status === 'resolved').length;
  const pendingCount = items.length - resolvedCount;

  // Handlers
  const handleSaveItem = async (item: TroubleshootItem) => {
    if (editingItem) {
      await dbService.update(item);
    } else {
      await dbService.add(item);
    }
    await loadData();
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    await dbService.delete(id);
    await loadData();
    if (detailItem?.id === id) setDetailItem(null);
  };

  const handleEditItem = (item: TroubleshootItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenLensDirect = () => {
    openWithGoogleLens();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        totalCount={items.length}
        resolvedCount={resolvedCount}
        onOpenBackup={() => setIsBackupOpen(true)}
        onNewTroubleshoot={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-5 sm:px-6 w-full flex-1 space-y-6">
        
        {/* HERO BANNER & QUICK ACTION LAUNCHER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 sm:p-7 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Portal Solusi Mandiri IT Pabrik
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Jepret Masalah, Analisis di Lens, Simpan Jurus Solusinya.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Aplikasi pencatat pribadi untuk mengelompokkan masalah mesin, printer, dan komputer pabrik. Didukung mesin pencari Google Lens & tersimpan aman di HP-mu.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsFormOpen(true);
                }}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>+ Catat Kendala Baru</span>
              </button>

              <button
                onClick={handleOpenLensDirect}
                className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Buka Google Lens</span>
              </button>
            </div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="space-y-3">
          {/* Search Input Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari solusi perbaikan... (cth: zebra, kalibrasi, switch, touchscreen, rto)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Lokasi Dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:border-emerald-500 outline-none"
              >
                <option value="all">📍 Semua Lokasi</option>
                {COMMON_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:border-emerald-500 outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="resolved">✅ Hanya Solved</option>
                <option value="pending_part">⏳ Hanya Pending</option>
              </select>
            </div>
          </div>

          {/* Category Pills (Horizontal Scrollable on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 border ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              Semua Kategori ({items.length})
            </button>

            {CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 border flex items-center gap-1.5 ${
                    isSelected
                      ? `${cat.bgBadge} border-emerald-500 text-white font-bold shadow-sm`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={cat.color}>•</span>
                  <span>{cat.label.split('/')[0]}</span>
                  {count > 0 && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* LIST / GRID SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Daftar Kasus & Solusi</span>
              <span className="text-xs font-mono text-emerald-400">({filteredItems.length})</span>
            </h3>

            {filteredItems.length !== items.length && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedStatus('all');
                }}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              Memuat database lokal HP...
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <TroubleshootCard
                  key={item.id}
                  item={item}
                  onViewDetail={(i) => setDetailItem(i)}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/50 border border-slate-800/80 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Wrench className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-200">Tidak ada kasus yang cocok</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau bersihkan filter untuk melihat semua data.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Tampilkan Semua Catatan
              </button>
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Faathir IT Assistant • Solusi Troubleshoot & Google Lens Companion</span>
          <span className="text-[11px] text-slate-600">Disimpan aman di IndexedDB Browser • 100% Client-Side</span>
        </div>
      </footer>

      {/* MODALS */}
      <TroubleshootFormModal
        isOpen={isFormOpen}
        initialItem={editingItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
      />

      <TroubleshootDetailModal
        isOpen={!!detailItem}
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      <BackupModal
        isOpen={isBackupOpen}
        totalRecords={items.length}
        onClose={() => setIsBackupOpen(false)}
        onDataChanged={loadData}
      />
    </div>
  );
};
