# STYLES.md — Styling & Component Guidelines

> Read this before writing any UI code.
> Official docs: https://tailwindcss.com/docs (v4) | https://ui.shadcn.com/docs

---

## Stack

- **Tailwind CSS v4** — utility-first, CSS-first config (no tailwind.config.js)
- **shadcn/ui** — component primitives in `components/ui/`, never edited directly
- **CSS variables** — design tokens defined in `app/globals.css`

---

## Tailwind v4 — Key Differences From v3

No `tailwind.config.js`. Configuration lives in `globals.css`.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #1D9E75;
  --color-brand-dark: #0F6E56;
  --color-brand-light: #E1F5EE;
  --color-danger: #E24B4A;
  --color-warning: #EF9F27;
  --font-sans: "Inter", sans-serif;
  --radius: 0.5rem;
}
```

- Never create a `tailwind.config.ts`. Ask first if you think you need one.
- Custom tokens go in `@theme {}` inside `globals.css` only.

---

## Design Tokens

```
Brand green:   bg-brand / text-brand / border-brand
Brand dark:    bg-brand-dark
Brand light:   bg-brand-light
Danger:        text-danger / bg-danger/10
Warning:       text-warning / bg-warning/10
Text primary:  text-zinc-900
Text muted:    text-zinc-500
Text hint:     text-zinc-400
Borders:       border-zinc-200 (default) / border-zinc-300 (emphasis)
Backgrounds:   bg-white (card) / bg-zinc-50 (page) / bg-zinc-100 (surface)
Radius:        rounded-md (8px) / rounded-lg (12px) / rounded-xl (16px)
```

---

## shadcn/ui Rules

- Install: `npx shadcn@latest add <component>`
- Never manually edit files in `components/ui/`
- Customise by wrapping in `components/shared/`
- Always use shadcn `toast` for notifications — never `alert()`
- Always use shadcn `Dialog` for modals
- Always use shadcn `Sheet` for side panels

### Phase 1 install command
```bash
npx shadcn@latest init
npx shadcn@latest add button input label card badge dialog sheet sonner dropdown-menu separator skeleton tooltip table form select textarea
```

---

## Component File Structure

```typescript
// components/inventory/ProductCard.tsx
import type { Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatters'

interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return ( /* JSX */ )
}
```

Rules:
- Named exports only. Never `export default` for components.
- Props interface defined above the component, never inline.
- No business logic inside components.
- No direct DB calls inside components.
- No direct API calls — use TanStack Query hooks.

---

## Layout Patterns

```tsx
// Every dashboard page
export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Inventory" description="Manage your products" />
      {/* content */}
    </div>
  )
}

// Card
<div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">

// Metric card
<div className="rounded-md bg-zinc-50 p-4">
  <p className="text-xs text-zinc-500 mb-1">Total sales today</p>
  <p className="text-2xl font-medium text-zinc-900">₦24,500</p>
</div>
```

---

## Currency Formatting

Always use `formatCurrency` from `lib/utils/formatters.ts`. Never format inline.

```typescript
export function formatCurrency(amount: number, currency: 'NGN' | 'USD' = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}
```

---

## Responsive Breakpoints

```
base  — mobile (default)
sm    — 640px small tablets
md    — 768px tablets (POS primary)
lg    — 1024px desktop (dashboard primary)
```

---

## Icons

Use `lucide-react` only. Never install another icon library.

```typescript
import { Package, ShoppingCart, BarChart3 } from 'lucide-react'
```

---

## Dark Mode

NOT required for MVP. Do not add `dark:` classes in Phases 1–8.

---

## Accessibility

- Every interactive element must have an accessible label or `aria-label`
- Form inputs must always have a visible `<label>` linked via `htmlFor`
- Color alone must never convey meaning
- Focus rings must be visible — never `outline-none` without a replacement
