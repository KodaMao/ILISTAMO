"use client";

import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Client, Estimate, Quote } from '@/types';
import { computeQuoteMetrics } from '@/lib/calculations';


import { useStore } from '@/store/useStore';

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export function GeneratePDF({ templateId, quote, estimate, client, onDone }: {
  templateId: string;
  quote: Quote;
  estimate: Estimate;
  client: Client;
  onDone: (blob: Blob) => void;
}) {
  const { settings } = useStore.getState();
  const currency = settings.currency || 'USD';
  // Fix for PHP symbol not supported by jsPDF: replace with 'PHP'
  const fmt = (n: number) => {
    let str = n.toLocaleString(undefined, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (currency === 'PHP') {
      // Replace any non-ASCII currency symbol (₱) with 'PHP '
      str = str.replace(/[₱±]/g, 'PHP ');
    }
    return str;
  };
  const companyInfo = settings.companyInfo || quote.companyInfo;
  const preparerName = settings.preparerName || '';
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancelled = false;

    const run = async () => {
      try {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        // Margins per template (inches -> points @72dpi)
        const margin = templateId === 'classic' ? 36 : templateId === 'modern' ? 18 : 54;
        const rightX = pageWidth - margin;

        // Palettes per template
        const PRO = {
          darkBlue: [44, 62, 80] as [number, number, number], // #2c3e50
          accentBlue: [52, 152, 219] as [number, number, number], // #3498db
          lightGray: [189, 195, 199] as [number, number, number], // #bdc3c7
          body: [51, 51, 51] as [number, number, number], // #333333
        };
        const MOD = {
          dark: [45, 55, 72] as [number, number, number], // #2d3748
          medium: [74, 85, 104] as [number, number, number], // #4a5568
          line: [226, 232, 240] as [number, number, number], // #e2e8f0
          stripe: [247, 250, 252] as [number, number, number], // #f7fafc
        };
        const BOLD = {
          darkBlue: [26, 54, 93] as [number, number, number], // #1a365d
          lightBlue: [240, 247, 255] as [number, number, number], // #f0f7ff
          mediumGray: [45, 55, 72] as [number, number, number], // #2d3748
        };

        const m = computeQuoteMetrics(quote, estimate);
        const validUntil = new Date(quote.createdAt + (quote.expiryDays || 0) * 86400000).toLocaleDateString();
        // Brand color from company settings used across templates
        const brandHex = companyInfo.brandColor || '#1a365d';
        const brandRGB = hexToRgb(brandHex);
        const lighten = (rgb: [number, number, number], t = 0.9): [number, number, number] => {
          const [r, g, b] = rgb; return [
            Math.round(r + (255 - r) * t),
            Math.round(g + (255 - g) * t),
            Math.round(b + (255 - b) * t),
          ] as [number, number, number];
        };

        const renderModernHeader = () => {
          const centerX = pageWidth / 2;
          // Light gray header band
          doc.setFillColor(...MOD.stripe);
          doc.rect(0, margin - 8, pageWidth, 44, 'F');
          if (companyInfo.logoBase64) {
            try { doc.addImage(companyInfo.logoBase64, 'PNG', centerX - 24, margin, 48, 48); } catch {}
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.setTextColor(45,55,72);
          doc.text(quote.quoteNumber || quote.name || 'Quotation', centerX, margin + 72, { align: 'center' });
          // Thin brand underline under title
          doc.setDrawColor(...brandRGB);
          doc.setLineWidth(1);
          doc.line(centerX - 40, margin + 78, centerX + 40, margin + 78);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(74,85,104);
          doc.text(`Quote Number: ${quote.quoteNumber}`, margin, margin + 94);
          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX, margin + 94, { align: 'right' });
          doc.text(`Valid Until: ${validUntil}`, margin, margin + 110);

          doc.setDrawColor(226,232,240);
          doc.setLineWidth(0.5);
          doc.line(margin, margin + 122, rightX, margin + 122);

          doc.setFont('helvetica', 'bold');
          doc.setTextColor(45,55,72);
          doc.text('To:', margin, margin + 140);
          doc.text('From:', rightX - 60, margin + 140);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(74,85,104);
          doc.text([client.name, client.address || '', client.email || ''].filter(Boolean) as string[], margin, margin + 154);
          const from = [companyInfo.name, companyInfo.address, companyInfo.contact].filter(Boolean) as string[];
          // Right-align each line of the 'From' block
          from.forEach((line, i) => {
            doc.text(line, rightX, margin + 154 + i * 14, { align: 'right' });
          });

          doc.setDrawColor(226,232,240);
          doc.line(margin, margin + 198, rightX, margin + 198);
          return margin + 210;
        };

        const renderClassicHeader = () => {
          // Professional Business layout
          const logoSize = 40;
          if (companyInfo.logoBase64) {
            try { doc.addImage(companyInfo.logoBase64, 'PNG', margin, margin, logoSize, logoSize); } catch {}
          }

          // Company Name (right, 18pt, bold, dark blue)
          doc.setFont('times', 'bold');
          doc.setFontSize(18);
          doc.setTextColor(...PRO.darkBlue);
          doc.text(companyInfo.name || '', rightX, margin + 14, { align: 'right' });

          // Body lines (11pt, dark gray)
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.body);
          // Address (left)
          if (companyInfo.address) {
            const addrLines = Array.isArray(companyInfo.address)
              ? (companyInfo.address as unknown as string[])
              : doc.splitTextToSize(companyInfo.address, (pageWidth / 2) - margin - 8);
            doc.text(addrLines as string[], margin, margin + 32);
          }
          // Contact (right)
          if (companyInfo.contact) {
            const contactLines = doc.splitTextToSize(companyInfo.contact, (pageWidth / 2) - margin - 8);
            doc.text(contactLines, rightX, margin + 32, { align: 'right' });
          }
          // Prepared by (left)
          if (preparerName) doc.text(`Prepared by: ${preparerName}`, margin, margin + 48);

          // Accent line (1pt, #3498db)
          doc.setDrawColor(...PRO.accentBlue);
          doc.setLineWidth(1);
          doc.line(margin, margin + 62, rightX, margin + 62);


          // CUSTOMER (left)
          doc.setFont('times', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...PRO.darkBlue);
          doc.text('CUSTOMER', margin, margin + 84);
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.body);
          const customerLines = [
            client.name,
            client.address || '',
            client.email ? `Email: ${client.email}` : '',
          ].filter(Boolean) as string[];
          doc.text(customerLines, margin, margin + 100);

          // FROM (right)
          doc.setFont('times', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...PRO.darkBlue);
          doc.text('FROM', rightX, margin + 84, { align: 'right' });
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.body);
          const fromLines = [
            companyInfo.name,
            companyInfo.address || '',
            companyInfo.contact || '',
          ].filter(Boolean) as string[];
          doc.text(fromLines, rightX, margin + 100, { align: 'right' });

          // Light divider
          doc.setDrawColor(...PRO.lightGray);
          doc.line(margin, margin + 136, rightX, margin + 136);

          // QUOTATION DETAILS block
          doc.setFont('times', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...PRO.darkBlue);
          doc.text('QUOTATION DETAILS', margin, margin + 156);
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.body);
          // Two-column rows
          doc.text(`Quotation: ${quote.quoteNumber || quote.name || ''}`, margin, margin + 172);
          doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, rightX, margin + 172, { align: 'right' });
          doc.text(`Quote Number: ${quote.quoteNumber}`, margin, margin + 186);
          doc.text(`Valid Until: ${validUntil}`, rightX, margin + 186, { align: 'right' });
          doc.text(`Customer ID: ${client.id}`, margin, margin + 200);

          // Light divider
          doc.setDrawColor(...PRO.lightGray);
          doc.line(margin, margin + 212, rightX, margin + 212);

          // DESCRIPTION OF SERVICES
          doc.setFont('times', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...PRO.darkBlue);
          doc.text('DESCRIPTION OF SERVICES', margin, margin + 232);
          return margin + 244;
        };

        const renderBoldHeader = () => {
          // Bold Corporate: Dark banner with company + QUOTATION + optional logo
          const headerH = 90;
          doc.setFillColor(...brandRGB);
          doc.rect(0, 0, pageWidth, headerH, 'F');
          doc.setTextColor(255);
          doc.setFont('helvetica', 'bold');
          let nameX = margin;
          try {
            if (companyInfo.logoBase64) {
              const logoW = 36; const logoH = 36;
              doc.addImage(companyInfo.logoBase64, 'PNG', margin, 14, logoW, logoH);
              nameX = margin + logoW + 10;
            }
          } catch {}
          doc.setFontSize(20);
          doc.text(companyInfo.name || '', nameX, 30);
          doc.setFontSize(16);
          doc.text(quote.quoteNumber || quote.name || 'QUOTATION', rightX, 30, { align: 'right' });

          // Optional contact lines in banner bottom
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const info = [companyInfo.address, companyInfo.contact].filter(Boolean) as string[];
          if (info.length) {
            doc.text(info.join(' • '), nameX, 50);
          }

          // Below banner: left Bill/Ship boxes, right Meta box
          doc.setTextColor(0);
          const gap = 16;
          const colW = (pageWidth - margin * 2 - gap) / 2;
          const innerW = colW - 16;
          const lineH = 12;
          let y0 = headerH + 20;

          // BILL TO box (dynamic height)
          doc.setDrawColor(...BOLD.darkBlue);
          doc.setLineWidth(1);
          const billNameLines = doc.splitTextToSize(client.name || '', innerW);
          const billAddrLines = client.address ? doc.splitTextToSize(client.address, innerW) : [] as string[];
          const billEmailLines = client.email ? doc.splitTextToSize(client.email, innerW) : [] as string[];
          const billContent = [...billNameLines, ...billAddrLines, ...billEmailLines];
          const billH = Math.max(72, 32 + billContent.length * lineH + 12);
          doc.rect(margin, y0, colW, billH);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('BILL TO', margin + 8, y0 + 16);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          if (billContent.length) doc.text(billContent, margin + 8, y0 + 32);

          // SHIP TO box (dynamic height; duplicates client for now)
          const shipY = y0 + billH + 12;
          const shipNameLines = billNameLines;
          const shipAddrLines = billAddrLines;
          const shipEmailLines = billEmailLines;
          const shipContent = [...shipNameLines, ...shipAddrLines, ...shipEmailLines];
          const shipH = Math.max(72, 32 + shipContent.length * lineH + 12);
          doc.rect(margin, shipY, colW, shipH);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('SHIP TO', margin + 8, shipY + 16);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          if (shipContent.length) doc.text(shipContent, margin + 8, shipY + 32);

          // META box (Quote info) dynamic height
          const metaX = margin + colW + gap;
          const metaRaw = [
            `Quote #: ${quote.quoteNumber}`,
            `Date: ${new Date(quote.createdAt).toLocaleDateString()}`,
            `Valid Until: ${validUntil}`,
            preparerName ? `Prepared by: ${preparerName}` : undefined,
          ].filter(Boolean) as string[];
          const metaLinesWrapped = metaRaw.flatMap((t) => doc.splitTextToSize(t, innerW));
          const metaH = Math.max(72, 32 + metaLinesWrapped.length * lineH + 12);
          doc.rect(metaX, y0, colW, metaH);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('QUOTE INFO', metaX + 8, y0 + 16);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          if (metaLinesWrapped.length) doc.text(metaLinesWrapped, metaX + 8, y0 + 32);

          // Section title before table
          const tableStartY = Math.max(shipY + shipH, y0 + metaH) + 40;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...BOLD.darkBlue);
          doc.setFontSize(12);
          doc.text('PROPOSED SERVICES', margin, tableStartY - 10);
          doc.setTextColor(0);
          return tableStartY;
        };

  const startY = templateId === 'modern' ? renderModernHeader() : templateId === 'classic' ? renderClassicHeader() : renderBoldHeader();

        // Items table
        // Build table head/body per template
        const items = quote.items.length ? quote.items : [{ id: 'empty', description: '—', category: '', quantity: 0, unit: '', unitPrice: 0 }];
        let head: string[][];
        let body: (string | number)[][];
        let columnStyles: any;
        // Use per-item markup and original unit price from estimate, matching computeQuoteMetrics
        function getOriginalUnitPrice(it: any, sourceEstimate?: Estimate): number {
          if (!sourceEstimate) return 0;
          const estItem = sourceEstimate.items.find((ei: any) => ei.id === it.id);
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
        if (templateId === 'modern' || templateId === 'classic') {
          const rows = items.map((it) => {
            const up = effectiveUnitPrice(it, estimate);
            return [it.description || '—', String(it.quantity), it.unit || '', fmt(up), fmt(it.quantity * up)];
          });
          head = [['Description', 'Qty', 'Unit', 'Unit Price', 'Line Total']];
          body = rows.map((r) => [...r]);
          columnStyles = {
            0: { cellWidth: 'auto' as const },
            1: { halign: 'right' as const, cellWidth: 48 },
            2: { cellWidth: 64 },
            3: { halign: 'right' as const, cellWidth: 90 },
            4: { halign: 'right' as const, cellWidth: 110 },
          };
        } else {
          // Bold Corporate: include an Item # column and stripe rows with light blue
          const rows = items.map((it, idx) => {
            const up = effectiveUnitPrice(it, estimate);
            return [String(idx + 1), it.description || '—', String(it.quantity), it.unit || '', fmt(up), fmt(it.quantity * up)];
          });
          head = [['Item', 'Description', 'Qty', 'Unit', 'Unit Price', 'Line Total']];
          body = rows.map((r) => [...r]);
          columnStyles = {
            0: { cellWidth: 40, halign: 'center' as const },
            1: { cellWidth: 'auto' as const },
            2: { cellWidth: 48, halign: 'center' as const },
            3: { cellWidth: 64, halign: 'center' as const },
            4: { cellWidth: 90, halign: 'right' as const },
            5: { cellWidth: 110, halign: 'right' as const },
          };
        }

        const common = {
          head,
          body,
          tableWidth: pageWidth - margin * 2,
          margin: { left: margin, right: margin },
          columnStyles,
        } as const;

        if (templateId === 'modern') {
          autoTable(doc as unknown as jsPDF, {
            startY,
            ...common,
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, textColor: MOD.medium, lineColor: MOD.line, lineWidth: 0.5 },
            headStyles: { fillColor: MOD.dark, textColor: 255, fontStyle: 'bold', font: 'helvetica' },
            theme: 'striped',
            alternateRowStyles: { fillColor: MOD.stripe },
            columnStyles: {
              0: { cellWidth: 'auto' as const, halign: 'left' as const },
              1: { cellWidth: 60, halign: 'center' as const },
              2: { cellWidth: 64, halign: 'center' as const },
              3: { cellWidth: 90, halign: 'right' as const },
              4: { cellWidth: 110, halign: 'right' as const },
            },
          } as any);
        } else if (templateId === 'classic') {
          autoTable(doc as unknown as jsPDF, {
            startY,
            ...common,
            styles: { font: 'times', fontSize: 11, cellPadding: 8, textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.8 },
            headStyles: { fillColor: [230,230,230], textColor: [0,0,0], fontStyle: 'bold', font: 'times' },
            theme: 'grid',
          } as any);
        } else {
          autoTable(doc as unknown as jsPDF, {
            startY,
            ...common,
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 8, lineColor: [255, 255, 255], lineWidth: 0 },
            headStyles: { fillColor: brandRGB, textColor: 255, fontStyle: 'bold', font: 'helvetica' },
            theme: 'striped',
            alternateRowStyles: { fillColor: lighten(brandRGB, 0.92) },
          } as any);
        }

        const lastY: number = (doc as any).lastAutoTable?.finalY ?? startY + 100;

        // Totals
        const labelX = rightX - 200;
        if (templateId === 'modern') {
          doc.setFontSize(10);
          doc.setTextColor(...MOD.dark);
          doc.text('Subtotal', labelX, lastY + 18);
          doc.text(fmt(m.totalAmount), rightX, lastY + 18, { align: 'right' });
          doc.text(`Discount${quote.discountType === 'percentage' ? ` (${quote.discount}%)` : ''}`, labelX, lastY + 34);
          doc.text(`- ${fmt(m.discountAmount)}`, rightX, lastY + 34, { align: 'right' });
          doc.text(`Tax (${quote.taxRate}%)`, labelX, lastY + 50);
          doc.text(fmt(m.taxAmount), rightX, lastY + 50, { align: 'right' });
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...MOD.dark);
          doc.text('TOTAL', labelX, lastY + 68);
          doc.text(fmt(m.grandTotal), rightX, lastY + 68, { align: 'right' });
          doc.setTextColor(0);
          doc.setFont('helvetica', 'normal');
        } else if (templateId === 'classic') {
          // Professional: bold labels, grand total extra emphasis
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.body);
          doc.text('Subtotal', labelX, lastY + 18);
          doc.text(fmt(m.totalAmount), rightX, lastY + 18, { align: 'right' });
          doc.text(`Discount${quote.discountType === 'percentage' ? ` (${quote.discount}%)` : ''}`, labelX, lastY + 34);
          doc.text(`- ${fmt(m.discountAmount)}`, rightX, lastY + 34, { align: 'right' });
          doc.text(`Tax (${quote.taxRate}%)`, labelX, lastY + 50);
          doc.text(fmt(m.taxAmount), rightX, lastY + 50, { align: 'right' });
          // Grand total
          doc.setFont('times', 'bold');
          doc.setTextColor(...PRO.darkBlue);
          doc.setFontSize(12);
          doc.text('GRAND TOTAL', labelX, lastY + 70);
          doc.text(fmt(m.grandTotal), rightX, lastY + 70, { align: 'right' });
          doc.setFont('times', 'normal');
          doc.setTextColor(...PRO.body);
        } else {
          doc.setFontSize(10);
          doc.setTextColor(BOLD.mediumGray[0], BOLD.mediumGray[1], BOLD.mediumGray[2]);
          doc.text('Subtotal', labelX, lastY + 18);
          doc.text(fmt(m.totalAmount), rightX, lastY + 18, { align: 'right' });
          doc.text(`Discount${quote.discountType === 'percentage' ? ` (${quote.discount}%)` : ''}`, labelX, lastY + 34);
          doc.text(`- ${fmt(m.discountAmount)}`, rightX, lastY + 34, { align: 'right' });
          doc.text(`Tax (${quote.taxRate}%)`, labelX, lastY + 50);
          doc.text(fmt(m.taxAmount), rightX, lastY + 50, { align: 'right' });
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...brandRGB);
          doc.setFontSize(14);
          doc.text('TOTAL DUE', labelX, lastY + 76);
          doc.text(fmt(m.grandTotal), rightX, lastY + 76, { align: 'right' });
          doc.setTextColor(0);
          doc.setFont('helvetica', 'normal');
        }

        // Terms / Notes / Signature
        const bottomSafe = pageHeight - margin - 40;
        let cursorY = lastY + 96;
        if (cursorY > bottomSafe) { doc.addPage(); cursorY = margin; }

        if (templateId === 'modern') {
          if (quote.terms) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Terms & Conditions', margin, cursorY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const items = quote.terms.split(/\r?\n|;+/).map((s) => s.trim()).filter(Boolean);
            let y = cursorY + 16;
            for (const it of items) {
              const wrap = doc.splitTextToSize(it, pageWidth - margin * 2 - 14);
              doc.text('•', margin, y);
              doc.text(wrap, margin + 12, y);
              y += 14 + (wrap.length - 1) * 12;
            }
            cursorY = y + 8;
          }
          // Acceptance: signature and date lines left-aligned
          doc.setDrawColor(200);
          const sigW = 220;
          const dateW = 120;
          const gap = 24;
          const sigY = cursorY + 24;
          doc.line(margin, sigY, margin + sigW, sigY);
          doc.line(margin + sigW + gap, sigY, margin + sigW + gap + dateW, sigY);
          doc.setFontSize(9);
          doc.text('Authorized Signature', margin, sigY + 12);
          doc.text('Date', margin + sigW + gap, sigY + 12);
          cursorY += 44;
        } else if (templateId === 'classic') {
          if (quote.terms) {
            doc.setFont('times', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(...PRO.darkBlue);
            doc.text('TERMS AND CONDITIONS', margin, cursorY);
            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...PRO.body);
            const items = quote.terms.split(/\r?\n|;+/).map((s) => s.trim()).filter(Boolean);
            let y = cursorY + 16;
            items.forEach((item, idx) => {
              const label = `${idx + 1}. `;
              const wrap = doc.splitTextToSize(item, pageWidth - margin * 2 - 18);
              doc.text(label, margin, y);
              doc.text(wrap, margin + 16, y);
              y += 14 + (wrap.length - 1) * 12;
            });
            cursorY = y + 8;
          }
          // Acceptance lines (centered)
          doc.setDrawColor(...PRO.lightGray);
          const lineW = 220;
          const centerX = pageWidth / 2;
          doc.line(centerX - lineW / 2, cursorY + 24, centerX + lineW / 2, cursorY + 24);
          doc.setFont('times', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(...PRO.body);
          doc.text('Signature', centerX, cursorY + 36, { align: 'center' });
          doc.line(centerX - lineW / 2, cursorY + 60, centerX + lineW / 2, cursorY + 60);
          doc.text('Date', centerX, cursorY + 72, { align: 'center' });
          cursorY += 84;
        } else {
          // Bold: authorization box + notes column
          const boxW = 260; const boxH = 120; const boxX = rightX - boxW; const boxY = cursorY;
          doc.setDrawColor(...BOLD.darkBlue); doc.setLineWidth(1); doc.rect(boxX, boxY, boxW, boxH);
          doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('AUTHORIZATION', boxX + 8, boxY + 18);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
          doc.text('Authorized Signature:', boxX + 8, boxY + 40); doc.line(boxX + 140, boxY + 40, boxX + boxW - 8, boxY + 40);
          doc.text('Print Name:', boxX + 8, boxY + 62); doc.line(boxX + 140, boxY + 62, boxX + boxW - 8, boxY + 62);
          doc.text('Title:', boxX + 8, boxY + 84); doc.line(boxX + 140, boxY + 84, boxX + boxW - 8, boxY + 84);
          doc.text('Date:', boxX + 8, boxY + 106); doc.line(boxX + 140, boxY + 106, boxX + boxW - 8, boxY + 106);
          let leftY = boxY;
          if (quote.terms) {
            doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Terms', margin, leftY);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
            const items = quote.terms.split(/\r?\n|;+/).map((s) => s.trim()).filter(Boolean);
            leftY += 16;
            const colW = pageWidth - margin * 2 - boxW - 24;
            for (const it of items) {
              const wrap = doc.splitTextToSize(it, colW - 12);
              doc.text('•', margin, leftY);
              doc.text(wrap, margin + 12, leftY);
              leftY += 14 + (wrap.length - 1) * 12;
            }
          }
          if (quote.notes) {
            const sideW = 160; const sideX = pageWidth - margin - sideW; const sideY = boxY + boxH + 14;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120);
            const lines = doc.splitTextToSize(quote.notes, sideW);
            doc.text(lines, sideX, sideY); doc.setTextColor(0);
          }
          cursorY = Math.max(leftY, boxY + boxH) + 12;
        }

        // Footer (per template subtle differences)
        if (templateId === 'classic') {
          // Light divider
          doc.setDrawColor(...PRO.lightGray);
          doc.line(margin, pageHeight - margin - 40, rightX, pageHeight - margin - 40);
          doc.setFont('times', 'italic');
          doc.setFontSize(10);
          doc.setTextColor(120);
          const info = [companyInfo.name, companyInfo.address, companyInfo.contact].filter(Boolean).join(' • ');
          if (info) doc.text(info, pageWidth / 2, pageHeight - margin - 18, { align: 'center' });
          doc.setFont('times', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...PRO.darkBlue);
          doc.text('Thank You For Your Business!', pageWidth / 2, pageHeight - margin - 2, { align: 'center' });
          doc.setTextColor(0);
        } else if (templateId === 'modern') {
          doc.setDrawColor(...MOD.line);
          doc.line(margin, pageHeight - margin - 30, rightX, pageHeight - margin - 30);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120);
          const infoLines = [companyInfo.name, companyInfo.address, companyInfo.contact].filter(Boolean).join(' • ');
          if (infoLines) doc.text(infoLines, pageWidth / 2, pageHeight - margin - 12, { align: 'center' });
          doc.setTextColor(0);
        } else {
          doc.setDrawColor(...BOLD.darkBlue);
          doc.line(margin, pageHeight - margin - 36, rightX, pageHeight - margin - 36);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(...BOLD.darkBlue);
          doc.text('Contact Information', pageWidth / 2, pageHeight - margin - 22, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120);
          const details = [companyInfo.name, companyInfo.address, companyInfo.contact].filter(Boolean).join(' • ');
          if (details) doc.text(details, pageWidth / 2, pageHeight - margin - 8, { align: 'center' });
          doc.setTextColor(0);
        }

        const blob = doc.output('blob') as Blob;
        if (!cancelled) onDone(blob);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to generate PDF:', e);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [templateId, quote, estimate, client, onDone]);

  return null;
}
