"use client";

import { useState, useEffect, useMemo } from "react";
import Button from "@/components/Button";

export interface RegistrationField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "url";
  required: boolean;
  options: string;
}

interface CustomRegistrationFieldsProps {
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

function parseFields(parsed: Record<string, unknown>): RegistrationField[] {
  if (!Array.isArray(parsed.registrationFields)) return [];
  return parsed.registrationFields
    .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
    .map((f) => ({
      name: typeof f.name === "string" ? f.name : "",
      label: typeof f.label === "string" ? f.label : "",
      type: ["text", "textarea", "number", "select", "checkbox", "url"].includes(f.type as string)
        ? (f.type as RegistrationField["type"])
        : "text",
      required: typeof f.required === "boolean" ? f.required : false,
      options: Array.isArray(f.options) ? f.options.filter((o): o is string => typeof o === "string").join("\n") : "",
    }))
    .filter((f) => f.name && f.label);
}

export default function CustomRegistrationFields({ settings, onSettingsChange }: CustomRegistrationFieldsProps) {
  const parsed = useMemo(() => parseSettings(settings), [settings]);
  const initialFields = useMemo(() => parseFields(parsed), [parsed]);
  const [fields, setFields] = useState<RegistrationField[]>(initialFields);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  useEffect(() => {
    const next = {
      ...parsed,
      registrationFields: fields.map((f) => ({
        ...f,
        options: f.type === "select" ? f.options.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
      })),
    };
    onSettingsChange(JSON.stringify(next, null, 2));
  }, [fields, parsed, onSettingsChange]);

  const addField = () => {
    setFields([...fields, { name: `field_${fields.length + 1}`, label: "", type: "text", required: false, options: "" }]);
  };

  const updateField = (index: number, key: keyof RegistrationField, value: string | boolean) => {
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
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={i} className="border border-charcoal/8 rounded-xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Field name (unique key)</label>
              <input
                value={field.name}
                onChange={(e) => updateField(i, "name", e.target.value)}
                className={inputClass}
                placeholder="e.g. tshirtSize"
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                value={field.label}
                onChange={(e) => updateField(i, "label", e.target.value)}
                className={inputClass}
                placeholder="T-shirt size"
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
                <option value="number">Number</option>
                <option value="url">URL</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(i, "required", e.target.checked)}
                  className="rounded border-charcoal/30 text-orangeDeep focus:ring-orange"
                />
                Required
              </label>
            </div>
          </div>
          {field.type === "select" && (
            <div>
              <label className={labelClass}>Options (one per line)</label>
              <textarea
                value={field.options}
                onChange={(e) => updateField(i, "options", e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="S&#10;M&#10;L"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => removeField(i)}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Remove field
          </button>
        </div>
      ))}
      <Button type="button" onClick={addField} variant="ghost" size="sm">
        + Add custom field
      </Button>
      {fields.length === 0 && <p className="text-sm text-inkSoft">No custom fields yet.</p>}
    </div>
  );
}
