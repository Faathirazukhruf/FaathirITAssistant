import React, { useState } from 'react';
import { 
  MapPin, Monitor, CheckCircle2, Clock, Sparkles, Copy, 
  Check, Trash2, Edit3, Image as ImageIcon, ExternalLink, Tag
} from 'lucide-react';
import { TroubleshootItem, CATEGORIES } from '../types';
import { openWithGoogleLens } from '../utils/image';

interface TroubleshootCardProps {
  item: TroubleshootItem;
  onViewDetail: (item: TroubleshootItem) => void;
  onEdit: (item: TroubleshootItem) => void;
  onDelete: (id: string) => void;
}

export const TroubleshootCard: React.FC<TroubleshootCardProps> = ({
  item,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const categoryMeta = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];

  const handleCopySolution = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `*KENDALA IT: ${item.title}*\n📍 Lokasi: ${item.location} ${item.deviceCode ? `(${item.deviceCode})` : ''}\n\n*LANGKAH SOLUSI:*\n${item.solutionSteps || 'Belum ada catatan solusi.'}\n\n_— Dicatat via Faathir IT Assistant_`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchLens = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWithGoogleLens(item.photoProblem);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Hapus catatan "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div 
      onClick={() => onViewDetail(item)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top bar: Category badge + Status badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryMeta.bgBadge}`}>
            <span className={categoryMeta.color}>●</span>
            <span>{categoryMeta.label.split('/')[0]}</span>
          </span>

          {item.status === 'resolved' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Solved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3 h-3" /> Pending
            </span>
          )}
        </div>

        {/* Thumbnail Photo & Title */}
        <div className="flex gap-3 items-start mb-3">
          {item.photoProblem ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 flex-shrink-0 group-hover:border-emerald-500/40 transition">
              <img src={item.photoProblem} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center flex-shrink-0 text-slate-600">
              <ImageIcon className="w-7 h-7" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition line-clamp-2 leading-snug">
              {item.title}
            </h3>

            {/* Location & Device Info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="truncate max-w-[120px]">{item.location}</span>
              </span>
              {item.deviceCode && (
                <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800">
                  <Monitor className="w-3 h-3 text-slate-500" />
                  <span>{item.deviceCode}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Solution Preview Snippet */}
        {item.solutionSteps && (
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 font-mono line-clamp-2 leading-relaxed mb-3">
            <span className="text-emerald-400 font-semibold font-sans mr-1">Solusi:</span>
            {item.solutionSteps}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px]">{formattedDate}</span>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Quick Lens button */}
          <button
            onClick={handleLaunchLens}
            title="Buka foto ini di Google Lens"
            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Copy solution */}
          <button
            onClick={handleCopySolution}
            title="Salin Solusi untuk WhatsApp / Laporan"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            title="Edit Kasus"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            title="Hapus Kasus"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
