import React, { useState } from 'react';
import { X, Download, Upload, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { dbService } from '../services/db';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  totalRecords: number;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  totalRecords,
}) => {
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      const json = await dbService.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `faathir_it_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: `Berhasil mengunduh backup (${totalRecords} kasus troubleshooting tersimpan)!`,
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: 'Gagal mengekspor data: ' + err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const count = await dbService.importBackup(content);
        setStatusMsg({
          type: 'success',
          text: `Alhamdulillah! Berhasil memulihkan ${count} catatan perbaikan ke HP ini.`,
        });
        onDataChanged();
      } catch (err: any) {
        setStatusMsg({
          type: 'error',
          text: 'Gagal memulihkan file: ' + err.message,
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setStatusMsg({ type: 'error', text: 'Gagal membaca file.' });
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cadangkan & Pulihkan</h3>
              <p className="text-xs text-slate-400">Keamanan data troubleshooting pribadimu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <span>Database Lokal Browser:</span>
              <span className="text-emerald-400">{totalRecords} Catatan Kasus</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Semua foto dan catatan disimpan aman di memori HP. Unduh file cadangan secara berkala agar datamu tidak hilang saat ganti HP atau bersihkan riwayat browser.
            </p>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="space-y-3 pt-1">
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh File Cadangan (Export JSON)</span>
            </button>

            {/* Import Button */}
            <label className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-700 text-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Pulihkan dari File Cadangan (Import)</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
                disabled={isProcessing}
              />
            </label>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy • Tidak ada data yang dikirim ke server luar</span>
          </div>
        </div>

      </div>
    </div>
  );
};
