# Phase 7 — Polish, Accessibility & Performance (Horizontal Plan)

## Batch Scope
This batch covers the final phase of Open Welfare (Phase 7), focusing on ensuring the application is accessible (WCAG 2.1 AA), performant (Core Web Vitals), and ready for open source (Documentation & Licenses). The scope is well within the 70% context limit.

## Horizontal Layer Decomposition

### Layer 1: Core Build (Gemini Flash 3.7 High)
*   **Performance Audits & Config**: Run initial accessibility and performance checks.
*   **Config Optimization**: Set up Next.js bundle analyzer if needed, configure Next.js Image optimization settings in `next.config.mjs` or `next.config.ts`.
*   **Dependencies**: Ensure any accessibility/performance testing plugins (e.g., `eslint-plugin-jsx-a11y`) are correctly configured in ESLint.

### Layer 2: Core Review (Gemini 3.1 Pro High)
*   **Audit Review**: Review the configuration changes, verify that the audit plan is sound.
*   **Approval**: Hand off to UI Builder with explicit instructions on what ARIA/UI components need fixing.

### Layer 3: UI Build & Review (Claude Sonnet 4.6)
*   **Accessibility (Step 7.1)**: Review and update all UI components for semantic HTML, ARIA labels, keyboard navigation, screen reader compatibility, and color contrast.
*   **Performance (Step 7.2)**: Implement `next/image` for lazy loading, optimize fonts, implement code splitting via `next/dynamic` where heavy charts are used (e.g., Recharts in Phase 6 Dashboard).

### Layer 4: Docs & Git (Gemini Flash 3.7 Medium)
*   **Documentation (Step 7.3)**: Finalize `README.md` with setup instructions, create `CONTRIBUTING.md`, and add `LICENSE` (MIT).
*   **Completion**: Finalize the phase, commit, push, open the Pull Request, and conclude the project.

---
**Status**: Plan Initialized.
**Next Agent**: 📋 Plan Reviewer (Claude Opus 4.6)
