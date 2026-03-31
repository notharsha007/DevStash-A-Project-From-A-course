import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">
          Welcome to DevStash
        </h1>
        <p style="color: #555; margin-bottom: 24px;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;"
        >
          Verify Email
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          This link expires in 24 hours. If you didn&apos;t create an account, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Failed to send verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  console.log("[Resend] Verification email sent:", data?.id);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: "DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Reset your DevStash password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">
          Reset your password
        </h1>
        <p style="color: #555; margin-bottom: 24px;">
          Click the button below to reset your password. If you didn&apos;t request this, you can safely ignore this email.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; background: #3b82f6; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;"
        >
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          This link expires in 1 hour. If you didn&apos;t request a password reset, no action is needed.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[Resend] Failed to send password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  console.log("[Resend] Password reset email sent:", data?.id);
}
