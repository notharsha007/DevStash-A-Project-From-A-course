import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, password, confirmPassword } = body

  if (!email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "Email, password, and confirmPassword are required" },
      { status: 400 }
    )
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    )
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const requireVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"

  await prisma.user.create({
    data: {
      name: name || null,
      email,
      hashedPassword,
      emailVerified: requireVerification ? null : new Date(),
    },
  })

  if (requireVerification) {
    const verificationToken = await generateVerificationToken(email)
    await sendVerificationEmail(email, verificationToken.token)
  }

  return NextResponse.json(
    {
      success: true,
      message: requireVerification
        ? "Verification email sent"
        : "Account created",
      requireVerification,
    },
    { status: 201 }
  )
}
