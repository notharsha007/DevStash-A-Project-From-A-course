# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stack

- **Next.js 16.2.1** with App Router — see AGENTS.md warning about breaking changes
- **React 19.2.4**
- **Tailwind CSS v4** — imported via `@import "tailwindcss"` in `globals.css` (no `tailwind.config` file; config is done via CSS `@theme`)
- **TypeScript**
- **Geist** fonts (sans + mono) loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`

## Architecture

The app uses the Next.js App Router. All routes live under `app/`. The root layout (`app/layout.tsx`) sets up fonts, global styles, and a flex column body. Pages are `page.tsx` files within route segments.

Global styles are in `app/globals.css` — only the Tailwind import, no custom base styles.
