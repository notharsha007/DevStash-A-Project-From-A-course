import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const EXPIRY_HOURS = 24;

export async function generateVerificationToken(email: string) {
  const token = randomUUID();
  const expires = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

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
