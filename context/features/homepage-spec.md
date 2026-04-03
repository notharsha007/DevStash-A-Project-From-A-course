# Homepage

## Overview

Build the actual app homepage from the `prototypes/homepage/` mockup, using the existing project architecture, Tailwind/ShadCN styling, and the same overall visual language as the dashboard.

## Requirements

- Use `prototypes/homepage/` as the visual reference for layout, hierarchy, copy, and motion
- Implement the homepage in the app itself, not as a standalone prototype
- Break the page into server components and client components only where interactivity is needed
- Use Tailwind and ShadCN patterns consistent with the rest of the project
- Keep implementation clean, reusable, and DRY
- Match the existing DevStash dark theme and overall dashboard feel so the transition from homepage to dashboard feels cohesive
- Add the main marketing sections from the mockup:
  - fixed navigation
  - hero copy
  - chaos-to-order comparison visual
  - features grid
  - AI/pro section
  - pricing
  - CTA
  - footer
- Make buttons and links go to the correct destinations
- Ensure responsive behavior matches the intent of the mockup

## Interactivity

- Navbar becomes more opaque on scroll
- Chaos icons animate and repel from the cursor
- Arrow has a subtle pulse
- Sections reveal on scroll
- Pricing toggle switches monthly/yearly display

## Architecture Notes

- Prefer server components for static content sections
- Use client components only for the animated hero visual, pricing toggle, scroll-based navbar behavior, and reveal effects if needed
- Reuse shared UI primitives where appropriate instead of introducing one-off patterns
- Avoid creating a homepage experience that feels stylistically disconnected from the authenticated app

## Navigation Expectations

- Logo should route to `/`
- "Features" and "Pricing" should jump to their homepage sections
- "Sign In" should route to `/sign-in`
- Primary CTA should route to the most appropriate auth/onboarding entry point for the app
- Any secondary CTA should go to a meaningful in-app or on-page destination
