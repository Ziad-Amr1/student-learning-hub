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

Exact values (`src/styles/app.css` is the source of truth — this is a reference):

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

### Semantic card tints & correctness (Sprint 07.5, regression-corrected 2026-08-27)

**Visual hierarchy (project-wide) for every semantic card state:**

    strong semantic Badge / state indicator
    ↓
    medium "clear" state border or icon
    ↓
    very subtle semantic card background tint

The card background *reinforces* the state; it must never compete with or
merge into the Badge. Badge/indicator and card tint must never share the same
visual intensity. Audit each state combination (Badge color vs border/icon
color vs tint) — and never assume one opacity value is perceptually correct
for every semantic hue.

Precise rule for state backgrounds on `Card` surfaces:

- Card-level semantic tints are **`*-soft` at 20% opacity WITH the Tailwind
  prefix `!` important form**: `!bg-warning-soft/20`, `!bg-info-soft/20`,
  `!bg-success-soft/20`, `!bg-destructive-soft/20`, pinned
  `!bg-accent-soft/20` (≈ `#fbf7ef` over the card — genuinely subtle). Both
  halves are required, and each alone is wrong:
  - **`bg-*-soft/20` without `!`** loses the cascade: Tailwind v4 sorts
    utilities alphabetically, so the plain rule lands before `Card`'s
    `bg-surface` and the later rule wins at equal specificity.
  - **`!bg-*-soft` full-opaque** passes the cascade but renders at the full
    `-soft` value — the Badge's own background. The card tint becomes as
    intense as the Badge and the hierarchy collapses.
  `!w-auto` is the project precedent for the "override the primitive" form.
- The generated sheet also contains inert companion rules for these utilities
  (color-mix fallbacks, a full-opacity `!bg-accent-soft`); no component emits
  those plain classes, so ignore them in audits. Verify presence of the
  `\!`important `/20` rule for a class, not just any `bg-*-soft` match.
- **API (single source of truth):** status, priority, and pinned visual
  classes are pure string constants in `src/constants/cardStatus.js`
  (`PRIORITY_VARIANT`, `STATUS_VISUALS`, `PINNED_CARD_VISUAL`,
  `PIN_BUTTON_ACTIVE_CLASSES`).
  Icons stay in `StatusDropdown` (React components must not live in
  constants/utils).
- **Task status card tints (TaskCard — same mapping as StatusDropdown):**

  | Status | Badge variant | Left border | Card tint |
  | --- | --- | --- | --- |
  | `unstarted` | `accent` | `border-l-accent/40` (subtle) | none |
  | `in-progress` | `warning` | `border-l-warning` | `!bg-warning-soft/20` |
  | `deferred` | `info` | `border-l-info` | `!bg-info-soft/20` |
  | `done` | `success` | `border-l-success` | `!bg-success-soft/20` |
  | `cancelled` | `danger` | `border-l-destructive` | `!bg-destructive-soft/20` |

  **`in-progress = warning` is a deliberate product decision from the 07.5
  regression review** (user instruction; supersedes the earlier "in-progress is
  accent, warning is time-caution-only" rule). Status meaning is never carried
  by tint/border/badge alone — icon + text label always accompany the color.
- **Pinned cards (Notes + Resources, all view modes):** `PINNED_CARD_VISUAL`
  = `borderClass: border-l-2 border-l-accent` + `bgClass: !bg-accent-soft/20`.
- **Pinned pin-button active state:** `PIN_BUTTON_ACTIVE_CLASSES` =
  `!bg-primary-soft text-primary-strong
  hover:not-disabled:!bg-primary-soft/80` + filled Pin (`fill-current`) +
  `aria-pressed`. The `!` matters: ghost's `bg-transparent` and
  `hover:bg-surface-muted` sort later and otherwise win, making the active
  pin button indistinguishable from the unpinned one. The full `-soft` is
  correct here — the button is a control/interaction state (must read as
  active); the "subtle tint" rule applies to card backgrounds, not controls.
- **Warning semantics:** `warning` maps to the `in-progress` task status
  (see above) plus the resource `video` category badge. The per-hue 20%
  is applied uniformly; perceptual strength may vary slightly per `-soft`
  value — acceptable, since Badges stay opaque and the tint is the weakest
  rung of the hierarchy either way.
- **Learning goal statuses (LearningEntry, Sprint 07.6) — single source**
  `LEARNING_STATUS_VISUALS` in `src/constants/learningStatus.js` (same
  pure-string-constant pattern as `cardStatus.js`). After the 07.6
  refinement statuses own **no card border** — the card's accent `border-l-2`
  + accent tint belong to **pinning exclusively** (`PINNED_CARD_VISUAL`), so
  a pinned `in-progress` card can never collide with the status accent:

  | Status | Badge variant | Card tint |
  | --- | --- | --- |
  | `not-started` | `secondary` | none |
  | `in-progress` | `accent` (badge only) | none |
  | `paused` | `info` | `!bg-info-soft/20` |
  | `completed` | `success` | `!bg-success-soft/20` |

  `in-progress = accent` is a **badge-level** decision here, deliberate and
  distinct from the task status mapping (no time-caution semantics exist for
  learning goals, so `warning` stays free). At the **card level**, `accent`
  means Pinned: `PINNED_CARD_VISUAL` = `border-l-2 border-l-accent` +
  `!bg-accent-soft/20` — the two accent uses never overlap because
  `in-progress` carries no card tint and statuses carry no border. Completed
  goals additionally render their ProgressBar in `success` (and progress is
  locked at 100 — see DATA_MODEL.md normalization). Cards carry the status
  Badge text always — color never carries state alone; the Badge > tint
  hierarchy above holds.
- **Learning sorting + pinned ordering (07.6 refinement):** the Learning page
  has a transient module-local sort control — Manual order / Newest first /
  Recently updated / Progress / Title A–Z — on its ModuleToolbar (Tasks
  pattern): sorting is UI state only, NOT persisted, and the
  `student-hub:learning` array keeps storage order. Pinned entries always
  rank first in any mode (Notes/Resources pattern), then the selected
  comparator via `sortLearningEntries` in `src/utils/learning.js`
  (deterministic createdAt/updatedAt tie-breaks). Sorting is applied BEFORE
  the Currently-Learning / Other status grouping, so both sections share the
  same ordering.
- **Learning card rhythm (07.6 refinement):** Row 1 = title + pin/edit/delete
  actions; Row 2 = category + status Badges (`size="sm"` compact); Row 3 =
  ProgressBar; Row 4 = context-aware units + updated date; then LinkedItems.
  Context-aware units (`formatLearningUnits`): course/practice/topic →
  `"X of Y hrs"`; book → `"X of Y pages"` (completed derived from
  `progress` × `totalPages`); video → formatted duration of `videoMinutes`
  e.g. `"2h"`.

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
| Micro | `--font-size-micro` | 10px | medium | small | Badge `size="sm"` — metadata/UI-only, NOT a body-text level |
| Label | `--font-size-small` | 14px | medium | small | `.text-label` |

Small (14px) intentionally breaks the pure ratio — going smaller than 14px
for regular UI text risks legibility, so the scale is capped at body and
Small/Caption exist as a practical floor rather than a proportion.
`--font-size-micro` (10px) sits BELOW that floor as a metadata/UI-only rung:
reserved for compact informational elements such as `Badge size="sm"` —
never body or heading content. All other text levels stay at or above 12px.

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
don't work there); source of truth = this table + comment block in
`src/styles/app.css`.
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
- `--z-toolbar: 5` — sticky ModuleToolbar below navbar.
- `--z-nav: 10` — sticky Navbar.
- `--z-skip-link: 100` — skip-to-content link.
- Native `<dialog>` top layer handles modal/drawer stacking.
- Full layering spec: `docs/LAYERING_SYSTEM.md`.

## 8. Layout Conventions

- **Container:** max width `--layout-container-max` (72rem / 1152px;
  renamed from `--container-max` in Sprint 02.6 — `--container-*` is a
  reserved Tailwind namespace), centered, horizontal padding 16 → 24 (md)
  → 32 (lg). Exception: inside the AppShell
  grid (≥ lg) the page container is anchored to the main track's inline
  start (`margin-inline: 0`) and releases its max-width (`max-width: none`)
  so sidebar-collapse width flows into content position instead of pooling
  as dead gutter — Container still owns gutters below lg; AppShell owns how
  the column sits in the grid. Full-viewport pages (`/`, 404) keep the
  centered 72rem reading measure.
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
- **Variants:** `default` (primary tint) · `secondary` · `accent` · `success` ·
  `warning` · `danger` · `info` · `outline`.
- **Sizes:** `md` (default, 3/4-unit horizontal padding) · `sm` (compact card
  metadata — halved horizontal padding, zero vertical, `--font-size-micro`
  text: smaller container AND smaller type, intentionally).
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

### Dialog (`components/ui/Dialog.jsx`) ✅ (Sprint 06.5 — interim)
- **Purpose:** modal overlay for confirmations and forms. Thin wrapper around
  native `<dialog>` — Escape key works natively, backdrop click closes.
- **Props:** `open`, `onClose`, `title`, `description?`, `children`, `className`.
- **Positioning:** `fixed inset-0 m-auto` — deterministic project-owned
  centering, not relying on UA `margin: auto` (which `m-0` would break).
  `max-h-[90dvh]` constrains height for mobile.
- **Scroll architecture:** inner content div uses `overflow-y-auto min-h-0
  flex-1`; header uses `shrink-0`. When form content exceeds viewport,
  the body scrolls while header and close button remain visible.
- **Scope:** intentionally small for Core Modules hardening. Full Dialog
  primitive with focus trap lands in Sprint 14.
- **Rules:** use `showModal()` for proper top-layer rendering; never use
  `alert()` or `window.confirm()`.

### ConfirmDialog (`components/ui/ConfirmDialog.jsx`) ✅ (Sprint 06.5)
- **Purpose:** destructive confirmation (delete actions).
- **Props:** `open`, `onClose`, `onConfirm`, `title='Confirm'`, `message`,
  `confirmLabel='Delete'`, `cancelLabel='Cancel'`.
- **Composes:** Dialog + Button (destructive variant).

### FormDialog (`components/ui/FormDialog.jsx`) ✅ (Sprint 06.5)
- **Purpose:** create/edit form overlay.
- **Props:** `open`, `onClose`, `onSubmit`, `title`, `submitLabel='Save'`,
  `children` (form fields).
- **Composes:** Dialog + form + Button (primary submit, secondary cancel).

### ModuleToolbar (`components/layout/ModuleToolbar.jsx`) ✅ (Sprint 06.5)
- **Purpose:** shared sticky toolbar for module pages (Tasks, Notes, Resources).
  Provides consistent location for search, filters, and action buttons.
- **Props:** `children`, `className`.
- **Behavior:** sticky below navbar (`top: var(--layout-navbar-height)`),
  z-index `var(--z-toolbar)` (=5, below navbar's z-10), translucent
  background with backdrop blur.
- **Layout:** `flex flex-wrap items-center gap-3` — controls wrap on narrow
  viewports. Resources adds category filter chips inside the sticky area
  (chips use `w-full` to wrap to a second line).
- **Layering:** see `docs/LAYERING_SYSTEM.md`.

### StatusDropdown (`components/ui/StatusDropdown.jsx`) ✅ (Sprint 06.5)
- **Purpose:** accessible status selector for task cards — replaces native
  `<select>` with a combobox-pattern dropdown built from existing primitives.
- **Props:** `value` (current status), `onChange` (callback), `taskTitle`
  (for aria-label).
- **Statuses & colors (Sprint 07.5 semantic mapping):** `unstarted`
  (Circle, muted-foreground / secondary neutral) · `in-progress` (Clock,
  accent-strong — the accent token, NOT warning) · `deferred` (PauseCircle,
  info-strong) · `done` (CheckCircle2, success-strong) · `cancelled`
  (XCircle, destructive-strong). `warning` is reserved for time-based
  caution (e.g. due-soon), not for a task status. Legacy persisted `todo`
  values render as `unstarted` (alias via `normalizeTaskStatus`) — never
  color alone: every status keeps its icon + text label.
- **Visual:** trigger button shows status icon + label + chevron; positioned
  listbox below with option highlight on hover/keyboard; selected option
  uses `bg-primary-soft text-primary-strong`.
- **A11y:** `role="combobox"` + `aria-expanded` + `aria-haspopup="listbox"`
  on trigger; `role="listbox"` + `aria-selected` per option; full keyboard
  navigation (ArrowUp/Down, Enter/Space, Escape, Tab).
- **Scope:** lightweight interim for Sprint 06.5 hardening — full Dropdown
  with focus trap lands in Sprint 14.

### Planned primitives (do not exist yet — build only in their Sprint)
`EmptyState` (Sprint 08) · Tooltip/Dropdown/Drawer/Toast/Skeleton/Tabs/Breadcrumb
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