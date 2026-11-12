import { TroubleshootItem } from '../types';

const DB_NAME = 'FaathirIT_Assistant_DB';
const DB_VERSION = 1;
const STORE_NAME = 'troubleshoots';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('location', 'location', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const dbService = {
  async getAll(): Promise<TroubleshootItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Urutkan dari yang terbaru ke terlama
        const items = (request.result as TroubleshootItem[]) || [];
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getById(id: string): Promise<TroubleshootItem | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(item: TroubleshootItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async update(item: TroubleshootItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async delete(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async exportBackup(): Promise<string> {
    const all = await this.getAll();
    const payload = {
      app: 'FaathirITAssistent',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalRecords: all.length,
      data: all,
    };
    return JSON.stringify(payload, null, 2);
  },

  async importBackup(jsonString: string): Promise<number> {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.data)) {
      throw new Error('Format file backup tidak valid.');
    }

    const items: TroubleshootItem[] = parsed.data;
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      let importedCount = 0;
      items.forEach((item) => {
        store.put(item);
        importedCount++;
      });

      tx.oncomplete = () => resolve(importedCount);
      tx.onerror = () => reject(tx.error);
    });
  },

  async seedSampleDataIfEmpty(): Promise<void> {
    const existing = await this.getAll();
    if (existing.length > 0) return;

    const sampleItems: TroubleshootItem[] = [
      {
        id: 'sample-1',
        title: 'Printer Thermal Zebra ZD230 Lampu Status Merah Berkedip',
        category: 'printer',
        location: 'Line Produksi 1',
        deviceCode: 'PRT-LINE1-01',
        problemDescription: 'Lampu LED indikator di atas berkedip merah cepat setelah ganti gulungan label baru. Kertas label tidak mau keluar saat ditekan tombol feed.',
        solutionSteps: '1. Matikan power printer Zebra.\n2. Buka penutup atas, periksa sensor media (pastikan sejajar dengan celah antar label/gap).\n3. Tahan tombol Feed sambil menyalakan saklar power (tunggu sampai kedip 1x lalu lepas untuk Calibrate Sensor).\n4. Printer otomatis mengeluarkan 3 label kosong dan lampu berubah hijau solid (Ready).',
        status: 'resolved',
        tags: ['zebra', 'zd230', 'merah', 'kalibrasi', 'thermal'],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'sample-2',
        title: 'Monitor Touchscreen HMI Siemens IPC Layar Sentuh Bergeser / Tidak Responsif',
        category: 'hmi',
        location: 'Packaging & Kardus',
        deviceCode: 'HMI-PACK-03',
        problemDescription: 'Sentuhan di tombol START mesin meleset sekitar 2 cm ke kanan bawah akibat terkena cipratan cairan pembersih mesin.',
        solutionSteps: '1. Lap bersih kaca layar dengan kain microfiber kering.\n2. Masuk ke Control Panel Windows Embedded -> Touch Settings.\n3. Jalankan menu 4-Point Touch Calibration Tool.\n4. Sentuh tanda silang (+) di tiap 4 sudut layar dengan stylus atau jari secara presisi.\n5. Simpan kalibrasi (Save & Exit). Layar kembali akurat 100%.',
        status: 'resolved',
        tags: ['hmi', 'touchscreen', 'siemens', 'kalibrasi', 'line-pack'],
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'sample-3',
        title: 'Switch Hub D-Link 24 Port Link LED Mati Sebagian di Area Gudang',
        category: 'network',
        location: 'Gudang Logistik',
        deviceCode: 'SW-GDG-RACK02',
        problemDescription: '3 PC kasir gudang dan 2 barcode scanner network terputus serentak (RTO / Unidentified Network).',
        solutionSteps: '1. Cek adaptor power supply 12V 2A switch hub di dalam rak tertutup (adaptor terasa panas berlebih).\n2. Ganti adaptor dengan unit cadangan 12V 2.5A dari ruang IT.\n3. Pasang konektor RJ45 baru pada kabel port 7 yang pin-nya sedikit korosi.\n4. Semua port LED menyala hijau gigabit, ping ke server gateway 10.10.11.1 langsung 1ms.',
        status: 'resolved',
        tags: ['switch', 'd-link', 'lan', 'adaptor', 'gudang'],
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      }
    ];

    for (const item of sampleItems) {
      await this.add(item);
    }
  }
};
