import type { Estimate, ProfitMetrics, Quote } from '@/types';

export function computeEstimateCost(estimate: Estimate): number {
  return estimate.items.reduce((sum, it) => sum + it.quantity * it.costPerUnit, 0);
}


function getOriginalUnitPrice(it: any, sourceEstimate?: Estimate): number {
  if (!sourceEstimate) return 0;
  const estItem = sourceEstimate.items.find(ei => ei.id === it.id);
  return estItem ? estItem.costPerUnit : 0;
}

function effectiveUnitPrice(it: any, sourceEstimate?: Estimate) {
  const base = getOriginalUnitPrice(it, sourceEstimate);
  const markupType = it.markupType || 'percentage';
  const markupValue = it.markupValue ?? 0;
  if (markupType === 'percentage') {
    return base * (1 + markupValue / 100);
  } else {
    return base + markupValue;
  }
}

export function computeQuoteMetrics(quote: Quote, sourceEstimate?: Estimate): ProfitMetrics {
  const totalCost = sourceEstimate ? computeEstimateCost(sourceEstimate) : 0;
  // compute amount using per-item markup and original unit price from estimate
  const totalAmount = quote.items.reduce((sum, it) => sum + it.quantity * effectiveUnitPrice(it, sourceEstimate), 0);
  const discountAmount = quote.discountType === 'amount' ? quote.discount : (totalAmount * quote.discount) / 100;
  const subtotal = Math.max(totalAmount - discountAmount, 0);
  const taxAmount = (subtotal * (quote.taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;
  // Profit should exclude tax: profit = (subtotal) - cost
  const totalProfit = subtotal - totalCost;
  const profitMargin = subtotal > 0 ? (totalProfit / subtotal) * 100 : 0;
  return { totalCost, totalAmount, discountAmount, subtotal, taxAmount, grandTotal, totalProfit, profitMargin };
}
