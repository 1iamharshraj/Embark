type FolderConfig = {
  allowedTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
};

const FOLDER_CONFIG: Record<string, FolderConfig> = {
  profiles: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 5 * 1024 * 1024,
  },
  resumes: {
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    allowedExtensions: [".pdf", ".doc", ".docx"],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  verifications: {
    allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 10 * 1024 * 1024,
  },
  hackathons: {
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    maxSizeBytes: 5 * 1024 * 1024,
  },
  submissions: {
    allowedTypes: ["application/pdf", "application/zip", "application/x-zip-compressed"],
    allowedExtensions: [".pdf", ".zip"],
    maxSizeBytes: 20 * 1024 * 1024,
  },
};

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot >= 0 ? filename.slice(lastDot).toLowerCase() : "";
}

function arraysMatchPrefix(haystack: Uint8Array, needle: number[], offset = 0): boolean {
  for (let i = 0; i < needle.length; i++) {
    if (haystack[offset + i] !== needle[i]) return false;
  }
  return true;
}

export function verifyFileSignature(bytes: Uint8Array, contentType: string): boolean {
  if (bytes.length < 8) return false;

  const jpeg = [0xff, 0xd8, 0xff];
  const png = [0x89, 0x50, 0x4e, 0x47];
  const pdf = [0x25, 0x50, 0x44, 0x46];
  const zip = [0x50, 0x4b, 0x03, 0x04];

  if (contentType.startsWith("image/jpeg")) return arraysMatchPrefix(bytes, jpeg);
  if (contentType.startsWith("image/png")) return arraysMatchPrefix(bytes, png);
  if (contentType === "application/pdf") return arraysMatchPrefix(bytes, pdf);
  if (contentType.startsWith("application/zip") || contentType === "application/x-zip-compressed") {
    return arraysMatchPrefix(bytes, zip);
  }
  if (contentType === "image/webp") {
    const riff = [0x52, 0x49, 0x46, 0x46];
    const webp = [0x57, 0x45, 0x42, 0x50];
    return arraysMatchPrefix(bytes, riff) && bytes.length >= 12 && arraysMatchPrefix(bytes, webp, 8);
  }

  // For formats where we do not have a signature check, rely on extension/MIME validation.
  return true;
}

export function validateUploadRequest(
  folder: string,
  filename: string,
  contentType: string,
  size?: number
): string | null {
  const config = FOLDER_CONFIG[folder];
  if (!config) return "Invalid upload folder.";

  const ext = getExtension(filename);
  if (!ext || !config.allowedExtensions.includes(ext)) {
    return `File type not allowed for ${folder}. Allowed: ${config.allowedExtensions.join(", ")}.`;
  }

  const normalizedType = contentType.split(";")[0].trim().toLowerCase();
  if (!config.allowedTypes.includes(normalizedType)) {
    return `MIME type ${contentType} is not allowed for ${folder}.`;
  }

  if (size !== undefined && size > config.maxSizeBytes) {
    const mb = Math.round(config.maxSizeBytes / (1024 * 1024));
    return `File exceeds ${mb} MB size limit for ${folder}.`;
  }

  return null;
}

export function validateUploadedFile(folder: string, file: File): string | null {
  const sizeError = validateUploadRequest(folder, file.name, file.type || "application/octet-stream", file.size);
  if (sizeError) return sizeError;
  return null;
}

export function validateFileSignatureForType(bytes: Uint8Array, contentType: string): string | null {
  if (!verifyFileSignature(bytes, contentType)) {
    return "File signature does not match the declared content type.";
  }
  return null;
}
