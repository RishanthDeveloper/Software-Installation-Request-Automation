# Design System: Software Request Automation

This tool turns a manual, chaotic IT request queue into a fast, governed, and trustworthy process. The design system reflects this purpose: it feels crisp, highly legible, and operational, distancing itself from generic SaaS aesthetics.

## Color Palette

- **Background (`--background`)**: Light Slate (HSL 210 20% 98%) — Crisp, technical canvas.
- **Surface (`--card`)**: Pure White (HSL 0 0% 100%) — Used for forms and interactive panels.
- **Ink (`--foreground`)**: Deep Navy (HSL 220 40% 15%) — High contrast, reducing eye strain compared to pure black.
- **Primary Accent (`--primary`)**: Vibrant Emerald/Teal (HSL 170 80% 35%) — Signifies action, speed, and trust. Used sparingly for primary CTAs and active states.
- **Success (`--success`)**: Green (HSL 140 70% 40%) — For "Installed" / "Approved" states.
- **Warning (`--warning`)**: Amber (HSL 40 90% 50%) — For "Pending" / SLA risk states.
- **Danger (`--destructive`)**: Red (HSL 0 70% 50%) — For "Rejected" / SLA breached states.

## Typography

- **Text Face**: `Inter` (sans-serif) — highly legible for dense UIs.
- **Monospace Face**: `JetBrains Mono` or similar — used for Request IDs (e.g., `REQ1042`), status codes, and timestamps to emphasize the operational nature of the product.
- **Scale**:
  - Display: 4xl, font-semibold, tight tracking
  - H1-H3: 2xl down to xl, font-medium/semibold
  - Body: base size, relaxed line-height for readability
  - Small: sm size, muted foreground
  - Mono-label: sm size, monospace, uppercase, wide tracking (`.mono-label`)

## Shape & Space

- **Radius**: A strict `0.25rem` (4px). We avoid heavy rounding to maintain a sharp, utilitarian tool aesthetic.
- **Hierarchy via Borders**: Instead of relying heavily on soft drop-shadows for every card, hierarchy is established using flat panels with distinct borders (e.g., a top border accent using `border-primary/20`) to separate sections cleanly.

## Shadcn/UI Integration

The `tailwind.config.ts` and `globals.css` are configured so that all Shadcn components (Button, Badge, Card, etc.) automatically inherit these HSL variables (e.g., `bg-primary`, `rounded-md` which uses `--radius`), ensuring a cohesive look without overriding individual components.
