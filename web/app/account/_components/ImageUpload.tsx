"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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

      onChange(data.publicUrl || data.getUrl);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative group w-24 h-24 rounded-full bg-cream overflow-hidden flex items-center justify-center border border-charcoal/8">
        {value ? (
          <Image src={value} alt="Profile" fill className="object-cover" sizes="96px" />
        ) : (
          <span className="text-3xl text-inkSoft font-bold">{uploading ? "…" : "?"}</span>
        )}
        <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <span className="text-white text-xs font-semibold text-center px-2">Change</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
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
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 text-sm hover:bg-[#1740A8] transition disabled:opacity-60"
        >
          {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
        </button>
        <p className="text-xs text-inkSoft mt-2">JPG, PNG or WEBP. Recommended size 400×400px.</p>
      </div>
    </div>
  );
}
