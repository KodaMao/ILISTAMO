
import React from 'react';
import { Quote, Estimate } from '@/types';
import { computeQuoteMetrics } from '@/lib/calculations';
import { useStore } from '@/store/useStore';

interface QuoteOverviewProps {
  quote: Quote;
  estimate?: Estimate;
}

export const QuoteOverview: React.FC<QuoteOverviewProps> = ({ quote, estimate }) => {
  const { settings } = useStore();
  const currency = settings.currency || 'USD';
  const metrics = computeQuoteMetrics(quote, estimate);
  const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 });
  const profitPct = metrics.subtotal > 0 ? (metrics.totalProfit / metrics.subtotal) * 100 : 0;
  const marginColor = metrics.totalProfit < 0 ? 'text-red-600' : profitPct < 5 ? 'text-amber-600' : 'text-emerald-600';
  const barColor = metrics.totalProfit < 0 ? 'bg-red-500' : profitPct < 5 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="border rounded-xl p-6 mt-10 bg-white shadow-sm">
      <h3 className="font-medium mb-3">Overview</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded border">
          <div className="text-gray-600">Total Amount</div>
          <div className="font-semibold tabular-nums">{fmt.format(metrics.totalAmount)}</div>
        </div>
        <div className="p-2 rounded border">
          <div className="text-gray-600">Discount</div>
          <div className="font-semibold tabular-nums">{fmt.format(metrics.discountAmount)}</div>
        </div>
        <div className="p-2 rounded border">
          <div className="text-gray-600">Subtotal</div>
          <div className="font-semibold tabular-nums">{fmt.format(metrics.subtotal)}</div>
        </div>
        <div className="p-2 rounded border">
          <div className="text-gray-600">Tax</div>
          <div className="font-semibold tabular-nums">{fmt.format(metrics.taxAmount)}</div>
        </div>
        <div className="p-2 rounded border col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">Grand Total</div>
            <div className="font-semibold tabular-nums">{fmt.format(metrics.grandTotal)}</div>
          </div>
        </div>
        <div className="p-2 rounded border">
          <div className="text-gray-600">Cost (from estimate)</div>
          <div className="font-semibold tabular-nums">{fmt.format(metrics.totalCost)}</div>
        </div>
        <div className="p-2 rounded border">
          <div className="text-gray-600">Profit (excl. tax)</div>
          <div className={`font-semibold tabular-nums ${marginColor}`}>{fmt.format(metrics.totalProfit)}</div>
          <div className={`text-xs ${marginColor}`}>{profitPct.toFixed(1)}%</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Margin</span>
          <span className="tabular-nums">{profitPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${Math.max(0, Math.min(100, profitPct))}%` }} />
        </div>
        {metrics.totalProfit < 0 && (
          <div className="mt-2 text-xs text-red-600">Warning: This quote is priced below estimated cost.</div>
        )}
      </div>
    </div>
  );
};
