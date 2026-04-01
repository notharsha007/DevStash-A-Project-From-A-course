import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

let _r2: S3Client | null = null;

function getR2Client(): S3Client {
  if (_r2) return _r2;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured");
  }

  _r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return _r2;
}

export function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set");
  return bucket;
}

export { getR2Client as r2 };

export async function deleteFromR2(fileUrl: string): Promise<void> {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return;

  const base = publicUrl.replace(/\/$/, "");
  const key = fileUrl.startsWith(base + "/") ? fileUrl.slice(base.length + 1) : null;
  if (!key) return;

  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key })
  );
}
