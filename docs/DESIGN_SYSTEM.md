# Open Welfare — Design System & UI Guide

> **Status:** Active  
> **Last Updated:** 2026-08-06

This document serves as the single source of truth for UI/UX consistency across the Open Welfare platform. **Check these patterns before building any new component.**

---

## 🎨 Color Palette & Themes

Our primary theme revolves around trust, growth, and community, utilizing Tailwind's Emerald and Teal palettes.

### Core Tokens

| Role | Light Mode (Default) | Dark Mode | Usage |
|---|---|---|---|
| **Background** | `bg-zinc-50` / `bg-white` | `bg-zinc-950` / `bg-zinc-900` | Page backgrounds, main containers |
| **Foreground (Text)** | `text-zinc-900` / `text-zinc-600` | `text-zinc-50` / `text-zinc-400` | Headings, body copy |
| **Primary Brand** | `bg-emerald-600` | `bg-emerald-500` | Primary CTA buttons, active states, progress bars |
| **Primary Hover** | `hover:bg-emerald-700` | `hover:bg-emerald-400` | Interactive primary elements |
| **Secondary Brand** | `bg-teal-600` | `bg-teal-500` | Secondary highlights, charts |
| **Destructive/Error** | `bg-red-600` | `bg-red-500` | Delete actions, error banners |
| **Border/Divider** | `border-zinc-200` | `border-zinc-800` | Card borders, section dividers |

### Gradients
For marketing or prominent hero sections:
- `bg-gradient-to-r from-emerald-400 to-teal-400` (Use with `text-emerald-950` in dark mode)
- `bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900` (Hero backgrounds)

---

## 🔤 Typography & Hierarchy

We use standard Sans Serif (Inter/Geist via Next.js defaults) for clean legibility.

- **h1 (Page Title):** `text-3xl sm:text-4xl font-bold tracking-tight text-foreground`
- **h2 (Section Title):** `text-2xl font-semibold tracking-tight text-foreground`
- **h3 (Card/Item Title):** `text-lg font-semibold text-foreground`
- **Body Large:** `text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed`
- **Body Default:** `text-base text-zinc-600 dark:text-zinc-400`
- **Small/Muted:** `text-sm text-zinc-500 dark:text-zinc-500`

---

## 🧩 Component Patterns

### 1. Buttons
- **Primary:** `px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors`
- **Secondary (Outline):** `px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors`
- **Ghost:** `px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-colors`

### 2. Cards
Used for campaigns, beneficiaries, and dashboard widgets.
- **Classes:** `rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm`

### 3. Campaign Progress Bars
- **Container:** `h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden`
- **Fill:** `h-full bg-emerald-500 rounded-full transition-all duration-500`

### 4. Badges / Tags
Used for status indicators (e.g., Active, Draft, Completed).
- **Active:** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400`

---

## ♿ Accessibility & Responsiveness

1. **Focus States:** Every interactive element MUST have a visible focus state.
   - Standard: `focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950`
2. **Breakpoints:** Design mobile-first.
   - Base (`< 640px`): Single column, full width.
   - `sm:` (`>= 640px`): Standard tablet layouts.
   - `md:` (`>= 768px`): Complex multi-column layouts, sidebars.
   - `lg:` (`>= 1024px`): Desktop max-width constraints (`max-w-7xl mx-auto`).
3. **ARIA:** Use `aria-label` for icon-only buttons. Use `aria-live` for dynamic alerts (e.g., successful donation toast).
