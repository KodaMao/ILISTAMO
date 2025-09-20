import type { Client, Estimate, Project, Quote } from '@/types';
import { computeQuoteMetrics } from '@/lib/calculations';

export function ClassicTemplate({ primitives, quote, estimate, client }: { primitives: any; quote: Quote; estimate: Estimate; project: Project; client: Client }) {
  const { Text, View, StyleSheet } = primitives;
  const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', marginBottom: 8 },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    rule: { height: 2, backgroundColor: '#000', marginTop: 6, marginBottom: 6 },
    table: { borderColor: '#000', borderWidth: 1, marginTop: 6 },
    tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
    thead: { backgroundColor: '#e5e5e5' },
    tdCell: { padding: 6 },
    tdText: { fontSize: 10 },
  totalRow: { width: 260, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2, paddingBottom: 2 },
  });
  const m = computeQuoteMetrics(quote, estimate);
  const fmt = (n: number) => n.toFixed(2);
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text>{quote.companyInfo.name}</Text>
          <Text>{quote.companyInfo.address}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={styles.headerTitle}>QUOTE</Text>
          <Text>Quote #: {quote.quoteNumber}</Text>
          <Text>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
          <Text>Client: {client.name}</Text>
        </View>
      </View>
      <View style={styles.rule} />

      {/* Items table */}
      <View style={styles.table}>
        <View style={[styles.tr, styles.thead]}>
          <View style={[styles.tdCell, { flex: 4 }]}><Text style={styles.tdText}>Description</Text></View>
          <View style={[styles.tdCell, { flex: 1 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Qty</Text></View>
          <View style={[styles.tdCell, { flex: 1 }]}><Text style={styles.tdText}>Unit</Text></View>
          <View style={[styles.tdCell, { flex: 2 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Unit Price</Text></View>
          <View style={[styles.tdCell, { flex: 2 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>Total</Text></View>
        </View>
        {quote.items.map((it) => (
          <View key={it.id} style={styles.tr}>
            <View style={[styles.tdCell, { flex: 4 }]}><Text style={styles.tdText}>{it.description || '—'}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{it.quantity}</Text></View>
            <View style={[styles.tdCell, { flex: 1 }]}><Text style={styles.tdText}>{it.unit}</Text></View>
            <View style={[styles.tdCell, { flex: 2 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.unitPrice)}</Text></View>
            <View style={[styles.tdCell, { flex: 2 }]}><Text style={[styles.tdText, { textAlign: 'right' }]}>{fmt(it.quantity * it.unitPrice)}</Text></View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
        <View style={styles.totalRow}><Text>Subtotal</Text><Text>{fmt(m.subtotal)}</Text></View>
        <View style={styles.totalRow}><Text>Tax ({quote.taxRate}%)</Text><Text>{fmt(m.taxAmount)}</Text></View>
        <View style={styles.totalRow}>
          <Text style={{ fontWeight: 'bold' }}>Grand Total</Text>
          <Text style={{ fontWeight: 'bold' }}>{fmt(m.grandTotal)}</Text>
        </View>
      </View>
    </View>
  );
}
 
