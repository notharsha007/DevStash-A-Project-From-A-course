import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  const { email } = await request.json()

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
    return NextResponse.json(
      { error: "Email is already verified" },
      { status: 400 }
    )
  }

  const verificationToken = await generateVerificationToken(email)
  await sendVerificationEmail(email, verificationToken.token)

  return NextResponse.json({ success: true })
}
