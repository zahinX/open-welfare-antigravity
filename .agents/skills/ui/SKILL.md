---
name: ui
description: >-
  Use this skill when building React components, Pages, Layouts, and styling with Tailwind CSS.
---

# UI Component Workflow

This skill dictates how to build frontend features, focusing on modern aesthetics, responsiveness, and accessibility.

## Steps
1. **Server vs Client**: Default to React Server Components (RSC). Only use `'use client'` when you absolutely need interactivity (hooks like `useState`, `onClick` handlers, or browser APIs).
2. **Styling (Tailwind)**: Use Tailwind CSS for all styling. Rely on the defined design system colors (e.g., zinc backgrounds, emerald/teal accents for this project) to maintain consistency. 
3. **Accessibility (a11y)**: Ensure all interactive elements have proper `aria-` labels. Use semantic HTML (e.g., `<button>` over `<div onClick={...}>`).
4. **Form Handling**: Use standard HTML forms combined with Next.js Server Actions (e.g., `action={createCampaign}`). Show pending states using `useFormStatus` during submissions.
5. **Loading & Errors**: Provide inline loading skeletons or rely on Next.js `loading.tsx` and `error.tsx` boundaries to keep the experience smooth.
