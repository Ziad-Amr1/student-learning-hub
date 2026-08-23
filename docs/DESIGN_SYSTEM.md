# Design System — Huby

The design system is the shared visual and UI foundation for all pages
(Dashboard, Tasks, Notes, Resources, Profile). It is intentionally small,
explicit, and token-driven: since Sprint 02.6 it is delivered through
**Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first) with all approved
values defined once in the `@theme` block of `src/styles/app.css`.

> **Brand:** Huby — Your Personal Hub for Students. The visual voice is
> friendly, calm, modern, organized, and personal: soft organic tints,
> generous whitespace, restrained elevation. Anything that reads as generic
> enterprise SaaS (cold blue/indigo/purple defaults, dense data grids,
> aggressive gradients/glassmorphism) is off-brand by definition.
> TechMaster is the course context, not part of the product identity.

> Source of truth: the `@theme` block in `src/styles/app.css`. Every token
> there is emitted as a real CSS custom property under its historical name
> and generates matching utilities (`--color-primary` → `bg-primary`). This
> document explains the system; the two must be updated together.

---

## 1. Design Principles

1. **Usability over decoration** — hierarchy, spacing, and contrast first.
2. **Tokens, never magic values** — components consume semantic CSS variables;
   hardcoded colors/arbitrary values are not allowed in components.
3. **Semantic HTML first** — native elements (`button`, `input`, `label`, `h1`)
   before ARIA.
4. **Composition over configuration** — Card composes from small parts instead
   of one component with many boolean props.
5. **Restrained visual language** — flat surfaces, 1px borders, shadows used
   sparingly (cards at rest only), no gradients/glassmorphism/excess animation.
6. **Mobile-first responsive** — start small, scale up via documented
   breakpoints.
7. **Light theme only for now** — dark mode/theming engines are not scheduled.
8. **Proportional rhythm** — spacing, type, radius, and icon sizes all derive
   from a single 4px base unit, so the scales read as one system rather than
   independently-chosen numbers. See §3–§5.

---

## 2. Color Tokens

Semantic palette: sage green (primary), muted teal (accent), warm stone
(secondary/neutrals) — an organic, calm palette suited to a student
productivity app, rather than a generic SaaS blue/indigo default. Semantic
states ship in three steps: `base` (fills/icons) → `strong` (text on white or
soft backgrounds) → `soft` (tinted backgrounds).

| Role | Token(s) | Value | Usage |
| --- | --- | --- | --- |
| App background | `--color-background` | `#f7f8f5` | Page background |
| Default text | `--color-foreground` | `#263124` | Body/headings |
| Surface | `--color-surface` | `#ffffff` | Cards, inputs |
| Surface muted | `--color-surface-muted` | `#eef1ea` | Hover fills, tracks |
| Primary | `--color-primary`, `-hover`, `-strong`, `-soft`, `-foreground` | sage green | Primary actions, active nav, default progress |
| Secondary | `--color-secondary`, `-hover`, `-strong`, `-foreground` | warm stone | Secondary buttons/surfaces |
| Accent | `--color-accent`, `-strong`, `-soft`, `-foreground` | muted teal | Non-destructive emphasis/highlights |
| Muted text | `--color-muted-foreground` (+ `--color-muted`) | stone | Secondary text |
| Border / input | `--color-border`, `--color-input` | stone | 1px borders / input borders |
| Focus ring | `--color-ring` + `--ring-soft` | sage green | `:focus-visible` outline + soft glow |
| Success | `--color-success`, `-strong`, `-soft` | brighter leaf green | Completed/done states |
| Warning | `--color-warning`, `-strong`, `-soft` | ochre | Due-soon/caution states |
| Destructive | `--color-destructive`, `-hover`, `-strong`, `-soft`, `-foreground` | terracotta | Errors, delete actions |
| Info | `--color-info`, `-strong`, `-soft` | dusty blue | Neutral-informational states |

Exact values (`tokens.css` is the source of truth — this is a reference):

| Token | Hex |
| --- | --- |
| `--color-primary` / `-hover` / `-strong` / `-soft` | `#4f6b3f` / `#3f5a30` / `#33452a` / `#e4eadc` |
| `--color-secondary` / `-hover` / `-strong` | `#e4e7de` / `#d3d8c9` / `#3a3f37` |
| `--color-accent` / `-strong` / `-soft` | `#4f6360` / `#33413e` / `#dce6e4` |
| `--color-success` / `-strong` / `-soft` | `#4a7530` / `#2f4a1f` / `#e3edda` |
| `--color-warning` / `-strong` / `-soft` | `#b8863b` / `#7a5a22` / `#f3e8d2` |
| `--color-destructive` / `-hover` / `-strong` / `-soft` | `#b23b3b` / `#922f2f` / `#7a2a29` / `#f3dedc` |
| `--color-info` / `-strong` / `-soft` | `#4a6b8a` / `#33506b` / `#dce6ed` |

Why each role landed where it did:
- **Primary (sage)** is deliberately muted — it lives in the chrome all day
  (nav, buttons) without shouting, and `#4f6b3f` clears 6:1 against white so
  it works as a filled button with white text.
- **Success** uses a brighter, more yellow-leaning green from the same
  family rather than a different hue — it should read as "growth" and stay
  clearly distinct from the quieter primary sage.
- **Warning (ochre)** and **destructive (terracotta)** are warm, earthy
  variants of the conventional amber/red — still instantly legible as
  caution/error, without breaking the palette's mood with a stock
  traffic-light color.
- **Info (dusty blue)** keeps a neutral, desaturated read so "informational"
  doesn't compete visually with primary.
- **Secondary (warm stone)** follows the original pattern: a light neutral
  fill with dark text, not a colored fill — it's for supporting actions that
  shouldn't compete with primary.

Contrast rules:
- Text on white/soft backgrounds always uses the `*-strong` variant; all such
  pairs meet WCAG AA (≥ 4.5:1 body text).
- Filled controls use base color with white/near-white foreground where AA-passing
  (primary, info, destructive — each ≥ 5.5:1 against white); warning/success
  fills are reserved for graphics (progress bars) or paired with `*-strong`
  text on `*-soft`, same as before.
- Color-lightness steps are chosen to hit these contrast targets, not a
  perceptual/proportional curve — accessibility wins over strict math here.
  See §11 for the reasoning.

---

## 3. Typography

Font family token `--font-sans`: system UI stack (no webfont dependency).

Sizes follow a **1.25 modular scale (major third)**, anchored at the 16px
body size and rounded to the 4px spacing grid — so every heading size is
also a spacing token:

| Style | Token | Size | Weight | Line height | Applied by |
| --- | --- | --- | --- | --- | --- |
| Display | `--font-size-display` | 48px (`space-12`) | bold | tight 1.15 | `.text-display` class |
| H1 | `--font-size-h1` | 40px (`space-10`) | bold | heading 1.25 | `<h1>` (PageHeader) |
| H2 | `--font-size-h2` | 32px (`space-8`) | semibold | 1.25 | `<h2>` |
| H3 | `--font-size-h3` | 24px (`space-6`) | semibold | 1.25 | `<h3>`, CardTitle |
| H4 | `--font-size-h4` | 20px (`space-5`) | semibold | 1.25 | `<h4>` |
| Body | `--font-size-body` | 16px (`space-4`) | regular | body 1.6 | default — the scale's anchor |
| Small | `--font-size-small` | 14px | regular | small 1.55 | `.text-body-small` |
| Caption | `--font-size-caption` | 12px (`space-3`) | medium | small | `.text-caption` |
| Label | `--font-size-small` | 14px | medium | small | `.text-label` |

Small (14px) intentionally breaks the pure ratio — going smaller than 14px
for regular UI text risks legibility, so the scale is capped at body and
Small/Caption exist as a practical floor rather than a proportion.

Weights available: `--font-weight-{regular:400, medium:500, semibold:600, bold:700}`.
Base element styles for `h1–h4` live in `global.css`; utility classes cover the
non-heading levels. Never set ad-hoc font sizes in components.

---

## 4. Spacing Scale

Token number × 4 = px value. Only these values for margin/padding/gap:

| Token | px | Token | px | Token | px | Token | px |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `--space-1` | 4 | `--space-5` | 20 | `--space-10` | 40 | `--space-16` | 64 |
| `--space-2` | 8 | `--space-6` | 24 | `--space-12` | 48 | `--space-20` | 80 |
| `--space-3` | 12 | `--space-8` | 32 | | | | |
| `--space-4` | 16 | | | | | | |

`--space-5` (20px) fills what was previously a gap between 16 and 24 — it's
the base unit `--icon-md` and `--font-size-h4` both derive from, so the type
scale and spacing scale share one grid instead of running as two disconnected
systems.

Layout conventions: section rhythm `--layout-section-gap` (48px); card/grid
gaps `--layout-card-gap` (24px); page horizontal padding handled by Container.

## 5. Radius Scale

Now fully on the 4px spacing grid (previously `--radius-sm` was 6px, an
off-grid outlier):

| Token | Value | Typical usage |
| --- | --- | --- |
| `--radius-sm` | 4px (`space-1`) | Small controls |
| `--radius-md` | 8px (`space-2`) | Buttons, inputs |
| `--radius-lg` | 12px (`space-3`) | Cards |
| `--radius-xl` | 16px (`space-4`) | Large panels/modals (future) |
| `--radius-full` | 9999px | Badges, avatars, progress |

## 5a. Icon Sizes

Icon system: **`lucide-react`** is the project's single icon library
(Sprint 02 refinement decision — do not mix other icon sets or use emoji as
UI icons). Icons are sized via these tokens — since Sprint 02.6 applied as
utilities on the icon (`w-(--icon-md) h-(--icon-md)`) rather than
descendant selectors in component CSS, so sizing stays token-driven:

| Token | Value | Usage |
| --- | --- | --- |
| `--icon-sm` | 16px (`space-4`) | Inline with body/small text |
| `--icon-md` | 20px (`space-5`) | Default button/nav icons |
| `--icon-lg` | 24px (`space-6`) | Section headers, empty states, menu/close controls |

## 6. Shadow Scale (use sparingly)

| Token | Effect | Usage |
| --- | --- | --- |
| `--shadow-none` | none | Flat elements (default) |
| `--shadow-sm` | subtle | Cards at rest |
| `--shadow-md` | elevated | Hovered/raised cards (future) |
| `--shadow-lg` | floating | Overlays/tooltips (Sprint 14+) |

Shadow color is tinted from `--color-foreground` (`#263124`) rather than a
neutral black, so elevation reads warm/organic rather than cold. Shadow
blur/spread values are chosen for visual weight, not the spacing grid — same
reasoning as color lightness steps in §2.

## 7. Breakpoints

Mobile-first. Values are repeated as raw px inside `@media` (CSS variables
don't work there); source of truth = this table + comment block in tokens.css.
Breakpoints follow standard device widths, not a proportional scale.

| Name | Min width | Target |
| --- | --- | --- |
| (default) | 0 | Mobile |
| sm | ≥ 640px | Large phone / small tablet |
| md | ≥ 768px | Tablet |
| lg | ≥ 1024px | Laptop / desktop sidebar appears (Sprint 02+) |
| xl | ≥ 1280px | Large desktop |

Tailwind's default breakpoints equal these widths exactly, so no custom
breakpoint tokens are defined.

### Motion & layering (added in Sprint 02.6)

- `--ease-standard: ease` — the standard curve; transitions use
  `ease-standard` plus Tailwind's numeric duration scale
  (`duration-150`/`duration-200`, matching the previous literals).
  Durations deliberately have no custom tokens.
- `--ring-destructive-soft: rgba(178, 59, 59, 0.14)` — destructive focus
  glow; hue derives from `--color-destructive` (fixes the pre-Tailwind
  drift where the error ring used a non-token red).
- `--z-nav: 10`, `--z-skip-link: 100` — layering scale for fixed bars and
  the skip link (previously raw literals); the drawer uses the native
  dialog top layer.

## 8. Layout Conventions

- **Container:** max width `--layout-container-max` (72rem / 1152px;
  renamed from `--container-max` in Sprint 02.6 — `--container-*` is a
  reserved Tailwind namespace), centered, horizontal padding 16 → 24 (md)
  → 32 (lg). Exception: inside the AppShell
  grid (≥ lg) the page container is anchored to the main track's inline
  start (`margin-inline: 0`) so sidebar-collapse width flows into content
  position instead of into symmetric gutters — Container still owns the
  width cap and gutters; AppShell owns how the column sits in the grid.
- **Page anatomy:** `Container` → `PageHeader` (title + optional description +
  actions) → content sections separated by `--layout-section-gap`.
- **Grids:** card grids use CSS grid with `repeat(auto-fill/fit, minmax(...))`
  and `--layout-card-gap`; no fixed pixel widths on components.
- **Shell dimensions (Sprint 02):** navbar height `--layout-navbar-height`
  (64px), desktop sidebar width `--layout-sidebar-width` (240px) with a
  collapsed icon-rail state at `--layout-sidebar-width-collapsed` (64px),
  mobile bottom-nav height `--layout-mobilenav-height` (64px) — all on the
  4px grid. The shell is one CSS grid (`navbar` / `sidebar` / `main` areas):
  the sidebar spans the full viewport height at lg, and main content offsets
  by the mobile-nav height so fixed bars never cover content. Modal layers
  (mobile navigation drawer) dim the page with `--color-scrim`.

---

## 9. Component Principles & Specs

Shared API conventions: `variant` · `size` · `disabled` · `className`;
unknown props spread to the root native element. Registry with exact props:
see `docs/COMPONENTS.md`.

### Button (`components/ui/Button.jsx`)
- **Purpose:** triggers actions. Native `<button>` (type defaults to `"button"`).
- **Polymorphic `as` prop (Sprint 02.5):** pass `as={Link} to="…"` or
  `as="a" href="…"` to render navigation as an anchor wearing the full
  button system — the ONLY approved way to make a link look like a button
  (never hand-write raw button utilities on a link; rendering through this
  primitive keeps the button system single-sourced). `type`/`disabled` apply to
  native buttons only; disabled links need explicit `aria-disabled`.
- **Variants:** `primary` (main action, one per view) · `secondary` (supporting)
  · `outline` (on non-surface backgrounds) · `ghost` (low-emphasis/inline)
  · `destructive` (delete/remove).
- **Sizes:** sm / md / lg. **States:** hover, active, disabled (opacity + not-allowed),
  focus-visible ring.
- **A11y:** real button semantics; icon-only usage must include an accessible
  label via props (`aria-label`) passed through. Navigation stays semantic:
  `<Link>`/anchor via `as`, button semantics only for true actions.
- **Known condition (flagged, not changed):** `outline` border uses
  `--color-input`, which is below the 3:1 non-text guideline even on white;
  revisit as a design-system decision before outline sees heavy use.

### Card (`components/ui/Card.jsx`)
- **Purpose:** grouped content surface. Compose: `Card > CardHeader
  (CardTitle + CardDescription) + CardContent + CardFooter`.
- **Visual:** surface bg, 1px border, radius-lg, shadow-sm, padding space-6.
- **Rules:** never hardcode feature content into Card parts; footer pins to
  bottom via flex.

### Input / Textarea (`components/ui/Input.jsx`, `Textarea.jsx`)
- **Purpose:** labelled single/multi-line text entry.
- **Props:** `label` (required), `error`, `id?` (auto via `useId`), plus all
  native attributes.
- **States:** focus (border + soft ring), error (red border + message),
  disabled, placeholder.
- **A11y:** `<label htmlFor>` always rendered; errors linked via
  `aria-describedby` + `aria-invalid`. No complete forms are built by these
  components themselves.

### Badge (`components/ui/Badge.jsx`)
- **Purpose:** compact status/category labels (task priority/status, resource
  category, learning states).
- **Variants:** `default` (primary tint) · `secondary` · `success` · `warning`
  · `danger` · `info` · `outline`.
- **Rules:** pick variant by meaning, not looks; caption size, pill radius.

### Avatar (`components/ui/Avatar.jsx`)
- **Purpose:** user/student representation.
- **Behavior:** renders `img` when `src` provided; otherwise initials derived
  from `name` (first letters of up to 2 words); `title={name}` tooltip.
- **Sizes:** sm 32 / md 40 / lg 48 (`space-8`/`space-10`/`space-12` — `lg` was
  56px, now on-grid). **Rules:** no specific person hardcoded; empty name
  falls back to `?`.

### Separator (`components/ui/Separator.jsx`)
- **Purpose:** thin divider between content groups.
- **Orientation:** `horizontal` (default, full width) | `vertical`
  (self-stretch — parent should be flex). Rendered as `<hr role="separator">`.

### ProgressBar (`components/ui/ProgressBar.jsx`)
- **Purpose:** completion toward a maximum (courses, goals, storage).
- **Props:** `value`, `max=100`, `label` (**required**, screen-reader name),
  `variant`: primary | success | warning | danger.
- **A11y:** `role="progressbar"` + `aria-valuemin/max/now`; value clamped.

### Container (`components/layout/Container.jsx`)
- **Purpose:** consistent page width/centering/responsive padding.
- **Props:** `as` (default `"div"`), standard passthroughs.

### PageHeader (`components/layout/PageHeader.jsx`)
- **Purpose:** standard page intro: h1 title, optional description, optional
  action buttons row (wraps below title on narrow screens).
- **Rules:** one per page; do not hardcode any page's content into it.

### Planned primitives (do not exist yet — build only in their Sprint)
`AppShell`, `Navbar`, `Sidebar`, `MobileNav` (Sprint 02) · `EmptyState`
(Sprint 08) · Tooltip/Dropdown/Dialog/Drawer/Toast/Skeleton/Tabs/Breadcrumb
(Sprint 14, value-permitting).

---

## 10. Accessibility Foundation

- Global `:focus-visible` ring (token-based); inputs use border+glow focus.
- Form labels mandatory; errors announced via linked description.
- Progress needs a human label; separators expose orientation when vertical.
- Contrast per §2; animations respect `prefers-reduced-motion`.
- Keyboard operability is a Definition-of-Done item for every component.

---

## 11. Proportional System (audit notes)

The system is built on a **4px base unit**: spacing, the type scale (§3),
icon sizes (§5a), and radius (§5) all resolve to multiples of it, so a
heading size, a padding value, and an icon size can share one token where it
makes sense (`--font-size-h4` and `--icon-md` are both `--space-5`).

This is a **modular/additive grid system**, not the Golden Ratio (φ ≈ 1.618).
φ was considered and deliberately not used: it compounds too fast for a
data-dense dashboard that needs several close, legible steps (body/small/
caption/label coexisting), and a couple of incidental values in the old
scale (radius's 1.5×/1.33× jumps) never held consistently enough to count as
a real proportional system. The 1.25 modular scale in §3 gives type a stated,
consistent rule instead.

Two things are deliberately **exempt** from the grid, for reasons that
outrank proportion:
- **Color lightness steps** (§2) — chosen to hit WCAG contrast targets, not
  a perceptual curve. Accessibility wins over mathematical purity here.
- **Breakpoints** (§7) — standard device widths, not proportional by nature.