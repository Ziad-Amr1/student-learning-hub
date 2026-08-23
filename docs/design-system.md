# TechMaster Student Hub — Design System

The design system is the shared visual and UI foundation for all pages
(Dashboard, Tasks, Notes, Resources, Profile). It is intentionally small,
explicit, and built with **plain CSS custom properties** — no CSS framework.

---

## 1. Design Principles

1. **Usability over decoration** — hierarchy, spacing, and contrast come first.
2. **Tokens, never magic values** — components consume semantic CSS variables;
   hardcoded colors or arbitrary pixel values are not allowed in components.
3. **Semantic HTML first** — native elements (`button`, `input`, `label`, `h1`)
   before ARIA.
4. **Composition over configuration** — e.g. Card is composed from small parts
   instead of one component with many boolean props.
5. **Restrained visual language** — flat surfaces, 1px borders, shadows used
   sparingly (cards only), no gradients or glassmorphism.
6. **Mobile-first responsive** — layouts start small and scale up via
   documented breakpoints.

---

## 2. Color Tokens

Defined in `src/styles/tokens.css`. Semantic states ship in three steps:
`base` (fills/icons) → `strong` (text on white/soft backgrounds) → `soft`
(tinted backgrounds).

| Token | Value | Usage |
| --- | --- | --- |
| `--color-background` | `#f8fafc` | App background |
| `--color-foreground` | `#0f172a` | Default text |
| `--color-surface` | `#ffffff` | Cards, inputs |
| `--color-surface-muted` | `#f1f5f9` | Hover fills, progress track |
| `--color-primary` / `-strong` / `-soft` | indigo | Primary actions, active states |
| `--color-primary-foreground` | `#ffffff` | Text on primary |
| `--color-secondary` / `-foreground` | slate | Secondary buttons/surfaces |
| `--color-accent` / `-strong` / `-soft` | teal | Highlights, non-destructive emphasis |
| `--color-muted` / `--color-muted-foreground` | slate | Secondary text |
| `--color-border` / `--color-input` | slate | Borders / input borders |
| `--color-ring` + `--ring-soft` | indigo | Focus ring (+ soft glow) |
| `--color-success` / `-strong` / `-soft` | green | Success states |
| `--color-warning` / `-strong` / `-soft` | amber | Warning states |
| `--color-destructive` / `-hover` / `-strong` / `-soft` | red | Errors, destructive actions |
| `--color-info` / `-strong` / `-soft` | blue | Informational states |

Contrast rule: text uses `*-strong` variants on white or `*-soft`
backgrounds; all pairings meet WCAG AA (≥ 4.5:1 for body text).
Dark mode is out of scope for now (future sprint).

---

## 3. Typography Scale

Font stack: `--font-sans` (system UI stack — no webfont dependency).

| Style | Token size | Weight | Line height | Applied by |
| --- | --- | --- | --- | --- |
| Display | `--font-size-display` 44px | bold | tight (1.15) | `.text-display` |
| H1 | 36px | bold | heading (1.25) | `<h1>` / PageHeader |
| H2 | 28px | semibold | heading | `<h2>` |
| H3 | 22px | semibold | heading | `<h3>` / CardTitle |
| H4 | 18px | semibold | heading | `<h4>` |
| Body | 16px | regular | body (1.6) | default |
| Body Small | 14px | regular | small (1.55) | `.text-body-small` |
| Caption | 12px | medium | small | `.text-caption` |
| Label | 14px | medium | small | `.text-label` |

Headings have base styles in `global.css`; use the utility classes for
non-heading text levels. Never set ad-hoc font sizes in components.

---

## 4. Spacing Scale

Token number × 4 = px value. Only these values may be used for margins,
padding, and gaps:

| Token | px | | Token | px |
| --- | --- | --- | --- | --- |
| `--space-1` | 4 | | `--space-10` | 40 |
| `--space-2` | 8 | | `--space-12` | 48 |
| `--space-3` | 12 | | `--space-16` | 64 |
| `--space-4` | 16 | | `--space-20` | 80 |
| `--space-6` | 24 | | | |
| `--space-8` | 32 | | | |

Layout conventions:
- Section vertical rhythm: `--layout-section-gap` (48px)
- Gaps between cards/grids: `--layout-card-gap` (24px)
- Page horizontal padding is handled by `Container`.

---

## 5. Radius Scale

| Token | Value | Typical usage |
| --- | --- | --- |
| `--radius-sm` | 6px | Small controls |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards |
| `--radius-xl` | 16px | Large panels/modals (future) |
| `--radius-full` | 9999px | Badges, avatars, progress bars |

## Shadow Scale

Use sparingly — elevation should be rare, mostly cards.

| Token | Usage |
| --- | --- |
| `--shadow-none` | Flat elements |
| `--shadow-sm` | Cards at rest |
| `--shadow-md` | Hovered/dragged cards (future) |
| `--shadow-lg` | Overlays/tooltips (future) |

---

## 6. Breakpoints

Mobile-first. Media query values are repeated as raw px because CSS custom
properties don't work inside `@media`; the source of truth lives here and in
the comment block in `tokens.css`.

| Name | Min width | Target |
| --- | --- | --- |
| (default) | 0 | Mobile |
| sm | ≥ 640px | Large phone / small tablet |
| md | ≥ 768px | Tablet |
| lg | ≥ 1024px | Laptop |
| xl | ≥ 1280px | Desktop |

Components must avoid fixed widths; prefer fluid widths, `flex-wrap`, and
auto-fit grids.

---

## 7. Component Inventory

### UI primitives — `src/components/ui/`

| Component | Key props | Notes |
| --- | --- | --- |
| `Button` | `variant`: primary \| secondary \| outline \| ghost \| destructive · `size`: sm \| md \| lg · `disabled` | Native `<button>`, spreads extra props |
| `Card` (+ `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) | `className` | Composition-based surface |
| `Input` | `label`, `error`, `id`, …native props | Auto-generated id via `useId` |
| `Textarea` | `label`, `error`, `rows`, `id`, …native props | Same API as Input |
| `Badge` | `variant`: default \| secondary \| success \| warning \| danger \| info \| outline | For status/priority labels |
| `Avatar` | `src?`, `name?`, `size`: sm \| md \| lg | Image or initials fallback |
| `Separator` | `orientation`: horizontal \| vertical | Thin border-colored rule |
| `ProgressBar` | `value`, `max=100`, `label`, `variant`: primary \| success \| warning \| danger | `role="progressbar"`, label required |

### Layout — `src/components/layout/`

| Component | Key props | Notes |
| --- | --- | --- |
| `Container` | `as` (default `"div"`) | Max width + centered + responsive padding |
| `PageHeader` | `title`, `description?`, `actions?` | Standard page intro block |

Shared helper: `cx(...classes)` in `src/utils/cx.js` joins conditional class names.

---

## 8. Component Usage Principles

- Consume tokens (`var(--space-4)`), never raw values (`16px`).
- Pick a variant that matches *meaning*, not aesthetics
  (destructive actions → `variant="destructive"`, status → Badge semantic variant).
- Compose layout from `Container` + spacing tokens instead of custom wrappers.
- Keep feature styling in page-level CSS; extend the design system only when
  a pattern repeats across pages.
- Every `ProgressBar` needs a human-readable `label` for screen readers.

## 9. Accessibility Principles

- Native semantic elements first; ARIA only where semantics can't express it.
- Visible focus: global `:focus-visible` ring using `--color-ring`;
  inputs use a border + soft glow focus style.
- Form controls always render a `<label>` tied with `htmlFor`/`id`;
  errors link via `aria-describedby` and set `aria-invalid`.
- `ProgressBar` exposes `aria-valuemin/max/now` plus `aria-label`.
- Text/background pairs meet WCAG AA contrast (use `*-strong` on `*-soft`).
- Animations respect `prefers-reduced-motion`.
