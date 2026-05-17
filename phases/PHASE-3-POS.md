# PHASE-3-POS.md — Point of Sale Checkout

> Read AGENTS.md + concerns/STYLES.md + concerns/OFFLINE.md before starting.
> Do not start until Phase 2 is complete.

---

## Goal

POS checkout: cart, product search, payment methods, receipts, offline cash sales.

---

## Packages To Install

```bash
npm install qrcode
npm install @types/qrcode --save-dev
```

---

## Build Order

### Section 1 — DB schema
- [ ] `lib/db/schema/sales.ts` (sales + sale_items tables)
- [ ] `lib/db/schema/customers.ts`
- [ ] Update `lib/db/schema/index.ts`
- [ ] `lib/db/queries/sales.ts`
- [ ] Run migration

### Section 2 — Zustand stores
- [ ] `store/cartStore.ts`
- [ ] `store/sessionStore.ts`

### Section 3 — Validation
- [ ] `lib/validations/sale.schema.ts`

### Section 4 — API routes
- [ ] `app/api/pos/sale/route.ts` — POST (complete sale)
- [ ] `app/api/pos/void/route.ts` — POST (void sale)
- [ ] `app/api/pos/shift/route.ts` — POST open/close

### Section 5 — Components
- [ ] `components/pos/ProductGrid.tsx`
- [ ] `components/pos/CartPanel.tsx` (Sheet)
- [ ] `components/pos/CartItem.tsx`
- [ ] `components/pos/PaymentModal.tsx`
- [ ] `components/pos/CashPayment.tsx` (change calculator)
- [ ] `components/pos/TransferPayment.tsx` (bank details + QR)
- [ ] `components/pos/ReceiptModal.tsx` (preview + print + WhatsApp)
- [ ] `components/pos/OfflineSaleBanner.tsx`

### Section 6 — Page
- [ ] `app/(dashboard)/pos/page.tsx`

### Section 7 — Offline sale flow
- [ ] Disable non-cash payment buttons when offline
- [ ] Save cash sale to `localDb.pendingSales`
- [ ] Show receipt from local data immediately
- [ ] Register sync listener in dashboard layout

---

## Cart Store Shape

```typescript
interface CartItem {
  productId: string
  name: string
  price: number      // kobo
  quantity: number
}

interface CartStore {
  items: CartItem[]
  discount: number   // 0-100 percentage
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setDiscount: (discount: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
}
```

---

## POS Layout

```
[ Product search + grid — 65% ] [ Cart panel — 35% ]
```

Tablet (md): primary view. Mobile: toggle between grid and cart.

---

## Definition of Done — Phase 3

- [ ] Products searchable and addable to cart
- [ ] Cart shows subtotal, discount, total in naira
- [ ] Cash payment with change calculation
- [ ] Bank transfer shows account details + QR
- [ ] Receipt shown and printable after sale
- [ ] Offline: cash-only mode, sale saved to Dexie
- [ ] Offline sale syncs silently on reconnect
- [ ] Stock decrements after sale
- [ ] `npm run build` passes
