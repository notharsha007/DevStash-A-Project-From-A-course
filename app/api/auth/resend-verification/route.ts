import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"
import { resendVerificationLimiter, getIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const { email } = await request.json()

  const ip = getIp(request)
  const key = email ? `${ip}:${email}` : ip
  const { limited, reset } = await checkRateLimit(resendVerificationLimiter, key)
  if (limited) return rateLimitResponse(reset)

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    // Don't reveal whether the user exists
    return NextResponse.json({ success: true })
  }

  if (user.emailVerified) {
    // Don't reveal that this account is already verified
    return NextResponse.json({ success: true })
  }

  const verificationToken = await generateVerificationToken(email)
  await sendVerificationEmail(email, verificationToken.token)

  return NextResponse.json({ success: true })
}
