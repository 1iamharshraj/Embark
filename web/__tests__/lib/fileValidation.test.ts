import { validateUploadRequest, verifyFileSignature } from "@/lib/fileValidation";

function bytes(values: number[]): Uint8Array {
  return new Uint8Array(values);
}

describe("validateUploadRequest", () => {
  it("allows a valid profile image", () => {
    const error = validateUploadRequest("profiles", "avatar.png", "image/png");
    expect(error).toBeNull();
  });

  it("rejects an invalid extension for the folder", () => {
    const error = validateUploadRequest("profiles", "avatar.exe", "image/png");
    expect(error).toContain("File type not allowed");
  });

  it("rejects a disallowed MIME type", () => {
    const error = validateUploadRequest("resumes", "cv.pdf", "image/png");
    expect(error).toContain("MIME type");
  });

  it("rejects files that exceed the folder size limit", () => {
    const error = validateUploadRequest("profiles", "avatar.png", "image/png", 6 * 1024 * 1024);
    expect(error).toContain("exceeds 5 MB");
  });

  it("returns an error for unknown folders", () => {
    const error = validateUploadRequest("unknown", "file.txt", "text/plain");
    expect(error).toBe("Invalid upload folder.");
  });
});

describe("verifyFileSignature", () => {
  it("verifies a PNG signature", () => {
    const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(verifyFileSignature(png, "image/png")).toBe(true);
  });

  it("verifies a JPEG signature", () => {
    const jpeg = bytes([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    expect(verifyFileSignature(jpeg, "image/jpeg")).toBe(true);
  });

  it("verifies a PDF signature", () => {
    const pdf = bytes([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(verifyFileSignature(pdf, "application/pdf")).toBe(true);
  });

  it("rejects a PNG signature claimed as JPEG", () => {
    const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(verifyFileSignature(png, "image/jpeg")).toBe(false);
  });
});
