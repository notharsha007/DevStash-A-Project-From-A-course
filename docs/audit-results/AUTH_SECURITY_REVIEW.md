# Authentication Security Review

**Date**: 2026-03-31
**Scope**: All authentication, verification, password-reset, and profile-update code
**Auditor**: auth-auditor agent

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 3 |
| Medium   | 3 |
| Low      | 2 |

**Total: 9 issues**

---

## Files Audited

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth v5 config — Credentials + GitHub providers |
| `auth.config.ts` | Edge-compatible provider stub |
| `lib/tokens.ts` | Token generation and lookup helpers |
| `lib/mail.ts` | Resend email wrappers |
| `lib/db/profile.ts` | Profile data fetch (Prisma) |
| `app/api/auth/register/route.ts` | Registration endpoint |
| `app/api/auth/verify-email/route.ts` | Email verification endpoint |
| `app/api/auth/resend-verification/route.ts` | Resend verification email endpoint |
| `app/api/auth/forgot-password/route.ts` | Forgot-password endpoint |
| `app/api/auth/reset-password/route.ts` | Password-reset endpoint |
| `app/api/profile/change-password/route.ts` | Authenticated password change |
| `app/api/profile/delete-account/route.ts` | Authenticated account deletion |
| `app/(auth)/sign-in/page.tsx` | Sign-in UI |
| `app/(auth)/register/page.tsx` | Registration UI |
| `app/(auth)/forgot-password/page.tsx` | Forgot-password UI |
| `app/(auth)/reset-password/page.tsx` | Reset-password UI |
| `app/(auth)/verify-email/page.tsx` | Verify-email UI |
| `app/(auth)/check-email/page.tsx` | Check-email prompt UI |
| `components/profile/ChangePasswordDialog.tsx` | Change-password dialog |
| `components/profile/DeleteAccountDialog.tsx` | Delete-account dialog |
| `app/profile/page.tsx` | Profile page (server component) |
| `app/profile/layout.tsx` | Profile layout (auth guard) |
| `app/dashboard/layout.tsx` | Dashboard layout (auth guard) |
| `prisma/schema.prisma` | Database schema |

---

## Critical Issues

### CRIT-1: Verification tokens stored in plaintext — a compromised database exposes all pending verification and reset links

**File**: `lib/tokens.ts` (lines 8–68), `prisma/schema.prisma` (lines 66–72)
**Category**: Security

**Description**: Both email-verification tokens and password-reset tokens are generated as `randomUUID()` values and stored verbatim in the `VerificationToken.token` column. If the database is ever read by an attacker (SQL injection, backup leak, misconfigured access control, or a compromised Prisma connection string), every unspent token is immediately usable. A UUID-based reset token is 128 bits of entropy, so offline brute force is not the concern — the concern is that the stored value *is* the credential. Industry best practice (used by Auth.js itself for its database-adapter email-provider tokens, and by services like GitHub) is to store only a hash of the token and send the raw value to the user's email.

**How the attack works**: An attacker who reads the `VerificationToken` table obtains a `reset:<email>` row with a live, unexpired token. They navigate to `/reset-password?token=<value>` and take over the account without knowing the current password, without access to the user's email, and without leaving any trace in application logs.

**Suggested Fix**:

1. In `lib/tokens.ts`, hash the token before storing it:

```ts
import { randomBytes, createHash } from "crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generatePasswordResetToken(email: string) {
  const rawToken = randomBytes(32).toString("hex"); // 256 bits
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `${RESET_PREFIX}${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: { identifier, token: hashedToken, expires },
  });

  return { rawToken }; // only the raw value goes in the email URL
}
```

2. In `getPasswordResetTokenByToken`, hash the incoming token before the database lookup:

```ts
export async function getPasswordResetTokenByToken(rawToken: string) {
  const hashedToken = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });
  // ... rest unchanged
}
```

3. Apply the same pattern to `generateVerificationToken` / `getVerificationTokenByToken`.

4. The URL sent to the user continues to carry the raw value; the database only ever sees the hash.

Note: The `token` column has a `@unique` constraint so the lookup still works correctly. No schema migration is required beyond the column now containing SHA-256 hex strings instead of UUIDs.

---

## High Issues

### HIGH-1: No middleware-level route protection — authenticated routes rely solely on per-layout session checks

**File**: (no `middleware.ts` exists in the project root)
**Category**: Security

**Description**: There is no Next.js `middleware.ts` file. Route protection is implemented per-layout: `app/dashboard/layout.tsx` and `app/profile/layout.tsx` both call `auth()` and redirect to `/sign-in` if no session. This approach has two weaknesses:

1. **Future routes are unprotected by default.** Any developer who adds a new route group under `/app` without adding an explicit `auth()` guard will silently ship an unauthenticated page. There is no fail-safe.
2. **Direct fetch/XHR requests to server-component page endpoints bypass the layout.** Next.js layouts run for full-page navigations; a crafted request that targets a server component's RSC payload endpoint (using the `?_rsc=` prefix) may skip the layout's auth check depending on the Next.js version and rendering mode. A middleware guard runs unconditionally before the page handler.

**Suggested Fix**: Add a `middleware.ts` at the project root that uses the NextAuth v5 `auth` export to protect all dashboard and profile routes in one place:

```ts
// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/collections", "/items", "/search", "/settings"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

The per-layout `auth()` checks can then be kept as a redundant defense-in-depth layer.

---

### HIGH-2: Register endpoint has no server-side password minimum length — only the client enforces 6 characters, but the API accepts shorter passwords

**File**: `app/api/auth/register/route.ts` (lines 7–61), `app/(auth)/register/page.tsx` (line 36)
**Category**: Security

**Description**: The registration form client-side code enforces `password.length < 6` (line 36 of `register/page.tsx`). The API route (`/api/auth/register`) performs no length check before calling `bcrypt.hash(password, 10)`. An attacker can call the endpoint directly with `POST /api/auth/register` and a one-character password. This bypasses the UI validation entirely.

Additionally, the reset-password endpoint enforces `>= 8` characters (line 16 of `reset-password/route.ts`), and the change-password endpoint also enforces `>= 8` (line 22 of `change-password/route.ts`). The inconsistency means a user who registers with a 6- or 7-character password and then resets it will be forced to a longer password, creating a confusing user experience alongside the security gap.

**Suggested Fix**: Add server-side validation to `app/api/auth/register/route.ts`:

```ts
if (password.length < 8) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters" },
    { status: 400 }
  );
}
```

Also update the client-side check in `app/(auth)/register/page.tsx` line 36 from `< 6` to `< 8` to match.

---

### HIGH-3: `hashedPassword` is returned to the server-component profile page and stored in component state — password hash is unnecessarily transported out of the database

**File**: `lib/db/profile.ts` (lines 8, 65–66), `app/profile/page.tsx` (lines 33)
**Category**: Security

**Description**: `getProfileData()` selects `hashedPassword: true` from Prisma and returns it in the `ProfileData` object (line 65). The profile page uses it only for a boolean check (`const hasPassword = !!profile.hashedPassword`, line 33 of `page.tsx`). The `hashedPassword` field is therefore serialized into the RSC payload and potentially into component props, simply to answer the question "does this user have a password?". While bcrypt hashes are not reversible in practice, unnecessarily transporting a password hash:

- increases the blast radius if a serialization bug, logging statement, or error boundary accidentally exposes the RSC payload;
- violates the principle of least privilege — the component needs a boolean, not the hash itself.

**Suggested Fix**: Replace the `hashedPassword` select with a simple boolean sentinel in `lib/db/profile.ts`:

```ts
// In the Prisma select:
select: {
  id: true,
  name: true,
  email: true,
  image: true,
  createdAt: true,
  _count: { select: { items: true, collections: true } },
  // Replace hashedPassword with:
  accounts: { select: { id: true }, take: 1 },
}

// Then derive hasPassword without storing the hash:
// hasPassword = user.hashedPassword !== null
// Better: add a dedicated field to ProfileData
```

A cleaner approach is to add a `hasPassword: boolean` field to `ProfileData` and compute it server-side in `getProfileData()` so the hash never leaves the database layer:

```ts
// Change the select to include hashedPassword only for the boolean check:
const hasHashedPassword = await prisma.user.findUnique({
  where: { id: userId },
  select: { hashedPassword: true },
});
// Then in the return:
return {
  ...fields,
  hasPassword: !!hasHashedPassword?.hashedPassword,
  // Remove hashedPassword from ProfileData entirely
};
```

Update `ProfileData` interface to replace `hashedPassword: string | null` with `hasPassword: boolean`.

---

## Medium Issues

### MED-1: Resend-verification endpoint reveals whether an already-verified email exists — inconsistent with the user-lookup behavior

**File**: `app/api/auth/resend-verification/route.ts` (lines 22–25)
**Category**: Security

**Description**: For unknown emails the endpoint correctly returns `{ success: true }` without revealing whether the account exists (line 20). However for a known email that is already verified, it returns HTTP 400 with `{ error: "Email is already verified" }` (lines 22–25). This inconsistency lets an attacker enumerate which emails belong to verified (active) accounts by comparing response codes:
- 200 + `{ success: true }` — either no account, or unverified (attacker can't tell)
- 400 + specific error — confirmed: account exists AND is verified

**Suggested Fix**: Return `{ success: true }` with HTTP 200 for both the no-account and already-verified cases:

```ts
if (!user || user.emailVerified) {
  // Don't reveal whether the user exists or is already verified
  return NextResponse.json({ success: true });
}
```

---

### MED-2: No input sanitization or type validation on any auth endpoint — relies entirely on Prisma parameterization

**File**: `app/api/auth/register/route.ts`, `app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`, `app/api/profile/change-password/route.ts`
**Category**: Security / Code Quality

**Description**: Every auth route calls `await request.json()` and immediately destructures fields with no schema validation (no Zod, no type guards). The coding standards specify "Validate all inputs with Zod." In practice, sending malformed data (e.g., `email: 12345`, `email: null`, `password: ["array"]`, a very long string, or a missing Content-Type header that causes `.json()` to throw) produces unhandled errors that bubble up as 500 responses, leaking a stack trace in development and causing undefined behavior in production. Prisma's parameterized queries prevent SQL injection but do not validate types.

**Suggested Fix**: Add Zod validation to each endpoint. Example for `/api/auth/register`:

```ts
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72), // bcrypt max is 72 bytes
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  // Use parsed.data from here on
}
```

Apply the same pattern to all auth routes. Note the `max(72)` on passwords — bcrypt silently truncates input beyond 72 bytes; passing a 1000-character password is not an error but the last ~928 bytes are ignored, meaning two different very-long passwords can hash identically.

---

### MED-3: No bcrypt work-factor comment or constant — the cost factor of 10 is repeated in three files with no centralized control

**File**: `app/api/auth/register/route.ts` (line 33), `app/api/auth/reset-password/route.ts` (line 54), `app/api/profile/change-password/route.ts` (line 50)
**Category**: Code Quality

**Description**: `bcrypt.hash(password, 10)` appears in three separate API routes. The cost factor (10) is not a named constant and is not shared. If the project needs to increase the cost factor as hardware improves, three files must be updated consistently. A cost factor of 10 is on the low end of current recommendations (12 is common for bcrypt in 2024–2026); however this is a code-quality finding, not a critical vulnerability. The bigger risk is inconsistency — a future maintainer might update it in one place.

**Suggested Fix**: Create `lib/auth-utils.ts` with a shared constant:

```ts
// lib/auth-utils.ts
export const BCRYPT_ROUNDS = 12;
```

Import and use `BCRYPT_ROUNDS` in all three route files. This also makes it easy to test different values per environment if needed.

---

## Low Issues

### LOW-1: The `email` query parameter in the check-email page is trusted for display without validation — reflected but non-executable

**File**: `app/(auth)/check-email/page.tsx` (lines 20, 51–54)
**Category**: Security (minor)

**Description**: The page reads `searchParams.get("email")` and renders it in JSX as `{email}`. Because React JSX escapes text-node content, this is not a DOM XSS vector. However, an attacker can craft a URL like `/check-email?email=you%40attacker.com` and share it with a victim, making the DevStash UI display a misleading "We sent a verification link to you@attacker.com" message. This is a phishing assist, not an active XSS.

**Suggested Fix**: Add a basic email format check before trusting the param for display:

```ts
const rawEmail = searchParams.get("email") ?? "";
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "";
```

If the param fails the check, the page renders "your email address" instead of the untrusted value, which is already the fallback on line 54.

---

### LOW-2: The `app/(auth)/layout.tsx` is not shown but the `app/dashboard/layout.tsx` uses a non-null assertion (`session.user.id!`) after already guarding for `!session?.user`

**File**: `app/dashboard/layout.tsx` (line 21), `app/profile/layout.tsx` (line 21)
**Category**: Code Quality

**Description**: Both layout files have:

```ts
if (!session?.user) {
  redirect("/sign-in");
}
const userId = session.user.id!;
```

The `!` non-null assertion on `session.user.id` is technically safe because `redirect()` throws and Next.js stops execution, so the assertion is only reached when `session.user` exists. However, `session.user.id` could still be `undefined` if the JWT callback ever fails to set `token.id` or if the session type is wrong — the assertion suppresses that error rather than handling it. This is a minor type-safety concern.

**Suggested Fix**: Replace the non-null assertion with an explicit guard:

```ts
const userId = session.user.id;
if (!userId) {
  redirect("/sign-in");
}
```

This costs one extra line and eliminates the suppressed-undefined risk.

---

## Non-Issues (verified)

The following items were checked and confirmed to be correctly implemented:

- **`.env` in `.gitignore`**: Confirmed — `.gitignore` line 34 contains `.env*`, which covers all env files.
- **CSRF on credential endpoints**: NextAuth v5 handles CSRF protection on its own `POST /api/auth/callback/credentials` path. The custom API routes (`/api/auth/register`, `/api/auth/forgot-password`, etc.) are unauthenticated public endpoints where CSRF is not applicable — they don't act on session state.
- **Reset token single-use enforcement**: Correctly implemented. `app/api/auth/reset-password/route.ts` deletes the token atomically in the same `$transaction` as the password update (lines 57–65), preventing replay.
- **Reset token expiry**: Correctly checked before use (line 32), and the expired record is deleted (lines 34–35).
- **Verification token expiry**: Correctly checked before use (lines 25–33 of `verify-email/route.ts`), and the expired record is deleted.
- **Password verification before change**: `change-password/route.ts` correctly fetches `hashedPassword` fresh from the DB (not from session) and calls `bcrypt.compare` before accepting the new password.
- **Account deletion authorization**: `delete-account/route.ts` correctly reads `session.user.id` from a live server-side `auth()` call, not from client-supplied data.
- **Forgot-password enumeration protection**: Correctly returns an identical success response regardless of whether the email exists or belongs to an OAuth-only account.
- **bcryptjs version**: `bcryptjs@3.0.3` is used — this is the pure-JS implementation, appropriate for environments where native addons are unavailable. No known vulnerabilities at this version.
- **Token identifier namespace collision**: Reset tokens use the `reset:` prefix on the identifier, preventing a verification token from being used as a reset token (and vice versa). The `getPasswordResetTokenByToken` lookup validates the prefix (line 60 of `tokens.ts`).

---

## Priority Fix Order

1. **CRIT-1** — Hash tokens before storage (prevents database-read account takeover)
2. **HIGH-2** — Add server-side password length validation to register endpoint
3. **HIGH-3** — Remove `hashedPassword` from the `ProfileData` object; use a boolean instead
4. **HIGH-1** — Add `middleware.ts` for centralized route protection
5. **MED-2** — Add Zod validation to all auth endpoints (also fixes the bcrypt 72-byte truncation gap)
6. **MED-1** — Normalize resend-verification response to avoid email enumeration
7. **MED-3** — Extract bcrypt cost factor to a shared constant
8. **LOW-1** — Validate email query param format before display
9. **LOW-2** — Replace `!` assertions with explicit guards in layout files
