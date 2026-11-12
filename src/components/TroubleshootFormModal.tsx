import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, Upload, ExternalLink, Sparkles, CheckCircle2, 
  AlertCircle, Tag, MapPin, Monitor, Layers, Trash2, ArrowRight
} from 'lucide-react';
import { TroubleshootItem, CategoryType, StatusType, CATEGORIES, COMMON_LOCATIONS } from '../types';
import { compressImage, openWithGoogleLens } from '../utils/image';

interface TroubleshootFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: TroubleshootItem) => Promise<void>;
  initialItem?: TroubleshootItem | null;
}

export const TroubleshootFormModal: React.FC<TroubleshootFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('printer');
  const [location, setLocation] = useState(COMMON_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [deviceCode, setDeviceCode] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [solutionSteps, setSolutionSteps] = useState('');
  const [status, setStatus] = useState<StatusType>('resolved');
  const [tagsInput, setTagsInput] = useState('');
  const [photoProblem, setPhotoProblem] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lensNotice, setLensNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setCategory(initialItem.category);
      if (COMMON_LOCATIONS.includes(initialItem.location)) {
        setLocation(initialItem.location);
        setCustomLocation('');
      } else {
        setLocation('custom');
        setCustomLocation(initialItem.location);
      }
      setDeviceCode(initialItem.deviceCode || '');
      setProblemDescription(initialItem.problemDescription || '');
      setSolutionSteps(initialItem.solutionSteps || '');
      setStatus(initialItem.status || 'resolved');
      setTagsInput(initialItem.tags ? initialItem.tags.join(', ') : '');
      setPhotoProblem(initialItem.photoProblem);
    } else {
      resetForm();
    }
  }, [initialItem, isOpen]);

  const resetForm = () => {
    setTitle('');
    setCategory('printer');
    setLocation(COMMON_LOCATIONS[0]);
    setCustomLocation('');
    setDeviceCode('');
    setProblemDescription('');
    setSolutionSteps('');
    setStatus('resolved');
    setTagsInput('');
    setPhotoProblem(undefined);
    setLensNotice(null);
  };

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setPhotoProblem(compressed);
    } catch (err) {
      alert('Gagal memproses gambar. Coba file lain.');
    }
  };

  const handleTriggerGoogleLens = async () => {
    const res = await openWithGoogleLens(photoProblem);
    setLensNotice(res.message);
    setTimeout(() => setLensNotice(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi Judul Kendala');
      return;
    }

    const finalLocation = location === 'custom' ? (customLocation.trim() || 'Pabrik') : location;
    const finalTags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const now = new Date().toISOString();

    const item: TroubleshootItem = {
      id: initialItem ? initialItem.id : 'trb-' + Date.now(),
      title: title.trim(),
      category,
      location: finalLocation,
      deviceCode: deviceCode.trim() || undefined,
      problemDescription: problemDescription.trim(),
      solutionSteps: solutionSteps.trim(),
      status,
      photoProblem,
      tags: finalTags,
      createdAt: initialItem ? initialItem.createdAt : now,
      updatedAt: now,
      isFavorite: initialItem ? initialItem.isFavorite : false,
    };

    setIsSubmitting(true);
    try {
      await onSave(item);
      onClose();
    } catch (err) {
      alert('Gagal menyimpan data ke IndexedDB.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {initialItem ? 'Edit Kasus Troubleshooting' : 'Catat Kasus & Buka Google Lens'}
              </h2>
              <p className="text-xs text-slate-400">
                Penyimpanan lokal di HP • Mesin analisis via Google Lens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* SECTION: FOTO & PELONTAR GOOGLE LENS */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> 1. Foto Komponen / Teks Error
              </label>
              {photoProblem && (
                <button
                  type="button"
                  onClick={() => setPhotoProblem(undefined)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                </button>
              )}
            </div>

            {photoProblem ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video max-h-56 flex items-center justify-center">
                  <img src={photoProblem} alt="Foto Kendala" className="max-h-full max-w-full object-contain" />
                </div>

                {/* TOMBOL UTAMA: LONTARKAN KE GOOGLE LENS */}
                <button
                  type="button"
                  onClick={handleTriggerGoogleLens}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Cari Solusi via Google Lens Sekarang 🔍</span>
                </button>

                {lensNotice && (
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 text-center animate-fadeIn">
                    {lensNotice}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Tombol Kamera Langsung */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 transition"
                >
                  <Camera className="w-7 h-7" />
                  <span className="text-xs font-bold text-center">Jepret Kamera HP</span>
                  <span className="text-[10px] text-slate-400">Langsung foto alat</span>
                </button>

                {/* Tombol Upload File Galeri */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition"
                >
                  <Upload className="w-7 h-7 text-slate-400" />
                  <span className="text-xs font-bold text-center">Pilih dari Galeri</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WebP</span>
                </button>

                {/* Hidden Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}
          </div>

          {/* SECTION: IDENTITAS KASUS */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Judul Kendala / Gejala Error <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Printer Barcode Zebra ZD230 Lampu Merah Kedap-Kedip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 transition outline-none"
              />
            </div>

            {/* Kategori Pengelompokan */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" /> 2. Pengelompokan Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition text-left ${
                        isSelected
                          ? `${cat.bgBadge} border-emerald-500 shadow-sm`
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className={cat.color}>•</span>
                      <span className="truncate">{cat.label.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lokasi & Kode Perangkat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi / Area Pabrik
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                >
                  {COMMON_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="custom">+ Tulis Lokasi Lain...</option>
                </select>

                {location === 'custom' && (
                  <input
                    type="text"
                    placeholder="Ketik lokasi spesifik..."
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" /> Kode Unit / Hostname (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PC-LINE1-04 / PRT-GUDANG"
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Catatan Solusi dari Google Lens */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-4 h-4" /> 3. Catatan Solusi / Langkah Perbaikan
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Hasil dari Google Lens</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan langkah-langkah perbaikan yang ditemukan di Google Lens...&#10;1. Cabut kabel sensor&#10;2. Bersihkan pin dengan contact cleaner&#10;3. Pasang kembali dan kalibrasi..."
                value={solutionSteps}
                onChange={(e) => setSolutionSteps(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 outline-none font-mono"
              />
            </div>

            {/* Status & Keywords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Status Penyelesaian</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                >
                  <option value="resolved">✅ Terselesaikan (Solved)</option>
                  <option value="pending_part">⏳ Menunggu Sparepart</option>
                  <option value="in_progress">🔧 Sedang Dikerjakan</option>
                  <option value="observation">👀 Masa Observasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Kata Kunci Pencarian (Tags)
                </label>
                <input
                  type="text"
                  placeholder="zebra, sensor, kedip, reset"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm tracking-tight transition active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan ke Database HP</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
