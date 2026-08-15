"use client";

// ExpertShell — wraps all /expert/* dashboard pages.
// Navigation is handled by the global Nav (mega-menu dropdown for experts).
// This component only provides the page-level background and max-width container.

interface ExpertShellProps {
  children: React.ReactNode;
  expertSlug?: string | null;
  expertName?: string;
}

export default function ExpertShell({ children }: ExpertShellProps) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
