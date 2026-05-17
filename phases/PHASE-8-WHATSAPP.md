# PHASE-8-WHATSAPP.md — WhatsApp Integration

> Read AGENTS.md + concerns/API.md before starting.
> Do not start until Phase 7 is complete.

---

## Goal

WhatsApp receipts, low-stock alerts, weekly digest via Twilio.

---

## Packages To Install

```bash
npm install twilio
```

---

## Environment Variables

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Build Order

- [ ] `lib/twilio/whatsapp.ts` — sendWhatsAppMessage helper
- [ ] `lib/twilio/templates.ts` — message template strings
- [ ] `app/api/whatsapp/receipt/route.ts`
- [ ] `app/api/whatsapp/alert/route.ts`
- [ ] `app/api/whatsapp/digest/route.ts`
- [ ] Update POS ReceiptModal — add "Send via WhatsApp" button
- [ ] Update low-stock alert — offer WhatsApp notification

---

## Message Templates

```
Receipt:
*MarketPro Receipt*
Shop: {shopName}
Date: {date}
---
{items}
---
Total: ₦{total}
Payment: {method}
Thank you!

Low stock:
*Low Stock Alert — MarketPro*
{productName} is running low.
Stock: {stock} units (reorder at {lowStockAt})
```

---

## Definition of Done — Phase 8

- [ ] WhatsApp receipt sends after sale (if phone provided)
- [ ] Low-stock alert sends when stock drops below threshold
- [ ] Weekly digest can be triggered manually
- [ ] `npm run build` passes
