import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2, getR2Bucket } from "@/lib/r2";
import { validateUpload } from "@/lib/upload-validation";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const itemType = formData.get("itemType") as string | null;

  if (!file || !itemType || (itemType !== "file" && itemType !== "image")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const mimeType = file.type;
  const fileSize = file.size;

  const validationError = validateUpload(mimeType, fileSize, itemType);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop()! : "";
  const key = `${session.user.id}/${randomUUID()}${ext ? `.${ext}` : ""}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2().send(
    new PutObjectCommand({
      Bucket: getR2Bucket(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: fileSize,
    })
  );

  const publicUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  const fileUrl = `${publicUrl}/${key}`;

  return NextResponse.json({ fileUrl, fileName: file.name, fileSize });
}
