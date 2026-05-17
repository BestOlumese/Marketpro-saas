# PHASE-5-STAFF.md — Staff & Shift Management

> Read AGENTS.md + concerns/AUTH.md before starting.
> Do not start until Phase 4 is complete.

---

## Goal

Staff management: invite via Clerk, manage roles, open/close shifts, per-staff sales.

---

## Build Order

### Section 1 — DB schema & queries
- [ ] `lib/db/schema/shifts.ts`
- [ ] `lib/db/queries/staff.ts`
- [ ] `lib/db/queries/shifts.ts`
- [ ] Run migration

### Section 2 — API routes
- [ ] `app/api/staff/route.ts` — GET, POST (invite)
- [ ] `app/api/staff/[id]/route.ts` — PATCH, DELETE
- [ ] `app/api/shifts/route.ts` — GET, POST open
- [ ] `app/api/shifts/[id]/close/route.ts` — POST close + reconcile

### Section 3 — Components
- [ ] `components/staff/StaffTable.tsx`
- [ ] `components/staff/InviteStaffModal.tsx`
- [ ] `components/staff/ShiftCard.tsx`
- [ ] `components/staff/ShiftHistory.tsx`
- [ ] `components/staff/RoleBadge.tsx`

### Section 4 — Pages
- [ ] `app/(dashboard)/staff/page.tsx`
- [ ] `app/(dashboard)/staff/shifts/page.tsx`

---

## Definition of Done — Phase 5

- [ ] Owner can invite staff via email
- [ ] Roles enforced: cashier cannot access staff management
- [ ] Shift open/close with cash reconciliation
- [ ] Per-staff sales visible in staff detail
- [ ] `npm run build` passes
