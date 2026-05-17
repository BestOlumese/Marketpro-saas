# PHASE-9-POLISH.md — PWA, Performance & Final QA

> Read AGENTS.md before starting.
> Do not start until Phase 8 is complete.

---

## Goal

Production-ready: PWA manifest, performance, error boundaries, final QA.

---

## Packages To Install

```bash
npm install next-pwa
```

---

## Build Order

### PWA
- [ ] `public/manifest.json`
- [ ] Configure `next-pwa` in `next.config.ts`
- [ ] `public/icons/icon-192.png` and `icon-512.png`
- [ ] Test: installable on Android Chrome

### Error boundaries
- [ ] `app/error.tsx`
- [ ] `app/(dashboard)/error.tsx`

### Performance
- [ ] All images use `next/image`
- [ ] Dynamic imports for recharts and AI panel
- [ ] Check `next build` output — no page over 500kb first load JS

### Final QA checklist
- [ ] Test on Android Chrome tablet and phone
- [ ] Test on desktop Chrome
- [ ] Offline: mid-sale, browse products, today's sales
- [ ] All three roles: admin, manager, cashier
- [ ] All Paystack plan tiers
- [ ] `npm run build` zero warnings
- [ ] `npm run lint` zero errors
- [ ] All env vars in `.env.example`
- [ ] Deployed to production DigitalOcean

---

## Done = App Complete
