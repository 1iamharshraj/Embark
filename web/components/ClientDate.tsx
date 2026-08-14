"use client";

import { useEffect, useState } from "react";

interface ClientDateProps {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
}

export default function ClientDate({
  date,
  options = { dateStyle: "medium" },
  fallback = "…",
  className,
}: ClientDateProps) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    setFormatted(d.toLocaleString("en-IN", options));
  }, [date, options]);

  const iso =
    typeof date === "string"
      ? date
      : typeof date === "number"
      ? new Date(date).toISOString()
      : date.toISOString();

  return (
    <time dateTime={iso} className={className}>
      {formatted ?? fallback}
    </time>
  );
}
