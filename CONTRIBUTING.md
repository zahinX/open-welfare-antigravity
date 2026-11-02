# Contributing to Open Welfare

First off, thank you for considering contributing to Open Welfare! It's people like you that make this community tool robust and useful for charities everywhere.

## Development Workflow

1. **Fork the Repository:** Create your own fork of the project and clone it to your local machine.
2. **Branch Naming:** Create a new branch for your feature or bug fix. Use descriptive names like `feature/volunteer-roster` or `bugfix/donation-currency`.
3. **Local Setup:** Follow the "Getting Started" instructions in the `README.md` to run the Supabase local environment. **Do not connect to a production database for local development.**
4. **Testing:** Write tests for any new features in the `tests/` directory. Ensure `npm run test` passes locally.
5. **Linting & Code Quality:** Run `npm run lint` and fix any warnings or errors. Ensure your components meet WCAG 2.1 AA accessibility standards (e.g., proper aria-labels, semantic HTML).
6. **Commit Messages:** Write clear, concise commit messages. Prefix them with the area of work (e.g., `feat(ui): add aria-labels to buttons`).
7. **Pull Requests:** Submit a pull request against the `main` branch. Provide a detailed description of what you've changed, why, and any screenshots for UI changes.

## Code Standards

- **TypeScript:** Use strict typings. Avoid `any`.
- **UI Framework:** We use Next.js App Router (React Server Components by default) and Tailwind CSS.
- **Client Components:** Use `'use client'` only when necessary (e.g., hooks, browser APIs) and add a comment explaining why.

Thank you for contributing to open-source community welfare!
