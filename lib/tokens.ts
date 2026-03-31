import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const VERIFICATION_EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;
const RESET_PREFIX = "reset:";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function generateVerificationToken(email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  });

  // Return the raw token so it can be sent in the email URL
  return { ...verificationToken, token: rawToken };
}

export async function getVerificationTokenByToken(rawToken: string) {
  return prisma.verificationToken.findUnique({
    where: { token: hashToken(rawToken) },
  });
}

export async function generatePasswordResetToken(email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);
  const expires = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = `${RESET_PREFIX}${email}`;

  // Delete any existing reset token for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires,
    },
  });

  // Return the raw token so it can be sent in the email URL
  return { ...resetToken, token: rawToken };
}

export async function getPasswordResetTokenByToken(rawToken: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token: hashToken(rawToken) },
  });

  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    return null;
  }

  return {
    ...record,
    email: record.identifier.slice(RESET_PREFIX.length),
  };
}
