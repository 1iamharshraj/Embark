"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "profiles" | "resumes" | "verifications";
}

export function ImageUpload({ value, onChange, folder = "profiles" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, filename: file.name, contentType: file.type }),
      });
      const data = await presignRes.json();
      if (!presignRes.ok) throw new Error(data.message || "Presign failed");

      if (data.putUrl.startsWith("http")) {
        const uploadRes = await fetch(data.putUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!uploadRes.ok) throw new Error("Failed to upload to storage");
      } else {
        const formData = new FormData();
        formData.append("key", data.key);
        formData.append("file", file);
        const uploadRes = await fetch(data.putUrl, {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("Failed to upload file");
      }

      onChange(data.getUrl);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-cream overflow-hidden flex items-center justify-center border border-charcoal/8">
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl text-inkSoft">?</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-orange hover:underline disabled:opacity-60"
        >
          {uploading ? "Uploading..." : value ? "Change photo" : "Upload photo"}
        </button>
      </div>
    </div>
  );
}
