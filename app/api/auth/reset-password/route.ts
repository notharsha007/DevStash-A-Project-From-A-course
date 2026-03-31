import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPasswordResetTokenByToken } from "@/lib/tokens";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const resetToken = await getPasswordResetTokenByToken(token);

  if (!resetToken) {
    return NextResponse.json(
      { error: "Invalid reset link" },
      { status: 400 }
    );
  }

  if (new Date() > resetToken.expires) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return NextResponse.json(
      { error: "Reset link has expired" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: resetToken.email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid reset link" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password and delete token in one go
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return NextResponse.json({ message: "Password reset successfully" });
}
