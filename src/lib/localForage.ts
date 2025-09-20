import type { AppData } from '@/types';

const DATA_KEY = 'app_data_v1';

async function getLF() {
  if (typeof window === 'undefined') return null;
  const lf = (await import('localforage')).default;
  lf.config({ name: 'IListaMo', storeName: 'ilistamo_store' });
  return lf;
}

export async function loadData(): Promise<AppData | null> {
  const lf = await getLF();
  if (!lf) return null;
  return (await lf.getItem<AppData>(DATA_KEY)) || null;
}

export async function saveData(data: AppData): Promise<void> {
  const lf = await getLF();
  if (!lf) return;
  await lf.setItem(DATA_KEY, data);
}

export async function clearAll(): Promise<void> {
  const lf = await getLF();
  if (!lf) return;
  await lf.clear();
}

export function downloadBlob(filename: string, data: Blob | string) {
  const blob = typeof data === 'string' ? new Blob([data], { type: 'application/json' }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
