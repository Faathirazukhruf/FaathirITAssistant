/**
 * Kompres gambar agar tidak membebani IndexedDB browser HP.
 * Mengubah resolusi maksimal ke 1200px dan kompresi JPEG 0.8.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
  });
}

/**
 * Konversi dataURL base64 ke objek File
 */
export function dataUrlToFile(dataUrl: string, filename = 'lens-search.jpg'): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Buka foto ke Google Lens:
 * 1. Jika di Android HP & didukung Web Share API dengan File (wajib HTTPS): buka native share sheet
 * 2. Jika di Android HP tapi Web Share gagal / tanpa HTTPS: langsung luncurkan aplikasi Google Lens via Android Intent
 *    (menghindari redirect web lens.google.com ke Play Store)
 * 3. Fallback Desktop: buka Google Lens Web di tab baru
 */
export async function openWithGoogleLens(photoBase64?: string): Promise<{ success: boolean; message: string }> {
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const isSecure = typeof window !== 'undefined' && window.isSecureContext;

  // 1. Jika ada foto dan browser mendukung Web Share API dengan File
  if (photoBase64) {
    try {
      const file = dataUrlToFile(photoBase64, 'troubleshoot-lens.jpg');

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Cari Solusi via Google Lens',
          text: 'Pilih aplikasi Google Lens untuk menganalisis komponen atau teks error ini.',
          files: [file],
        });
        return { 
          success: true, 
          message: 'Pilih "Google Lens" pada menu berbagi yang muncul di HP!' 
        };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: true, message: 'Dibatalkan oleh pengguna.' };
      }
      console.warn('Web Share API tidak dapat membagikan file:', err);
    }
  }

  // 2. Jika di HP Android: Jangan lempar ke https://lens.google.com/ karena Google akan me-redirect ke Play Store.
  // Luncurkan langsung aplikasi Google Lens di HP melalui Android Intent URI.
  if (isAndroid) {
    try {
      // Intent untuk membuka aplikasi Google Lens terpasang di HP Android
      const androidIntentUrl =
        'intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.google.ar.lens;S.browser_fallback_url=https%3A%2F%2Flens.google%2F;end;';
      
      window.location.href = androidIntentUrl;

      return {
        success: true,
        message: photoBase64
          ? 'Membuka aplikasi Google Lens. (Tips: Di Chrome HP, bisa juga tekan & tahan foto lalu pilih "Telusuri dengan Google Lens")'
          : 'Membuka aplikasi Google Lens langsung di HP...'
      };
    } catch (err) {
      console.warn('Gagal meluncurkan intent Android Lens:', err);
    }
  }

  // 3. Fallback untuk Desktop / PC atau browser non-Android
  window.open('https://lens.google.com/', '_blank');
  return { 
    success: true, 
    message: isSecure 
      ? 'Membuka Google Lens Web. Anda dapat upload atau drag foto ke halaman tersebut.' 
      : 'Membuka Google Lens. (Catatan: Untuk fitur kirim foto otomatis di HP, pastikan web diakses lewat HTTPS seperti Vercel).'
  };
}
