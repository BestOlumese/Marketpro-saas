# PHASE-4-REPORTS.md — Reports & Analytics

> Read AGENTS.md + concerns/DB.md + concerns/API.md before starting.
> Do not start until Phase 3 is complete.

---

## Goal

Reports module: sales summary, top products, staff performance, profit margins, CSV/PDF export.

---

## Packages To Install

```bash
npm install recharts
npm install jspdf jspdf-autotable
```

---

## Build Order

### Section 1 — DB queries
- [ ] `lib/db/queries/reports.ts`

### Section 2 — API routes
- [ ] `app/api/reports/summary/route.ts`
- [ ] `app/api/reports/products/route.ts`
- [ ] `app/api/reports/staff/route.ts`
- [ ] `app/api/reports/profit/route.ts`
- [ ] `app/api/reports/export/route.ts`

### Section 3 — Components
- [ ] `components/reports/SalesSummaryChart.tsx`
- [ ] `components/reports/TopProductsTable.tsx`
- [ ] `components/reports/StaffLeaderboard.tsx`
- [ ] `components/reports/DateRangePicker.tsx`
- [ ] `components/reports/ExportButton.tsx`

### Section 4 — Pages
- [ ] `app/(dashboard)/reports/page.tsx`
- [ ] `app/(dashboard)/reports/products/page.tsx`
- [ ] `app/(dashboard)/reports/staff/page.tsx`

### Section 5 — Dashboard home
- [ ] Wire real data into dashboard home metric cards

---

## Definition of Done — Phase 4

- [ ] Daily/weekly/monthly sales summary with chart
- [ ] Top 10 selling products
- [ ] Staff sales performance table
- [ ] Date range filter works
- [ ] CSV export downloads correctly
- [ ] Dashboard home shows real metrics
- [ ] Reports redirect to /offline when offline
- [ ] `npm run build` passes
