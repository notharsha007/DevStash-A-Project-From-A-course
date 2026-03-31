import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { forgotPasswordLimiter, getIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { limited, reset } = await checkRateLimit(forgotPasswordLimiter, getIp(req))
  if (limited) return rateLimitResponse(reset)

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return success to avoid leaking whether an email exists
  const successResponse = NextResponse.json({
    message: "If an account exists with that email, a reset link has been sent.",
  });

  const user = await prisma.user.findUnique({ where: { email } });

  // No account, or OAuth-only account (no password to reset)
  if (!user || !user.hashedPassword) {
    return successResponse;
  }

  const resetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, resetToken.token);

  return successResponse;
}
