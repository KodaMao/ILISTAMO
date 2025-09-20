import type { Client, Estimate, Project, Quote } from '@/types';
import { computeQuoteMetrics } from '@/lib/calculations';

export function ModernTemplate({ primitives, quote, estimate, client }: { primitives: any; quote: Quote; estimate: Estimate; project: Project; client: Client }) {
  const { Text, View, StyleSheet } = primitives;
  const styles = StyleSheet.create({
    header: { backgroundColor: '#fafafa', padding: 12, borderColor: '#e5e5e5', borderBottomWidth: 1 },
    company: { fontSize: 14 },
    title: { textAlign: 'center', color: '#bfbfbf', fontSize: 18, marginTop: 12, marginBottom: 12 },
    row: { flexDirection: 'row', marginBottom: 12 },
    table: { borderColor: '#e5e5e5', borderWidth: 1 },
    tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e5e5e5' },
    th: { backgroundColor: '#f8f8f8' },
    tdCell: { padding: 6 },
    tdText: { fontSize: 10 },
  totalRow: { width: 240, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2 },
  });
  const metrics = computeQuoteMetrics(quote, estimate);
  const fmt = (n: number) => n.toFixed(2);
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.company}>{quote.companyInfo.name}</Text>
      </View>
      <Text style={styles.title}>QUOTATION</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text>To: {client.name}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text>Quote #: {quote.quoteNumber}</Text>
          <Text>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Items table */}
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <View style={[styles.tdCell, { flex: 3 }]}><Text style={styles.tdText}>Description</Text></View>
          <View style={[styles.tdCell, { flex: 1 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Qty</Text></View>
          <View style={[styles.tdCell, { flex: 1 }]}><Text style={styles.tdText}>Unit</Text></View>
          <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Unit Price</Text></View>
          <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Line Total</Text></View>
        </View>
        {quote.items.map((it) => (
          <View key={it.id} style={styles.tr}>
            <View style={[styles.tdCell, { flex: 3 }]}><Text style={styles.tdText}>{it.description || '—'}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{it.quantity}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={styles.tdText}>{it.unit}</Text></View>
            <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.unitPrice)}</Text></View>
            <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.quantity * it.unitPrice)}</Text></View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
        <View style={styles.totalRow}><Text>Subtotal</Text><Text>{fmt(metrics.subtotal)}</Text></View>
        <View style={styles.totalRow}><Text>Tax ({quote.taxRate}%)</Text><Text>{fmt(metrics.taxAmount)}</Text></View>
        <View style={styles.totalRow}>
          <Text style={{ fontWeight: 'bold' }}>Grand Total</Text>
          <Text style={{ fontWeight: 'bold' }}>{fmt(metrics.grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}
 
