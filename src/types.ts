export interface Client {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  address?: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

export interface Estimate {
  id: string;
  projectId: string;
  createdAt: number;
  name: string;
  items: EstimateItem[];
}

export interface QuoteItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  logoBase64?: string;
  brandColor: string;
  contact?: string;
}

export interface Quote {
  id: string;
  estimateId: string;
  createdAt: number;
  name: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  items: QuoteItem[];
  taxRate: number;
  discount: number;
  discountType: 'amount' | 'percentage';
  notes: string;
  terms: string;
  markupPercent?: number; // percentage markup applied on top of base unitPrice when computing totals/preview
  companyInfo: CompanyInfo;
  quoteNumber: string;
  expiryDays: number;
}

export interface AppSettings {
  defaultTaxRate: number;
  defaultExpiryDays: number;
  companyInfo: CompanyInfo;
  preparerName?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface ProfitMetrics {
  totalCost: number;
  totalAmount: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  totalProfit: number;
  profitMargin: number;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  estimates: Estimate[];
  quotes: Quote[];
  settings: AppSettings;
}
