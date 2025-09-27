import type { Client, Estimate, Quote } from '@/types';
import { ModernTemplate, ClassicTemplate, BoldTemplate } from './templates';

export function PDFDocument({ primitives, templateId, quote, estimate, client }: { primitives: any; templateId: string; quote: Quote; estimate: Estimate; client: Client }) {
  const { Document, Page, StyleSheet } = primitives;
  const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  });
  const Template = templateId === 'modern' ? ModernTemplate : templateId === 'classic' ? ClassicTemplate : BoldTemplate;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
  <Template primitives={primitives} quote={quote} estimate={estimate} client={client} />
      </Page>
    </Document>
  );
}
