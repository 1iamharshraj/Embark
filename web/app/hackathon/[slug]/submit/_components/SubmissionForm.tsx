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

interface SubmissionField {
  name: string;
  label: string;
  type: "text" | "textarea" | "url";
  required: boolean;
}

interface FileRestrictions {
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  requiredFiles?: string[];
}

interface SubmissionFormProps {
  hackathon: {
    id: string;
    slug: string;
    title: string;
    submissionOpen: boolean;
    submissionFields: SubmissionField[];
    fileRestrictions: FileRestrictions;
  };
  team: { id: string; name: string } | null;
  existing: {
    id: string;
    title: string;
    content: Record<string, unknown>;
    files: { name: string; url: string; type: string; size: number }[];
    status: string;
    locked: boolean;
  } | null;
}

const DEFAULT_FIELDS: SubmissionField[] = [
  { name: "problemUnderstanding", label: "Problem understanding", type: "textarea", required: true },
  { name: "solution", label: "Solution", type: "textarea", required: true },
  { name: "businessImpact", label: "Business impact", type: "textarea", required: true },
  { name: "presentation", label: "Presentation / approach", type: "textarea", required: false },
  { name: "githubUrl", label: "GitHub URL", type: "url", required: false },
  { name: "demoUrl", label: "Demo URL", type: "url", required: false },
  { name: "videoUrl", label: "Video URL", type: "url", required: false },
];

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
  const fields = hackathon.submissionFields.length > 0 ? hackathon.submissionFields : DEFAULT_FIELDS;
  const initialContent = (existing?.content || {}) as Record<string, string>;
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState<Record<string, string>>(initialContent);
  const [files, setFiles] = useState<FileItem[]>(
    existing?.files.map((f) => ({ name: f.name, url: f.url, type: f.type, size: f.size })) || []
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateContent(key: string, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function fileIsAllowed(file: File): boolean {
    const allowed = hackathon.fileRestrictions.allowedTypes;
    if (!allowed || allowed.length === 0) return true;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return allowed.some((t) => t.toLowerCase() === ext || t.toLowerCase() === file.type.toLowerCase());
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    if (hackathon.fileRestrictions.maxFiles && files.length + selected.length > hackathon.fileRestrictions.maxFiles) {
      toast.error(`You can upload at most ${hackathon.fileRestrictions.maxFiles} files.`);
      return;
    }

    const maxBytes = hackathon.fileRestrictions.maxFileSize ? hackathon.fileRestrictions.maxFileSize * 1024 * 1024 : undefined;
    for (const file of selected) {
      if (maxBytes && file.size > maxBytes) {
        toast.error(`${file.name} exceeds the ${hackathon.fileRestrictions.maxFileSize} MB limit.`);
        return;
      }
      if (!fileIsAllowed(file)) {
        toast.error(`${file.name} is not an allowed file type.`);
        return;
      }
    }

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

  function validate(): string | null {
    if (!title.trim()) return "Please enter a submission title.";
    for (const field of fields) {
      if (field.required && !content[field.name]?.trim()) {
        return `${field.label} is required.`;
      }
    }
    if (hackathon.fileRestrictions.requiredFiles && hackathon.fileRestrictions.requiredFiles.length > 0) {
      const fileNames = files.map((f) => f.name.toLowerCase());
      for (const required of hackathon.fileRestrictions.requiredFiles) {
        if (!fileNames.some((name) => name.includes(required.toLowerCase()))) {
          return `Missing required file: ${required}`;
        }
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team) {
      setError("You must register for this hackathon before submitting.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = {
      hackathonId: hackathon.id,
      title,
      content,
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

  if (existing?.locked) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 text-center">
        <p className="text-charcoal font-semibold mb-2">Submission is locked.</p>
        <p className="text-inkSoft text-sm mb-4">Your submission has been finalized and can no longer be edited.</p>
        <Link href={`/hackathon/${hackathon.slug}`} className="text-orangeDeep font-semibold hover:underline">
          Back to hackathon
        </Link>
      </div>
    );
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

  const inputClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const textareaClass =
    "w-full rounded-xl border border-charcoal/15 px-4 py-3 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const labelClass = "block text-sm font-semibold text-charcoal mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-6">
      <div>
        <label className={labelClass}>Submission title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
      </div>

      {fields.map((field) => (
        <div key={field.name}>
          <label className={labelClass}>
            {field.label}
            {field.required && <span className="text-red-600 ml-0.5">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={content[field.name] || ""}
              onChange={(e) => updateContent(field.name, e.target.value)}
              rows={5}
              className={textareaClass}
              required={field.required}
            />
          ) : (
            <input
              type={field.type === "url" ? "url" : "text"}
              value={content[field.name] || ""}
              onChange={(e) => updateContent(field.name, e.target.value)}
              className={inputClass}
              required={field.required}
            />
          )}
        </div>
      ))}

      <div>
        <label className={labelClass}>Files</label>
        {hackathon.fileRestrictions.allowedTypes && hackathon.fileRestrictions.allowedTypes.length > 0 && (
          <p className="text-xs text-inkSoft mb-2">
            Allowed: {hackathon.fileRestrictions.allowedTypes.join(", ")}
            {hackathon.fileRestrictions.maxFileSize ? ` · Max ${hackathon.fileRestrictions.maxFileSize} MB each` : ""}
            {hackathon.fileRestrictions.maxFiles ? ` · Max ${hackathon.fileRestrictions.maxFiles} files` : ""}
          </p>
        )}
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
