import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getVerificationTokenByToken } from "@/lib/tokens"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "Missing token" },
      { status: 400 }
    )
  }

  const verificationToken = await getVerificationTokenByToken(token)

  if (!verificationToken) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    )
  }

  if (new Date() > verificationToken.expires) {
    await prisma.verificationToken.delete({
      where: { token },
    })
    return NextResponse.json(
      { error: "Token has expired" },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: { token },
  })

  return NextResponse.json({ success: true })
}
