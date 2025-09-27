
## IListaMo App Specification (Updated September 28, 2025)


### Workflow Overview
- The app is client/estimate/quote-centric. All project-related code, UI, and references have been fully removed for a simpler, more focused workflow.
- Users create estimates for clients, then generate quotes based on those estimates.
- Quotes are fully editable, with per-item markup, category grouping, and analytics.

### Dashboard Summary
- The dashboard displays summary cards for quotes by status, total accepted quotes, and client count.
- **Total Accepted Quotes** now reflects the sum of all accepted quotes' grand totals, including markup, discount, and tax, using the same calculation as the quote view (via `computeQuoteMetrics`).


### Quote Editor UI
The quote editor page features:
  - Editable quote number as the main title (left-aligned)
  - Subheading: "Based on estimate: [estimate name]"
  - Grouped items by category, with per-category subtotals
  - Per-item markup controls (percentage or value)
  - Original unit price and markup price columns
  - Scrollable, modern, and clean UI with improved spacing and card appearance
  - Notes and terms section
  - Overview analytics at the bottom (totals, tax, discount, profit, etc.)
  - Bottom action bar: Export Quote (PDF) and Save, with save notification

### PDF Export
- PDF export uses the quote number as the main title and in all relevant places
- Calculations in the PDF match the UI (per-item markup, correct subtotals, etc.)
- Export works without project data; only quote, estimate, and client are required

### Other Features
- All references to project are removed from UI, logic, and codebase
- Quote ID is never shown to the user
- All notifications and error messages are user-friendly

---
_This spec reflects the state of the app as of the September 28, 2025 refactor. All project-related code and UI have been removed. The app is now fully focused on clients, estimates, and quotes._
- Dashboard summary cards, recent activity, and quick links
  - Dashboard summary values (including accepted quotes total) are always in sync with the latest quote status and calculations.
- Estimate editor: checkboxes for item selection, select-all per category, and 'Clear All' button for removing all items

## Export

- Export estimates and quotes to PDF using customizable templates

## Settings

- Company info, branding, and PDF template selection

## Tech Stack

- Next.js, React, TypeScript, Zustand, Tailwind CSS, jsPDF

## Changelog

- 2024-06-01: Initial spec
- 2025-09-27: Projects removed, dashboard and workflow updated to be client/estimate/quote-centric
- 2025-09-27: Estimate editor UI: item selection checkboxes, select-all per category, and 'Clear All' button added

## Future Improvements

- User authentication
- Team collaboration
- Invoice management
- More analytics
- Analytics: shows totals (see Calculations), live-updated.
- Settings: status selector (draft/sent/accepted/declined), discount (amount or %), tax rate, notes, company info (name, address, brandColor, logoBase64 optional), quote number, expiry days.
- ExportaMo: opens a modal to choose a template, renders a preview, and lets the user download/open; includes an action to set status to "sent".
Acceptance:
- Changing discount type immediately recomputes metrics.
- Export renders a non-empty PDF preview and allows download/open.
- Subtotal equals sum of item (qty × unit price) amounts.

### Clients (/clients)
- Table of clients with edit and delete buttons.
- Add New Client via modal form (fields: name, contact name, email, address, company).
- Delete protected if any project references the client.
Acceptance:
- Attempting to delete a referenced client shows a message and leaves data intact.

### Backup (BackupaMo/RestoraMo)
- Export writes `.ilistamo` (JSON) with shape equal to `AppData`.
- Import reads `.ilistamo` and overwrites current data (no confirmation currently); a success toast may be shown.
Acceptance:
- After import, dashboard reflects the imported data immediately.

---

## Calculations
Given Quote Q and (optional) source Estimate E:
- totalCost = sum(E.items.quantity * E.items.costPerUnit) or 0 if E missing
- totalAmount = sum(Q.items.quantity * Q.items.unitPrice)
- discountAmount = Q.discount if discountType == 'amount' else totalAmount * Q.discount / 100
- subtotal = max(totalAmount - discountAmount, 0)
- taxAmount = subtotal * (Q.taxRate / 100)
- grandTotal = subtotal + taxAmount
- totalProfit = grandTotal - totalCost
- profitMargin = totalAmount > 0 ? (totalProfit / grandTotal) * 100 : 0

Edge cases:
- Empty items list → totals are zero.
- Negative inputs prevented by UI.
- Discount cannot reduce subtotal below zero.

---

## Data constraints
- Client.name: required
- Estimate.clientId: must reference existing client
- Quote.estimateId: must reference existing estimate
- Quantities and monetary values: >= 0
- Settings: defaultTaxRate [0..100], defaultExpiryDays >= 0

---

## Status lifecycle
- Allowed transitions: draft → sent → accepted/declined
- Manual overrides allowed for testing; UI should nudge user to use ExportaMo to move from draft to sent.

---

## Export/PDF templates (jsPDF)

Common
- Brand color: companyInfo.brandColor is used across templates (accents, headers, totals).
- Logo: companyInfo.logoBase64 (PNG) is rendered when provided.
- Valid Until is computed from createdAt + expiryDays.
- Table columns: Description, Qty, Unit, Unit Price, Line Total (Bold adds an Item # column as the first column).
- Currency formatting uses locale with 2 decimals.

Modern Clean
- Typography: Helvetica; margins ≈ 0.25in (18pt).
- Header: light gray band behind a centered title; subtle brand underline under the title.
- Meta: Quote Number, Date, Valid Until under the header; To/From blocks separated by a light rule.
- Table: dark header row (#2d3748) with white text; striped body rows (#f7fafc); Qty/Unit centered; prices right-aligned.
- Totals: Subtotal, Discount, Tax, and bold TOTAL label; values right-aligned.
- Terms: bulleted list (if present).
- Acceptance: left-aligned signature and date lines.
- Footer: centered, muted company info.

Classic Professional
- Typography: Times; margins ≈ 0.5in (36pt).
- Header: company at top with address/contact; bold rule/accent line.
- Blocks: CUSTOMER, QUOTATION DETAILS (two-column rows), DESCRIPTION OF SERVICES header before the items.
- Table: grid with black borders; gray head row; body in dark gray text.
- Totals: Subtotal, Discount, Tax; GRAND TOTAL emphasized in dark blue.
- Terms: numbered list (if present).
- Acceptance: centered Signature and Date lines.
- Footer: light divider; centered “Thank You” line and muted company info.

Bold & Branded
- Typography: Helvetica; margins ≈ 0.75in (54pt).
- Header: large brand-colored banner; optional logo at left; company name; “QUOTATION” right-aligned in banner.
- Info boxes: dynamic-height BILL TO and SHIP TO boxes on the left; QUOTE INFO box on the right (Quote #, Date, Valid Until, Prepared by, Project).
- Section: “PROPOSED SERVICES” title before table.
- Table: header filled with brand color, white text; alternating body stripes using a lightened brand color; columns include Item #.
- Totals: Subtotal, Discount, Tax; TOTAL DUE and amount in brand color.
- Authorization: boxed area with lines for Authorized Signature, Print Name, Title, and Date; optional Terms text in the left column.
- Footer: line + “Contact Information” label; centered muted company/address/contact; no hardcoded payment terms string.

Notes:
- All PDFs render non-empty previews and support download/open via ExportaMo.
- Future polish: page numbers, richer footers, localized currency/date.

---

## Accessibility & i18n
- Keyboard navigable inputs and buttons.
- Sufficient color contrast for text and badges.
- Currency and date formats to be localized in future iterations.

---

## Backup format (.ilistamo)
MIME: application/json
Top-level object matches `AppData` exactly:
```
{
  "clients": [...],
  "estimates": [...],
  "quotes": [...],
  "settings": { "defaultTaxRate": number, "defaultExpiryDays": number }
}
```

---

## Roadmap (short-term)
1) Project/Estimate/Quote creation flows in UI
2) Dashboard filters and status badges
3) Rich PDF tables and footers
4) Client edit modal and delete protection UX
5) Polished styles and icons (lucide-react, shadcn/ui optional)
