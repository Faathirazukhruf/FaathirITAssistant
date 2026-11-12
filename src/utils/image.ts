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
 * 1. Jika di Android HP dan Web Share API mendukung File: buka share sheet (user pilih Google Lens)
 * 2. Fallback: Buka Google Lens Web di tab baru
 */
export async function openWithGoogleLens(photoBase64?: string): Promise<{ success: boolean; message: string }> {
  if (!photoBase64) {
    window.open('https://lens.google.com/', '_blank');
    return { success: true, message: 'Membuka Google Lens Web' };
  }

  try {
    const file = dataUrlToFile(photoBase64, 'troubleshoot-lens.jpg');

    // Cek apakah browser mendukung Web Share API dengan File (umum di Chrome Android)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Cari Solusi via Google Lens',
        text: 'Pilih aplikasi Google Lens untuk mendeteksi komponen atau teks error ini.',
        files: [file],
      });
      return { success: true, message: 'Berhasil membuka Google Lens di HP!' };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: true, message: 'Dibatalkan oleh pengguna.' };
    }
    console.warn('Web Share API tidak dapat membagikan file langsung:', err);
  }

  // Fallback ke tab Google Lens Web
  window.open('https://lens.google.com/', '_blank');
  return { 
    success: true, 
    message: 'Membuka Google Lens Web. Anda juga dapat drag/upload foto ke halaman tersebut.' 
  };
}
