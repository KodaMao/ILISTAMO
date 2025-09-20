import type { Estimate, ProfitMetrics, Quote } from '@/types';

export function computeEstimateCost(estimate: Estimate): number {
  return estimate.items.reduce((sum, it) => sum + it.quantity * it.costPerUnit, 0);
}

function effectiveUnitPrice(unitPrice: number, markupPercent?: number) {
  return unitPrice * (1 + (markupPercent || 0) / 100);
}

export function computeQuoteMetrics(quote: Quote, sourceEstimate?: Estimate): ProfitMetrics {
  const totalCost = sourceEstimate ? computeEstimateCost(sourceEstimate) : 0;
  // compute amount using marked-up unit prices if markupPercent present
  const totalAmount = quote.items.reduce((sum, it) => sum + it.quantity * effectiveUnitPrice(it.unitPrice, quote.markupPercent), 0);
  const discountAmount = quote.discountType === 'amount' ? quote.discount : (totalAmount * quote.discount) / 100;
  const subtotal = Math.max(totalAmount - discountAmount, 0);
  const taxAmount = (subtotal * (quote.taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount;
  // Profit should exclude tax: profit = (subtotal) - cost
  const totalProfit = subtotal - totalCost;
  const profitMargin = subtotal > 0 ? (totalProfit / subtotal) * 100 : 0;
  return { totalCost, totalAmount, discountAmount, subtotal, taxAmount, grandTotal, totalProfit, profitMargin };
}
