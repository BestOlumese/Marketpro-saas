# PHASE-2-INVENTORY.md — Inventory Management

> Read AGENTS.md + concerns/STYLES.md + concerns/DB.md before starting.
> Do not start until Phase 1 Definition of Done is fully checked off.

---

## Goal

Complete inventory management: products, categories, suppliers, stock alerts, barcode scanning, bulk import.

---

## Packages To Install

```bash
npm install react-dropzone
npm install papaparse
npm install @types/papaparse --save-dev
```

---

## Build Order

### Section 1 — DB schema & queries
- [ ] `lib/db/schema/categories.ts`
- [ ] `lib/db/schema/suppliers.ts`
- [ ] `lib/db/schema/products.ts`
- [ ] Update `lib/db/schema/index.ts`
- [ ] `lib/db/queries/products.ts`
- [ ] `lib/db/queries/categories.ts`
- [ ] `lib/db/queries/suppliers.ts`
- [ ] Run migration

### Section 2 — Validation schemas
- [ ] `lib/validations/product.schema.ts`
- [ ] `lib/validations/category.schema.ts`
- [ ] `lib/validations/supplier.schema.ts`

### Section 3 — API routes
- [ ] `app/api/inventory/products/route.ts` — GET, POST
- [ ] `app/api/inventory/products/[id]/route.ts` — GET, PATCH, DELETE
- [ ] `app/api/inventory/products/bulk/route.ts` — POST (CSV import)
- [ ] `app/api/inventory/categories/route.ts` — GET, POST
- [ ] `app/api/inventory/suppliers/route.ts` — GET, POST
- [ ] `app/api/inventory/low-stock/route.ts` — GET

### Section 4 — TanStack Query hooks
- [ ] `lib/hooks/useProducts.ts`
- [ ] `lib/hooks/useCategories.ts`
- [ ] `lib/hooks/useSuppliers.ts`

### Section 5 — Components
- [ ] `components/inventory/ProductTable.tsx`
- [ ] `components/inventory/ProductForm.tsx`
- [ ] `components/inventory/BarcodeScanner.tsx`
- [ ] `components/inventory/LowStockAlert.tsx`
- [ ] `components/inventory/BulkImportModal.tsx`
- [ ] `components/inventory/StockBadge.tsx`

### Section 6 — Pages
- [ ] `app/(dashboard)/inventory/page.tsx`
- [ ] `app/(dashboard)/inventory/new/page.tsx`
- [ ] `app/(dashboard)/inventory/[id]/page.tsx`
- [ ] `app/(dashboard)/inventory/suppliers/page.tsx`
- [ ] `app/(dashboard)/inventory/categories/page.tsx`

### Section 7 — Offline
- [ ] Update `lib/dexie/db.ts` if products schema changed
- [ ] Add `syncProductsToLocal()` call in dashboard layout on mount

---

## Barcode Scanner

Use native `BarcodeDetector` API — no library.

```typescript
const supported = 'BarcodeDetector' in window
// If not supported, show manual text input fallback
```

---

## CSV Import Format

Expected columns: `name, barcode, price, cost_price, stock, low_stock_at, category, expiry_date`
Validate each row with Zod. Return: X imported, Y failed, with reasons.

---

## Definition of Done — Phase 2

- [ ] Products: create, edit, soft-delete
- [ ] List filterable by category, status, search
- [ ] Barcode scanning works on Chrome/Android
- [ ] Low-stock products show on dashboard
- [ ] CSV bulk import works for 100+ products
- [ ] Products cached in Dexie on app load
- [ ] Prices stored in kobo, displayed in naira
- [ ] `npm run build` passes
