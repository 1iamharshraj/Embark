"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

interface DocumentUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function DocumentUpload({ label, value, onChange }: DocumentUploadProps) {
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
        body: JSON.stringify({ folder: "verifications", filename: file.name, contentType: file.type }),
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
        const uploadRes = await fetch(data.putUrl, { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Failed to upload file");
      }

      onChange(data.getUrl);
      toast.success(`${label} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-charcoal">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold bg-cream text-charcoal border border-charcoal/12 rounded-xl px-4 py-2.5 hover:border-charcoal/25 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : value ? "Replace file" : "Upload file"}
        </button>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-orange hover:underline truncate max-w-[200px]"
          >
            View file
          </a>
        )}
      </div>
    </div>
  );
}
