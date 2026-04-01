export const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
export const FILE_EXTENSIONS = [
  ".pdf", ".txt", ".md", ".json", ".yaml", ".yml",
  ".xml", ".csv", ".toml", ".ini",
];

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const FILE_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
];

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;  // 5 MB
export const FILE_MAX_BYTES = 10 * 1024 * 1024;  // 10 MB

export function validateUpload(
  mimeType: string,
  fileSize: number,
  itemType: "file" | "image"
): string | null {
  if (itemType === "image") {
    if (!IMAGE_MIME_TYPES.includes(mimeType)) {
      return `Invalid image type. Allowed: ${IMAGE_MIME_TYPES.join(", ")}`;
    }
    if (fileSize > IMAGE_MAX_BYTES) {
      return "Image must be 5 MB or smaller";
    }
  } else {
    if (!FILE_MIME_TYPES.includes(mimeType)) {
      return `Invalid file type. Allowed: ${FILE_MIME_TYPES.join(", ")}`;
    }
    if (fileSize > FILE_MAX_BYTES) {
      return "File must be 10 MB or smaller";
    }
  }
  return null;
}
