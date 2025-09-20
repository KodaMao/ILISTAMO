import type { Client, Estimate, Project, Quote } from '@/types';
import { computeQuoteMetrics } from '@/lib/calculations';

export function BoldTemplate({ primitives, quote, estimate, client }: { primitives: any; quote: Quote; estimate: Estimate; project: Project; client: Client }) {
  const { Text, View, StyleSheet } = primitives;
  const styles = StyleSheet.create({
    brandBlock: { height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    brandTitle: { color: '#fff', fontSize: 16 },
    clientName: { fontSize: 14, marginBottom: 6 },
    subtle: { color: '#bfbfbf', fontSize: 10 },
    itemRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingTop: 4, paddingBottom: 4 },
    tdCell: { },
    tdText: { fontSize: 10 },
  totalRow: { width: 260, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2 },
  });
  const m = computeQuoteMetrics(quote, estimate);
  const fmt = (n: number) => n.toFixed(2);
  return (
    <View>
      <View style={[styles.brandBlock, { backgroundColor: quote.companyInfo.brandColor || '#111' }]}>
        <Text style={styles.brandTitle}>{quote.companyInfo.name}</Text>
      </View>
      <Text style={[styles.clientName, { color: quote.companyInfo.brandColor || '#111' }]}>{client.name}</Text>
      <Text style={styles.subtle}>PROPOSAL</Text>

      {/* Items */}
      <View style={{ marginTop: 12 }}>
        {quote.items.map((it) => (
          <View key={it.id} style={styles.itemRow}>
            <View style={[styles.tdCell, { flex: 3 }]}><Text style={styles.tdText}>{it.description || '—'}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{it.quantity}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={styles.tdText}>{it.unit}</Text></View>
            <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.unitPrice)}</Text></View>
            <View style={[styles.tdCell, { flex: 1.5 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.quantity * it.unitPrice)}</Text></View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
        <View style={styles.totalRow}><Text>Subtotal</Text><Text>{fmt(m.subtotal)}</Text></View>
        <View style={styles.totalRow}><Text>Tax ({quote.taxRate}%)</Text><Text>{fmt(m.taxAmount)}</Text></View>
        <View style={styles.totalRow}>
          <Text style={{ fontWeight: 'bold' }}>Grand Total</Text>
          <Text style={{ fontWeight: 'bold', color: quote.companyInfo.brandColor || '#111' }}>{fmt(m.grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}
 
