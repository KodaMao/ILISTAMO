# IListaMo Specification (Guide)

This document captures the core product spec. Keep it in sync with the codebase as features evolve.

## 1. Core Concept & Value Proposition
IListaMo is a fully client-side web application with a two-stage workflow:
- Estimate: internal project costs (itemized)
- Quote: client-ready proposal with markups, discounts, taxes, and real-time profitability
- Pipeline Tracking: statuses (draft, sent, accepted, declined)
- All data stored locally via localForage, with import/export for backup

## 2. Data Structure (TypeScript)
See `src/types.ts` for exact interfaces: Client, Project, Estimate/EstimateItem, Quote/QuoteItem, CompanyInfo, AppSettings, Template, ProfitMetrics, AppData.

## 3. Technology Stack (2025)
- Next.js 15, React 18, TypeScript 5
- Tailwind CSS 3.4
- Zustand 4.5
- localforage 1.10
- jsPDF + jspdf-autotable (PDF generation)
- lucide-react, @radix-ui/react-select

## 4. Predefined Quote Templates
- Modern Clean — light header band with centered title; dark header row with white text; striped body rows; left-aligned acceptance (signature + date)
- Classic Professional — two-column header with rule; black borders and gray head row; numbered terms; centered signature and date
- Bold & Branded — brand-colored header block (logo optional); BILL TO/SHIP TO boxes and QUOTE INFO; proposed services table (with Item # column); brand-accented TOTAL DUE and authorization box

## 5. Feature Set & Workflow
- MyCompany: dedicated page to set company name, address, contact, brand color (with live preview), logo (PNG/base64), and preparer name. Accessible from main navigation.
- Company info and branding are used in all PDF exports (header, color, logo, preparer).
- Navigation: main bar includes link to MyCompany with live brand color dot.
- Dashboard: project cards, status badges, search/filter, New Project
- Project Detail: Estimates tab, Quotes tab, New Estimate
- Estimate Editor: items (desc, category, qty, unit, cost per unit), per-row Line Total and Subtotal, Save, Create Quote from Estimate
- Quote Editor: items (left) and analytics/settings (right); Save; ExportaMo opens preview/download modal
- ExportaMo: select template → generate PDF → in-modal preview → download or open → optional mark as "sent" (implemented)
- Clients: table with edit/delete (with delete protection when projects exist), add new client
- Data Backup: export/import `.ilistamo` (import overwrites current data; show success toast)

## 6. Component Architecture
See `/src/components/**` tree in the repository for the mapping. Initial implementation may provide thin placeholders; flesh out progressively.

## 7. User Workflow
Create Project + Estimate → Create Quote → Mark Up & Analyze → Export & Send → Track Status → Backup

---
Version: 0.5 (PDF templates refined: brand color usage, headers/boxes, footers)

## Implementation notes
- SSR safety: localForage usage is client-only via lazy imports; no SSR access to storage.
- Client/server boundary: Zustand store used only within "use client" components. Server pages render thin client wrappers.
- Routing: typedRoutes enabled; use standard `params` in server components and `useParams()` in client-only pages.
- Future enhancements: richer PDF tables and totals layout, status badges and filters on dashboard, delete protection for clients with projects.

---

## Detailed requirements and acceptance criteria

### Dashboard (/)
- Project cards show project name, client name, and a status badge reflecting latest quote status for that project.
- Search bar filters by project name, client name, or status (case-insensitive substring match).
- New Project button opens a modal to create a project (select client, name, optional description).
Acceptance:
- Typing in search immediately filters visible project cards.
- Creating a project adds it to state and persists to localForage.

### Project Detail (/projects/[projectId])
- Tabs: "Estimates" and "Quotes".
- Estimates tab lists estimates for the project, including each estimate's total cost; New Estimate button creates a blank estimate (with 0 items) and routes to estimate editor.
- Quotes tab lists quotes for estimates under this project; shows each quote's grand total and an inline status selector.
Acceptance:
- Creating a new estimate adds it to state with timestamps; navigation to its editor succeeds.
- Changing a quote status updates in store and reflects on dashboard.

### Estimate Editor (/projects/[projectId]/estimates/[estimateId])
- Editable table: Description, Category, Qty (number >= 0), Unit (text), Cost Per Unit (currency >= 0).
- Read-only Line Total per row (Qty × Cost/Unit) and Subtotal below.
- Add and remove line items with buttons.
- Save Estimate persists items.
- Create Quote from Estimate creates a quote with items mapped from estimate (unitPrice defaults to costPerUnit) and navigates to the quote editor.
Acceptance:
- Validation prevents negative numbers; empty description allowed but highlighted.
- Numeric inputs use min/step (Qty step=1; money step=0.01).
- Create Quote produces a new quote with default tax/expiry from settings.

### Quote Editor (/quotes/[quoteId])
- Company info and preparer are shown in the PDF header (name, address, contact, logo, brand color, prepared by).
- Brand color is reflected in all PDF templates.
- Layout: Items (left) and Analytics + Settings (right).
- Items: edit description, unit, qty, unit price; add/remove items; read-only Line Total per row; Subtotal displayed under the list.
- Analytics: shows totals (see Calculations), live-updated.
- Settings: status selector (draft/sent/accepted/declined), discount (amount or %), tax rate, notes, company info (name, address, brandColor, logoBase64 optional), quote number, expiry days.
- ExportaMo: opens a modal to choose a template, renders a preview, and lets the user download/open; includes an action to set status to "sent".
Acceptance:
- Changing discount type immediately recomputes metrics.
- Export renders a non-empty PDF preview and allows download/open.
- Subtotal equals sum of item (qty × unit price) amounts.

### Clients (/clients)
- Table of clients with edit and delete buttons.
- Add New Client creates a client with a generated id.
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
- Project.clientId: must reference existing client
- Estimate.projectId: must reference existing project
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
	"projects": [...],
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
