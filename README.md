# 🛠️ Faathir IT Assistant — Smart Troubleshooting Log & Lens Companion

Aplikasi Front-End mandiri (*client-side only*) yang dirancang khusus untuk operasional harian IT Pabrik. Berfungsi sebagai **tampilan awal (dashboard)**, **wadah pengelompokan kendala**, dan **pelontar analisis visual ke Google Lens**.

---

## ⚡ Fitur Utama

1. **Mesin Utama Tetap Google Lens 🔍**
   - Mendukung jepret kamera langsung di HP atau upload foto kendala.
   - Tombol **"Cari Solusi via Google Lens"**: Memanfaatkan *Web Share API* Android untuk langsung membuka aplikasi Google Lens bawaan HP dengan foto tersebut.
2. **Pengelompokan Lengkap Khusus Lingkungan Industri 🏷️**
   - **Kategori:** Printer Thermal / Barcode, PC & Laptop Mesin, Jaringan & Switch LAN, Touchscreen / HMI Mesin, Barcode Scanner Handheld, Kelistrikan & UPS, Software / Driver, dll.
   - **Lokasi Pabrik:** Line Produksi 1, 2, 3, Gudang Logistik, Packaging, Laboratorium QC, Ruang Server, dll.
3. **Penyimpanan Lokal Cepat & Aman (IndexedDB) 💾**
   - **Zero Database Server:** Tidak membutuhkan MySQL atau koneksi ke server kantor `10.10.11.127`.
   - **Bisa Dipakai Offline:** Tetap dapat dibuka dan menyimpan data meskipun di area pabrik tanpa sinyal internet.
   - Kompresi gambar otomatis agar performa memori HP tetap enteng.
4. **Cadangkan & Pulihkan (Export/Import JSON) 🛡️**
   - Sekali klik unduh seluruh arsip foto dan catatan solusi ke format `.json`.
   - Dapat dipulihkan (*restore*) ke HP baru kapan saja.
5. **Salin Laporan Cepat untuk WhatsApp / Atasan 📋**
   - Format teks rapi siap dikirim ke grup tim IT kantor.

---

## 🚀 Cara Menjalankan di Komputer Lokal

```bash
# Jalankan mode development
npm run dev

# Build untuk produksi
npm run build
```

---

## ☁️ Cara Deploy ke Vercel (100% Gratis & Otomatis HTTPS)

1. Push folder ini ke repositori **GitHub** pribadimu:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit Faathir IT Assistant"
   git branch -M main
   # Tambahkan remote github kamu dan push
   ```
2. Buka [Vercel.com](https://vercel.com) -> Klik **"Add New Project"** -> Pilih repositori `FaathirITAssistent`.
3. Framework Preset: **Vite**.
4. Klik **Deploy**!
5. Dalam 30 detik web-mu sudah online di `https://faathir-it-assistant.vercel.app`.
6. Di HP Android, buka link Vercel tersebut di Google Chrome, lalu klik menu titik tiga -> **"Add to Home screen"** agar berubah menjadi aplikasi di layar HP kamu!
