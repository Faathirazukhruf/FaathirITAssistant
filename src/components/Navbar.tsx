import React from 'react';
import { Sparkles, Database, Download, Upload, ShieldCheck, Wrench } from 'lucide-react';

interface NavbarProps {
  totalCount: number;
  resolvedCount: number;
  onOpenBackup: () => void;
  onNewTroubleshoot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalCount,
  resolvedCount,
  onOpenBackup,
  onNewTroubleshoot,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-white font-black text-xl tracking-wider">
            F
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                Faathir <span className="text-emerald-400 font-extrabold">IT</span> Assistant
              </h1>
              <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5" /> Lens Companion
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Troubleshooting Log & Solusi Pabrik Pribadi
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Counter Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Selesai: <strong className="text-white font-bold">{resolvedCount}</strong> / {totalCount}</span>
          </div>

          {/* Backup Button */}
          <button
            onClick={onOpenBackup}
            title="Cadangkan / Pulihkan Data"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition active:scale-95"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Backup</span>
          </button>

          {/* Primary Quick Button */}
          <button
            onClick={onNewTroubleshoot}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 text-xs sm:text-sm font-bold tracking-tight transition active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>+ Catat Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
