import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { r2, getR2Bucket } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { path } = await params;
  const key = path.join("/");

  // Keys are scoped to userId: verify ownership
  const [ownerId] = key.split("/");
  if (ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let obj;
  try {
    obj = await r2().send(new GetObjectCommand({ Bucket: getR2Bucket(), Key: key }));
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!obj.Body) {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileName = key.split("/").pop() ?? "download";
  const stream = obj.Body.transformToWebStream();

  return new NextResponse(stream, {
    headers: {
      "Content-Type": obj.ContentType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      ...(obj.ContentLength ? { "Content-Length": String(obj.ContentLength) } : {}),
    },
  });
}
