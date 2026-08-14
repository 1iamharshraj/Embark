"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

interface College {
  id: string;
  name: string;
  shortName: string | null;
  city: string;
  affiliation: string | null;
  accreditation: string | null;
  establishedYear: number | null;
  feesMin: number | null;
  feesMax: number | null;
  avgPackage: number | null;
  highestPackage: number | null;
  specializations: string[];
  entranceExams: string[];
  facilities: string[];
  website: string | null;
  phone: string | null;
  email: string | null;
  rankState: number | null;
}

interface FilterOptions {
  cities: string[];
  specializations: string[];
  accreditations: string[];
  entranceExams: string[];
}

interface CollegeSearchClientProps {
  initialColleges: College[];
  filters: FilterOptions;
}

function formatCurrency(n: number | null) {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatLakhs(n: number | null) {
  if (n == null) return "—";
  return `₹${(n / 100000).toFixed(1)}L`;
}

export function CollegeSearchClient({ initialColleges, filters }: CollegeSearchClientProps) {
  const searchParams = useSearchParams();

  const [colleges, setColleges] = useState<College[]>(initialColleges);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [specialization, setSpecialization] = useState(searchParams.get("specialization") || "");
  const [accreditation, setAccreditation] = useState(searchParams.get("accreditation") || "");
  const [entranceExam, setEntranceExam] = useState(searchParams.get("entranceExam") || "");
  const [maxFees, setMaxFees] = useState(searchParams.get("maxFees") || "");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sync selected IDs from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mbaCompareIds");
      if (raw) setSelectedIds(new Set(JSON.parse(raw)));
    } catch {
      // ignore
    }
  }, []);

  // Persist selected IDs to localStorage.
  useEffect(() => {
    localStorage.setItem("mbaCompareIds", JSON.stringify(Array.from(selectedIds)));
  }, [selectedIds]);

  const activeFilters = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (specialization) params.set("specialization", specialization);
    if (accreditation) params.set("accreditation", accreditation);
    if (entranceExam) params.set("entranceExam", entranceExam);
    if (maxFees) params.set("maxFees", maxFees);
    return params;
  }, [search, city, specialization, accreditation, entranceExam, maxFees]);

  useEffect(() => {
    const query = activeFilters.toString();
    const url = query ? `/api/mba-colleges?${query}` : "/api/mba-colleges";

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.colleges)) setColleges(data.colleges);
      })
      .catch(() => setColleges(initialColleges))
      .finally(() => setLoading(false));

    // Keep URL in sync without navigation.
    const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [activeFilters, initialColleges]);

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setCity("");
    setSpecialization("");
    setAccreditation("");
    setEntranceExam("");
    setMaxFees("");
  }

  const selectedColleges = useMemo(
    () => colleges.filter((c) => selectedIds.has(c.id)),
    [colleges, selectedIds]
  );

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Search</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="College name or city"
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All cities</option>
              {filters.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All specializations</option>
              {filters.specializations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Accreditation</label>
            <select
              value={accreditation}
              onChange={(e) => setAccreditation(e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All</option>
              {filters.accreditations.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Entrance exam</label>
            <select
              value={entranceExam}
              onChange={(e) => setEntranceExam(e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All exams</option>
              {filters.entranceExams.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Max fees per year</label>
            <select
              value={maxFees}
              onChange={(e) => setMaxFees(e.target.value)}
              className="w-full rounded-xl border border-charcoal/12 px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">Any</option>
              <option value="300000">Under ₹3L</option>
              <option value="600000">Under ₹6L</option>
              <option value="1000000">Under ₹10L</option>
              <option value="1500000">Under ₹15L</option>
              <option value="2500000">Under ₹25L</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-orangeDeep hover:underline"
          >
            Clear filters
          </button>
          <p className="text-sm text-inkSoft">
            {loading ? "Loading..." : `${colleges.length} college${colleges.length === 1 ? "" : "s"} found`}
          </p>
        </div>
      </div>

      {/* Compare bar */}
      {selectedIds.size > 0 && (
        <div className="bg-white rounded-2xl border border-orange/30 shadow-[0_2px_8px_rgba(22,22,22,0.06)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {selectedIds.size} selected for comparison
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedColleges.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-orangeSoft text-orangeDeep rounded-full px-2.5 py-1"
                >
                  {c.shortName || c.name}
                  <button
                    onClick={() => toggleSelection(c.id)}
                    className="hover:text-charcoal"
                    aria-label={`Remove ${c.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-sm font-semibold text-inkSoft hover:text-charcoal"
            >
              Clear
            </button>
            <Button
              href={`/mba-colleges-tamilnadu/compare?ids=${Array.from(selectedIds).join(",")}`}
            >
              Compare now
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && colleges.length === 0 ? (
        <div className="py-12 text-center text-inkSoft">Loading colleges...</div>
      ) : colleges.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-inkSoft">
          No colleges match your filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {colleges.map((college) => {
            const selected = selectedIds.has(college.id);
            return (
              <div
                key={college.id}
                className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-5 sm:p-6 flex flex-col transition ${
                  selected ? "ring-2 ring-orange" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-charcoal leading-tight">
                      {college.name}
                    </h3>
                    {college.shortName && (
                      <p className="text-xs text-inkSoft mt-0.5">{college.shortName}</p>
                    )}
                  </div>
                  {college.rankState && (
                    <span className="shrink-0 text-xs font-bold text-orangeDeep bg-orangeSoft rounded-full w-7 h-7 flex items-center justify-center">
                      #{college.rankState}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-inkSoft mb-4">
                  <p>
                    <span className="font-semibold text-charcoal">Location:</span> {college.city}
                    {college.establishedYear ? ` · Est. ${college.establishedYear}` : ""}
                  </p>
                  {college.affiliation && (
                    <p>
                      <span className="font-semibold text-charcoal">Affiliation:</span> {college.affiliation}
                    </p>
                  )}
                  {college.accreditation && (
                    <p>
                      <span className="font-semibold text-charcoal">Accreditation:</span> {college.accreditation}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-charcoal">Fees/year:</span>{" "}
                    {college.feesMin && college.feesMax
                      ? `${formatCurrency(college.feesMin)} – ${formatCurrency(college.feesMax)}`
                      : formatCurrency(college.feesMax ?? college.feesMin)}
                  </p>
                  <p>
                    <span className="font-semibold text-charcoal">Avg package:</span>{" "}
                    {formatLakhs(college.avgPackage)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {college.specializations.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-xs font-medium bg-cream text-charcoal border border-charcoal/8 rounded-full px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                  {college.specializations.length > 4 && (
                    <span className="text-xs text-inkSoft">+{college.specializations.length - 4}</span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelection(college.id)}
                    disabled={!selected && selectedIds.size >= 3}
                    className={`flex-1 text-center rounded-full font-semibold px-4 py-2.5 text-sm transition disabled:opacity-50 ${
                      selected
                        ? "bg-orangeSoft text-orangeDeep hover:bg-orange/20"
                        : "bg-cream text-charcoal border border-charcoal/15 hover:bg-orange/10"
                    }`}
                  >
                    {selected ? "Remove" : "Compare"}
                  </button>
                  {college.website && (
                    <Link
                      href={college.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-orangeDeep hover:underline"
                    >
                      Visit
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
