import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Upload, RotateCcw, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Tangani foto dari kamera / galeri
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Fungsi Utama: Buka Google Lens
  const handleAnalisisSolusi = async () => {
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Jika ada foto dan browser mendukung Share file (bawaan Android Chrome):
    if (photoFile && navigator.share && navigator.canShare && navigator.canShare({ files: [photoFile] })) {
      try {
        await navigator.share({
          title: 'Faathir IT — Analisis Solusi',
          text: 'Buka di Google Lens',
          files: [photoFile],
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancel
      }
    }

    // Buka aplikasi Google Lens langsung di Android via Intent
    if (isAndroid) {
      window.location.href =
        'intent://#Intent;package=com.google.ar.lens;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end';

      // Fallback jika Google Lens app belum terpasang
      setTimeout(() => {
        window.open('https://lens.google.com/', '_blank');
      }, 1500);
    } else {
      // PC / Web fallback
      window.open('https://lens.google.com/', '_blank');
    }
  };

  const handleReset = () => {
    setPhoto(null);
    setPhotoFile(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto select-none">
      
      {/* 1. Header Minimalis */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
            F
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Faathir <span className="text-emerald-400">IT</span> Assistant
            </h1>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              Google Lens Troubleshooting Companion
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" /> PWA Ready
        </span>
      </header>

      {/* 2. Area Utama: Viewfinder / Frame Foto */}
      <main className="flex-1 flex flex-col justify-center my-auto py-2">
        <div className="relative w-full aspect-[4/5] rounded-3xl bg-slate-900/80 border-2 border-dashed border-slate-700/80 overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all">
          
          {/* Efek Sudut Kamera Scanner */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg pointer-events-none"></div>

          {photo ? (
            /* Tampilan Setelah Foto Diambil */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <img
                src={photo}
                alt="Foto Kendala"
                className="w-full h-full object-contain"
              />

              {/* Tombol Ganti / Ulang Foto */}
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulang Foto</span>
              </button>
            </div>
          ) : (
            /* Tampilan Sebelum Foto Diambil (Tombol Jepret) */
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div 
                onClick={() => cameraInputRef.current?.click()}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition shadow-lg shadow-emerald-500/10"
              >
                <Camera className="w-9 h-9 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  Jepret Masalah Hardware
                </h3>
                <p className="text-xs text-slate-400 max-w-[220px] mx-auto mt-1 leading-relaxed">
                  Arahkan kamera ke kabel, lampu switch, printer, atau teks error layar PC
                </p>
              </div>

              {/* Opsi Upload Galeri */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium py-1 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Atau pilih dari galeri HP</span>
              </button>
            </div>
          )}

          {/* Hidden File & Camera Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>
      </main>

      {/* 3. Bottom Action Bar: Tombol ANALISIS SOLUSI */}
      <footer className="pt-4 pb-2 space-y-3">
        {/* Tombol Utama */}
        <button
          onClick={handleAnalisisSolusi}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base tracking-tight shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>Analisis Solusi (Google Lens)</span>
        </button>

        {/* Shortcut Buka Langsung Google Lens Tanpa Foto */}
        <button
          onClick={() => handleAnalisisSolusi()}
          className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-center gap-1 transition"
        >
          <span>Langsung buka kamera Google Lens</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </footer>

    </div>
  );
};
