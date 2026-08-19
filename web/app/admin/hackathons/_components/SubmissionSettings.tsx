"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Button";

export interface SubmissionField {
  name: string;
  label: string;
  type: "text" | "textarea" | "url";
  required: boolean;
}

export interface FileRestrictions {
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  requiredFiles?: string[];
}

interface SubmissionSettingsProps {
  settings: string;
  onSettingsChange: (settings: string) => void;
}

function parseSettings(settings: string): Record<string, unknown> {
  try {
    return JSON.parse(settings || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

function parseFields(parsed: Record<string, unknown>): SubmissionField[] {
  if (!Array.isArray(parsed.submissionFields)) return [];
  return parsed.submissionFields
    .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
    .map((f) => ({
      name: typeof f.name === "string" ? f.name : "",
      label: typeof f.label === "string" ? f.label : "",
      type: ["text", "textarea", "url"].includes(f.type as string) ? (f.type as SubmissionField["type"]) : "text",
      required: typeof f.required === "boolean" ? f.required : false,
    }))
    .filter((f) => f.name && f.label);
}

function parseFileRestrictions(parsed: Record<string, unknown>): FileRestrictions {
  const raw = parsed.fileRestrictions as Record<string, unknown> | undefined;
  if (!raw) return {};
  return {
    allowedTypes: Array.isArray(raw.allowedTypes)
      ? raw.allowedTypes.filter((v): v is string => typeof v === "string")
      : undefined,
    maxFileSize: typeof raw.maxFileSize === "number" ? raw.maxFileSize : undefined,
    maxFiles: typeof raw.maxFiles === "number" ? raw.maxFiles : undefined,
    requiredFiles: Array.isArray(raw.requiredFiles)
      ? raw.requiredFiles.filter((v): v is string => typeof v === "string")
      : undefined,
  };
}

export default function SubmissionSettings({ settings, onSettingsChange }: SubmissionSettingsProps) {
  const parsed = useMemo(() => parseSettings(settings), [settings]);
  const initialFields = useMemo(() => parseFields(parsed), [parsed]);
  const initialRestrictions = useMemo(() => parseFileRestrictions(parsed), [parsed]);

  const [fields, setFields] = useState<SubmissionField[]>(initialFields);
  const [restrictions, setRestrictions] = useState<FileRestrictions>(initialRestrictions);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    setRestrictions(initialRestrictions);
  }, [initialRestrictions]);

  useEffect(() => {
    const next = {
      ...parsed,
      submissionFields: fields,
      fileRestrictions: restrictions,
    };
    onSettingsChange(JSON.stringify(next, null, 2));
  }, [fields, restrictions, parsed, onSettingsChange]);

  const addField = () => {
    setFields([...fields, { name: `field_${fields.length + 1}`, label: "", type: "text", required: false }]);
  };

  const updateField = (index: number, key: keyof SubmissionField, value: string | boolean) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const inputClass =
    "w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition";
  const labelClass = "block text-xs font-semibold text-charcoal mb-1";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-charcoal mb-1">Submission fields</h3>
        <p className="text-sm text-inkSoft mb-3">Define the fields teams must fill when submitting.</p>
        <div className="space-y-4">
          {fields.map((field, i) => (
            <div key={i} className="border border-charcoal/8 rounded-xl p-4 grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={field.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. businessImpact"
                />
              </div>
              <div>
                <label className={labelClass}>Label</label>
                <input
                  value={field.label}
                  onChange={(e) => updateField(i, "label", e.target.value)}
                  className={inputClass}
                  placeholder="Business impact"
                />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={field.type}
                  onChange={(e) => updateField(i, "type", e.target.value)}
                  className={inputClass}
                >
                  <option value="text">Text</option>
                  <option value="textarea">Textarea</option>
                  <option value="url">URL</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(i, "required", e.target.checked)}
                    className="rounded border-charcoal/30 text-orangeDeep focus:ring-orange"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <Button type="button" onClick={addField} variant="ghost" size="sm">
            + Add submission field
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-charcoal mb-1">File restrictions</h3>
        <p className="text-sm text-inkSoft mb-3">Leave empty to use defaults.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Allowed file extensions (comma separated)</label>
            <input
              value={(restrictions.allowedTypes || []).join(", ")}
              onChange={(e) =>
                setRestrictions({
                  ...restrictions,
                  allowedTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className={inputClass}
              placeholder=".pdf, .pptx, .zip"
            />
          </div>
          <div>
            <label className={labelClass}>Max file size (MB)</label>
            <input
              type="number"
              min={1}
              value={restrictions.maxFileSize || ""}
              onChange={(e) =>
                setRestrictions({
                  ...restrictions,
                  maxFileSize: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="20"
            />
          </div>
          <div>
            <label className={labelClass}>Max number of files</label>
            <input
              type="number"
              min={1}
              value={restrictions.maxFiles || ""}
              onChange={(e) =>
                setRestrictions({
                  ...restrictions,
                  maxFiles: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={inputClass}
              placeholder="5"
            />
          </div>
          <div>
            <label className={labelClass}>Required file names (comma separated)</label>
            <input
              value={(restrictions.requiredFiles || []).join(", ")}
              onChange={(e) =>
                setRestrictions({
                  ...restrictions,
                  requiredFiles: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className={inputClass}
              placeholder="presentation.pdf"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
