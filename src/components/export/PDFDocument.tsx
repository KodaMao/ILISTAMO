import type { Client, Estimate, Project, Quote } from '@/types';
import { ModernTemplate, ClassicTemplate, BoldTemplate } from './templates';

export function PDFDocument({ primitives, templateId, quote, estimate, project, client }: { primitives: any; templateId: string; quote: Quote; estimate: Estimate; project: Project; client: Client }) {
  const { Document, Page, StyleSheet } = primitives;
  const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  });
  const Template = templateId === 'modern' ? ModernTemplate : templateId === 'classic' ? ClassicTemplate : BoldTemplate;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Template primitives={primitives} quote={quote} estimate={estimate} project={project} client={client} />
      </Page>
    </Document>
  );
}
