export type CategoryType = 
  | 'printer' 
  | 'pc' 
  | 'network' 
  | 'hmi' 
  | 'scanner' 
  | 'power' 
  | 'software' 
  | 'other';

export type StatusType = 'resolved' | 'pending_part' | 'in_progress' | 'observation';

export interface TroubleshootItem {
  id: string;
  title: string;
  category: CategoryType;
  location: string;
  deviceCode?: string;
  problemDescription: string;
  solutionSteps: string;
  status: StatusType;
  photoProblem?: string; // Base64 data URL
  photoSolution?: string; // Optional after photo
  lensUrl?: string; // Optional Google Lens search URL / reference
  tags: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  isFavorite?: boolean;
}

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  icon: string;
  color: string;
  bgBadge: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'printer', label: 'Printer Barcode / Thermal', icon: 'Printer', color: 'text-amber-400', bgBadge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  { id: 'pc', label: 'PC & Laptop Mesin', icon: 'Monitor', color: 'text-blue-400', bgBadge: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  { id: 'network', label: 'Jaringan & Switch LAN', icon: 'Wifi', color: 'text-emerald-400', bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  { id: 'hmi', label: 'Touchscreen / HMI Mesin', icon: 'TabletSmartphone', color: 'text-purple-400', bgBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  { id: 'scanner', label: 'Barcode Scanner Handheld', icon: 'QrCode', color: 'text-cyan-400', bgBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  { id: 'power', label: 'Kelistrikan / UPS / Adaptor', icon: 'Zap', color: 'text-yellow-400', bgBadge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  { id: 'software', label: 'Software / OS / Driver', icon: 'Code2', color: 'text-rose-400', bgBadge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
  { id: 'other', label: 'Kendala Lainnya', icon: 'Wrench', color: 'text-slate-400', bgBadge: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
];

export const COMMON_LOCATIONS = [
  'Line Produksi 1',
  'Line Produksi 2',
  'Line Produksi 3',
  'Gudang Logistik',
  'Packaging & Kardus',
  'Laboratorium QC',
  'Ruang Server IT',
  'Kantor HR / Finance',
  'Maintenance Workshop',
];
