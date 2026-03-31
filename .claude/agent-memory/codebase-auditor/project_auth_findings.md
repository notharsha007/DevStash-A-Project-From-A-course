---
name: Auth Security Audit Findings
description: Key findings from the 2026-03-31 auth security review — token storage, password validation gaps, route protection pattern
type: project
---

Auth audit completed 2026-03-31. Full report at `docs/audit-results/AUTH_SECURITY_REVIEW.md`.

Critical finding: verification and password-reset tokens are stored as plaintext UUIDs in `VerificationToken.token`. A compromised DB gives an attacker live reset links. Fix is to SHA-256 hash before storage in `lib/tokens.ts`.

High findings:
- No `middleware.ts` — route protection done per-layout only (fragile for new routes)
- Register endpoint (`/api/auth/register`) has no server-side password length check; client enforces 6 chars but API accepts any length
- `lib/db/profile.ts` returns the full `hashedPassword` string to the profile page when only a boolean `hasPassword` is needed

Medium findings:
- Resend-verification endpoint reveals which emails are already-verified (HTTP 400 vs 200 for unknown)
- No Zod input validation on any auth endpoint — `.json()` errors unhandled
- Bcrypt cost factor 10 repeated in three files; no shared constant; 10 is below current recommendation of 12

**Why relevant to future work:** Any new auth endpoint or profile update route must add Zod validation and avoid the plaintext token pattern. Route protection must go through middleware, not just layout.
