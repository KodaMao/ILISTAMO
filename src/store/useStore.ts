'use client';
import { create } from 'zustand';
import type { AppData, Client, Estimate, EstimateItem, Quote, QuoteItem, AppSettings } from '@/types';
import { loadData, saveData } from '@/lib/localForage';

type State = AppData & {
  initialized: boolean;
};

type Actions = {
  init: () => Promise<void>;
  addClient: (c: Omit<Client, 'id'>) => string;
  updateClient: (id: string, partial: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;
  addEstimate: (e: Omit<Estimate, 'id' | 'createdAt'>) => string;
  addQuote: (q: Omit<Quote, 'id' | 'createdAt'>) => string;
  updateEstimate: (id: string, partial: Partial<Estimate>) => void;
  updateEstimateItems: (id: string, items: EstimateItem[]) => void;
  createQuoteFromEstimate: (estimateId: string, name?: string) => string | null;
  updateQuote: (id: string, partial: Partial<Quote>) => void;
  updateQuoteItems: (id: string, items: QuoteItem[]) => void;
  setQuoteStatus: (id: string, status: Quote['status']) => void;
  exportData: () => string;
  importData: (json: string) => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
    clearAll: () => void;
};

const defaultState: AppData = {
  clients: [],
  estimates: [],
  quotes: [],
  settings: {
    defaultTaxRate: 12,
    defaultExpiryDays: 30,
    companyInfo: {
      name: '',
      address: '',
      brandColor: '#2563eb',
      logoBase64: '',
      contact: '',
    },
    preparerName: '',
  },
};

export const useStore = create<State & Actions>((set: (partial: Partial<State>) => void, get: () => State) => ({
  addQuote: (q: Omit<Quote, 'id' | 'createdAt'>) => {
    if (!q.estimateId) throw new Error('estimateId is required for Quote');
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const quote: Quote = { id, createdAt: Date.now(), ...q };
    const quotes = [...get().quotes, quote];
    set({ quotes });
  saveData({ clients: get().clients, estimates: get().estimates, quotes, settings: get().settings });
    return id;
  },
  updateSettings: (partial: Partial<AppSettings>) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
  saveData({ clients: get().clients, estimates: get().estimates, quotes: get().quotes, settings });
  },
  ...defaultState,
  initialized: false,

  // Helper to extract only serializable app data for persistence
  // Avoid saving actions/functions which cause DataCloneError in IndexedDB
  
    clearAll: () => {
      set({ ...defaultState });
      saveData(defaultState);
    },

  init: async () => {
    const data = await loadData();
    if (data) {
      set({ ...data, initialized: true });
    } else {
      set({ ...defaultState, initialized: true });
      await saveData(defaultState);
    }
  },

  addClient: (c: Omit<Client, 'id'>) => {
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const clients = [...get().clients, { id, ...c }];
    set({ clients });
  saveData({ clients, estimates: get().estimates, quotes: get().quotes, settings: get().settings });
    return id;
  },
  updateClient: (id: string, partial: Partial<Client>) => {
    const clients = get().clients.map((x: Client) => (x.id === id ? { ...x, ...partial } : x));
    set({ clients });
  saveData({ clients, estimates: get().estimates, quotes: get().quotes, settings: get().settings });
  },
  deleteClient: (id: string) => {
    const clients = get().clients.filter((x: Client) => x.id !== id);
    set({ clients });
  saveData({ clients, estimates: get().estimates, quotes: get().quotes, settings: get().settings });
    return true;
  },
  addEstimate: (e: Omit<Estimate, 'id' | 'createdAt'>) => {
    if (!e.clientId) throw new Error('clientId is required for Estimate');
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const estimate: Estimate = { id, createdAt: Date.now(), ...e };
    const estimates = [...get().estimates, estimate];
    set({ estimates });
  saveData({ clients: get().clients, estimates, quotes: get().quotes, settings: get().settings });
    return id;
  },
  updateEstimate: (id: string, partial: Partial<Estimate>) => {
    const estimates = get().estimates.map((est: Estimate) => (est.id === id ? { ...est, ...partial } : est));
    set({ estimates });
  saveData({ clients: get().clients, estimates, quotes: get().quotes, settings: get().settings });
  },
  updateEstimateItems: (id: string, items: EstimateItem[]) => {
    const estimates = get().estimates.map((est: Estimate) => (est.id === id ? { ...est, items } : est));
    set({ estimates });
  saveData({ clients: get().clients, estimates, quotes: get().quotes, settings: get().settings });
  },

  createQuoteFromEstimate: (estimateId: string, name?: string) => {
    const estimate = get().estimates.find((e: Estimate) => e.id === estimateId);
    if (!estimate) return null;
    const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    const items: QuoteItem[] = estimate.items.map((it: EstimateItem) => ({
      id: it.id,
      description: it.description,
      category: it.category,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.costPerUnit, // start at cost; user can mark up
    }));
    const quote: Quote = {
      id,
      estimateId,
      createdAt: Date.now(),
      name: name || `Quote for ${estimate.name}`,
      status: 'draft',
      items,
      taxRate: get().settings.defaultTaxRate,
      discount: 0,
      discountType: 'amount',
      notes: '',
      terms: '',
      markupPercent: 0,
      companyInfo: { name: 'Your Company', address: 'Address', brandColor: '#2563eb' },
      quoteNumber: `Q-${new Date().getFullYear()}-${(get().quotes.length + 1).toString().padStart(3, '0')}`,
      expiryDays: get().settings.defaultExpiryDays,
    };
    const quotes = [...get().quotes, quote];
    set({ quotes });
  saveData({ clients: get().clients, estimates: get().estimates, quotes, settings: get().settings });
    return id;
  },
  updateQuote: (id: string, partial: Partial<Quote>) => {
    const quotes = get().quotes.map((q: Quote) => (q.id === id ? { ...q, ...partial } : q));
    set({ quotes });
  saveData({ clients: get().clients, estimates: get().estimates, quotes, settings: get().settings });
  },
  updateQuoteItems: (id: string, items: QuoteItem[]) => {
    const quotes = get().quotes.map((q: Quote) => (q.id === id ? { ...q, items } : q));
    set({ quotes });
  saveData({ clients: get().clients, estimates: get().estimates, quotes, settings: get().settings });
  },
  setQuoteStatus: (id: string, status: Quote['status']) => {
    const quotes = get().quotes.map((q: Quote) => (q.id === id ? { ...q, status } : q));
    set({ quotes });
  saveData({ clients: get().clients, estimates: get().estimates, quotes, settings: get().settings });
  },
  exportData: () => {
    const data: AppData = {
      clients: get().clients,
  // projects removed
      estimates: get().estimates,
      quotes: get().quotes,
      settings: get().settings,
    };
    return JSON.stringify(data, null, 2);
  },
  importData: async (json: string) => {
    const parsed = JSON.parse(json) as AppData;
    set({ ...parsed });
    await saveData(parsed);
  },
}));
