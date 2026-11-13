import React, { useState } from 'react';
import { 
  X, Sparkles, MapPin, Monitor, Copy, Check, CheckCircle2, 
  Clock, Edit3, Trash2, Calendar, Share2 
} from 'lucide-react';
import { TroubleshootItem, CATEGORIES } from '../types';
import { openWithGoogleLens } from '../utils/image';

interface TroubleshootDetailModalProps {
  item: TroubleshootItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: TroubleshootItem) => void;
  onDelete: (id: string) => void;
}

export const TroubleshootDetailModal: React.FC<TroubleshootDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [lensNotice, setLensNotice] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  const handleCopySolution = () => {
    const text = `*LAPORAN PERBAIKAN IT*\n*Judul:* ${item.title}\n*Kategori:* ${categoryMeta.label}\n*Lokasi:* ${item.location} ${item.deviceCode ? `[${item.deviceCode}]` : ''}\n*Status:* ${item.status === 'resolved' ? 'SELESAI (Solved)' : 'PENDING'}\n\n*LANGKAH PERBAIKAN:*\n${item.solutionSteps || 'Belum ada catatan solusi.'}\n\n_Catatan: Solusi diverifikasi via Google Lens & Faathir IT Assistant_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchLens = async () => {
    const res = await openWithGoogleLens(item.photoProblem);
    setLensNotice(res.message);
    setTimeout(() => setLensNotice(null), 5000);
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus catatan "${item.title}"?`)) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryMeta.bgBadge}`}>
              <span className={categoryMeta.color}>●</span>
              <span>{categoryMeta.label}</span>
            </span>

            {item.status === 'resolved' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terselesaikan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-3.5 h-3.5" /> Pending Part
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {item.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">{item.location}</span>
              </span>
              {item.deviceCode && (
                <span className="flex items-center gap-1 font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.deviceCode}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </span>
            </div>
          </div>

          {/* Photo Preview & Quick Lens Button */}
          {item.photoProblem && (
            <div className="space-y-2">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black max-h-72 flex items-center justify-center">
                <img src={item.photoProblem} alt={item.title} className="max-h-72 w-full object-contain" />
              </div>

              <button
                onClick={handleLaunchLens}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Cari / Analisis Ulang di Google Lens 🔍</span>
              </button>

              {lensNotice && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 text-center animate-fadeIn">
                  {lensNotice}
                </div>
              )}
              <p className="text-[11px] text-slate-400 text-center">
                💡 Di Chrome HP: Bisa juga <strong>tekan & tahan foto</strong> di atas lalu pilih <em>"Telusuri gambar dengan Google Lens"</em>.
              </p>
            </div>
          )}

          {/* Problem Description (if any) */}
          {item.problemDescription && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uraian Gejala Kendala</h4>
              <p className="text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {item.problemDescription}
              </p>
            </div>
          )}

          {/* Solution Steps */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Langkah-Langkah Solusi Perbaikan
              </h4>
              <button
                onClick={handleCopySolution}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Solusi'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {item.solutionSteps || 'Belum ada rincian solusi.'}
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl text-rose-400 hover:bg-rose-950/50 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySolution}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Kirim ke WhatsApp'}</span>
            </button>

            <button
              onClick={() => {
                onEdit(item);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
