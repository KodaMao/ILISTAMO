'use client';
import type { Client, Estimate, Project, Quote } from '@/types';
import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { computeQuoteMetrics } from '@/lib/calculations';
import { useStore } from '@/store/useStore';

export function GeneratePDF({ templateId, quote, estimate, project, client, onDone }: {
  templateId: string;
  quote: Quote;
  estimate: Estimate;
  project: Project;
  client: Client;
  onDone: (blob: Blob) => void;
}) {
  const { settings } = useStore.getState();
  const companyInfo = settings.companyInfo || quote.companyInfo;
  const preparerName = settings.preparerName || '';
  const started = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (started.current) return;
      started.current = true;
      try {
        // Create PDF
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 40;
        const rightX = pageWidth - margin;

        const m = computeQuoteMetrics(quote, estimate);
        const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const hexToRgb = (hex: string) => {
          const clean = hex.replace('#', '');
          const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
          return [ (num >> 16) & 255, (num >> 8) & 255, num & 255 ] as [number, number, number];
        };
        const brand = hexToRgb(companyInfo.brandColor || '#2563eb');

        // Header per theme
        let startY = margin + 56;
        if (templateId === 'modern') {
          // Light grey band header
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, margin, pageWidth - margin * 2, 36, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(0);
          if (companyInfo.logoBase64) {
            try {
              doc.addImage(companyInfo.logoBase64, 'PNG', margin + 10, margin + 6, 32, 32);
            } catch {}
          }
          doc.text(companyInfo.name || 'Company', margin + 50, margin + 22);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Quote #: ${quote.quoteNumber}`, rightX - 10, margin + 16, { align: 'right' });
          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX - 10, margin + 30, { align: 'right' });
          if (companyInfo.address) doc.text(companyInfo.address, margin + 50, margin + 36);
          if (companyInfo.contact) doc.text(companyInfo.contact, margin + 50, margin + 48);
          if (preparerName) doc.text(`Prepared by: ${preparerName}`, rightX - 10, margin + 44, { align: 'right' });
          // Title
          doc.setFontSize(18);
          doc.setTextColor(160);
          doc.text('QUOTATION', pageWidth / 2, margin + 64, { align: 'center' });
          doc.setTextColor(0);
          startY = margin + 78;
        } else if (templateId === 'classic') {
          // Two-column header
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(quote.companyInfo.name || 'Company', margin, margin);
          if (companyInfo.logoBase64) {
            try {
              doc.addImage(companyInfo.logoBase64, 'PNG', margin, margin - 2, 32, 32);
            } catch {}
          }
          doc.text(companyInfo.name || 'Company', margin + 40, margin);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          if (companyInfo.address) doc.text(companyInfo.address, margin + 40, margin + 14);
          if (companyInfo.contact) doc.text(companyInfo.contact, margin + 40, margin + 28);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.text('QUOTE', rightX, margin, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Quote #: ${quote.quoteNumber}`, rightX, margin + 14, { align: 'right' });
          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX, margin + 28, { align: 'right' });
          doc.text(`Client: ${client.name}`, rightX, margin + 42, { align: 'right' });
          if (preparerName) doc.text(`Prepared by: ${preparerName}`, rightX, margin + 56, { align: 'right' });
          // Rule
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(2);
          doc.line(margin, margin + 54, rightX, margin + 54);
          startY = margin + 64;
        } else {
          // Bold: brand block
          doc.setFillColor(...brand);
          doc.rect(margin, margin, pageWidth - margin * 2, 80, 'F');
          doc.setTextColor(255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          if (companyInfo.logoBase64) {
            try {
              doc.addImage(companyInfo.logoBase64, 'PNG', margin + 10, margin + 10, 32, 32);
            } catch {}
          }
          doc.text(companyInfo.name || 'Company', pageWidth / 2, margin + 46, { align: 'center' });
          doc.setTextColor(0);
          startY = margin + 100;
          // Client & meta
          doc.setTextColor(...brand);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.text(client.name, margin, startY);
          doc.setTextColor(120);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text('PROPOSAL', margin, startY + 16);
          doc.setTextColor(0);
          doc.text(`Quote #: ${quote.quoteNumber}`, rightX, startY - 10, { align: 'right' });
          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX, startY + 4, { align: 'right' });
          if (companyInfo.address) doc.text(companyInfo.address, margin, startY + 32);
          if (companyInfo.contact) doc.text(companyInfo.contact, margin, startY + 44);
          if (preparerName) doc.text(`Prepared by: ${preparerName}`, rightX, startY + 18, { align: 'right' });
          startY += 24;
        }

        // Items table
        const body = quote.items.map(it => {
          const up = it.unitPrice * (1 + (quote.markupPercent || 0) / 100);
          return [
            it.description || '—',
            String(it.quantity),
            it.unit || '',
            fmt(up),
            fmt(it.quantity * up),
          ];
        });
        const tableTheme = templateId === 'classic' ? 'grid' : 'grid';
  const headFill: [number, number, number] = templateId === 'bold' ? brand : templateId === 'classic' ? [229, 229, 229] : [248, 248, 248];
  const headText = templateId === 'bold' ? 255 : 0;
  const lineColor: [number, number, number] = templateId === 'classic' ? [0, 0, 0] : [229, 229, 229];
        const lineWidth = templateId === 'classic' ? 0.8 : 0.5;
        autoTable(doc, {
          startY: startY,
          head: [[ 'Description', 'Qty', 'Unit', 'Unit Price', 'Line Total' ]],
          body,
          styles: { fontSize: 10, cellPadding: 6, lineColor, lineWidth },
          headStyles: { fillColor: headFill, textColor: headText as any, halign: 'left' },
          theme: tableTheme as any,
          tableWidth: pageWidth - margin * 2,
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { halign: 'right', cellWidth: 50 },
            2: { cellWidth: 70 },
            3: { halign: 'right', cellWidth: 90 },
            4: { halign: 'right', cellWidth: 110 },
          },
        });

        const y = (doc as any).lastAutoTable?.finalY || margin + 100;

  // Totals
  doc.setFontSize(10);
  const labelX = rightX - 200;
  doc.setTextColor(0);
  doc.text('Subtotal', labelX, y + 16);
  doc.text(fmt(m.totalAmount), rightX, y + 16, { align: 'right' });
  doc.text(`Discount${quote.discountType === 'percentage' ? ` (${quote.discount}%)` : ''}`, labelX, y + 32);
  doc.text(`- ${fmt(m.discountAmount)}`, rightX, y + 32, { align: 'right' });
  doc.text(`Tax (${quote.taxRate}%)`, labelX, y + 48);
  doc.text(fmt(m.taxAmount), rightX, y + 48, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  if (templateId === 'bold') doc.setTextColor(...brand);
  doc.text('Grand Total', labelX, y + 64);
  doc.text(fmt(m.grandTotal), rightX, y + 64, { align: 'right' });
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

        // Notes
        if (quote.notes) {
          doc.setFont('helvetica', 'bold');
          doc.text('Notes', margin, y + 72);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(quote.notes, pageWidth - margin * 2);
          doc.text(lines, margin, y + 86);
        }

        // Terms
        let termsYOffset = y + (quote.notes ? 110 : 72);
        if (quote.terms) {
          doc.setFont('helvetica', 'bold');
          doc.text('Terms', margin, termsYOffset);
          doc.setFont('helvetica', 'normal');
          const tlines = doc.splitTextToSize(quote.terms, pageWidth - margin * 2);
          doc.text(tlines, margin, termsYOffset + 14);
        }

        const blob = doc.output('blob') as Blob;
        if (!cancelled) onDone(blob);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate PDF:', e);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [templateId, quote, estimate, project, client, onDone]);

  return null;
}
