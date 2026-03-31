import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;
const RESET_PREFIX = "reset:";

export async function generateVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function getVerificationTokenByToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
}

export async function generatePasswordResetToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `${RESET_PREFIX}${email}`;

  // Delete any existing reset token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return resetToken;
}

export async function getPasswordResetTokenByToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    return null;
  }

  return {
    ...record,
    email: record.identifier.slice(RESET_PREFIX.length),
  };
}
