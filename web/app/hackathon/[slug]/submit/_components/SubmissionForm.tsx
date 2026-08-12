"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Button from "@/components/Button";

interface FileItem {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface SubmissionFormProps {
  hackathon: {
    id: string;
    slug: string;
    title: string;
    submissionOpen: boolean;
  };
  team: { id: string; name: string } | null;
  existing: { id: string; title: string; content: Record<string, unknown>; files: { name: string; url: string; type: string; size: number }[] } | null;
}

async function uploadFile(file: File): Promise<FileItem | null> {
  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "submissions", filename: file.name, contentType: file.type }),
  });
  const data = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok) {
    toast.error(data.message || "Presign failed");
    return null;
  }

  if (data.putUrl.startsWith("http")) {
    const uploadRes = await fetch(data.putUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    if (!uploadRes.ok) {
      toast.error("Failed to upload to storage");
      return null;
    }
  } else {
    const formData = new FormData();
    formData.append("key", data.key);
    formData.append("file", file);
    const uploadRes = await fetch(data.putUrl, { method: "POST", body: formData });
    if (!uploadRes.ok) {
      toast.error("Failed to upload file");
      return null;
    }
  }

  return { name: file.name, url: data.getUrl, type: file.type, size: file.size };
}

export default function SubmissionForm({ hackathon, team, existing }: SubmissionFormProps) {
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(JSON.stringify(existing?.content || {}, null, 2));
  const [files, setFiles] = useState<FileItem[]>(
    existing?.files.map((f) => ({ name: f.name, url: f.url, type: f.type, size: f.size })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setUploading(true);
    const uploaded: FileItem[] = [];
    for (const file of selected) {
      const item = await uploadFile(file);
      if (item) uploaded.push(item);
    }
    setFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team) {
      setError("You must register for this hackathon before submitting.");
      return;
    }

    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      setError("Content must be valid JSON.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      hackathonId: hackathon.id,
      title,
      content: parsedContent,
      files,
    };

    const url = existing ? `/api/v1/submissions/${existing.id}` : "/api/v1/submissions";
    const method = existing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.message || "Failed to submit");
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  }

  if (!hackathon.submissionOpen) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">Submissions are closed.</p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">You must register first.</p>
        <Link href={`/hackathon/${hackathon.slug}/register`} className="text-orangeDeep font-semibold hover:underline">
          Register →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">Submission saved!</p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-1">Submission title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-1">Content (JSON)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange/30"
          required
        />
        <p className="text-xs text-inkSoft mt-1">Use JSON to submit structured answers, links, or notes.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Files</label>
        <input
          type="file"
          multiple
          onChange={handleFiles}
          disabled={uploading}
          className="block w-full text-sm text-inkSoft file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cream file:text-charcoal hover:file:bg-orange/10"
        />
        {uploading && <p className="text-sm text-inkSoft mt-2">Uploading…</p>}
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between text-sm text-charcoal bg-cream rounded-xl px-4 py-2">
              <a href={f.url} target="_blank" rel="noreferrer" className="text-orangeDeep hover:underline truncate max-w-[240px]">
                {f.name}
              </a>
              <button type="button" onClick={() => removeFile(i)} className="text-red-600 font-semibold text-xs hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition disabled:opacity-50"
        >
          {submitting ? "Submitting…" : existing ? "Update submission" : "Submit solution"}
        </button>
        <Button href={`/hackathon/${hackathon.slug}`} variant="ghost" size="sm">
          Cancel
        </Button>
      </div>
    </form>
  );
}
