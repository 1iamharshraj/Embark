"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { parseRounds, parsePrizes, parseFaqs, parseContacts, roundStatus, roundBadgeClass, roundIsOpen, statusBadgeClass, type Member } from "@/lib/competition";

interface CompetitionDetailClientProps {
  competition: {
    id: string;
    title: string;
    host: string;
    category: string;
    banner: string;
    fee: number;
    teamMin: number;
    teamMax: number;
    eligibility: string;
    about: string;
    rules: string[];
    prizes: unknown;
    ppo: boolean;
    beginner: boolean;
    regOpen: string;
    regClose: string;
    startAt: string;
    endAt: string;
    resultAt: string | null;
    status: string;
    rounds: unknown;
    eligibilityCriteria: string[];
    teamStructure: string[];
    institutes: string[];
    compStructure: string[];
    submissionGuidelines: string[];
    contacts: unknown;
    aboutHost: string;
    faqs: unknown;
    registrationCount: number;
    winners: { rank: number; teamName: string; members: unknown }[];
  };
  user: { id: string; name: string; email: string; college: string } | null;
  registration: {
    id: string;
    teamName: string;
    members: unknown;
    submissions: { id: string; roundIdx: number; link: string | null; filePath: string | null; note: string }[];
  } | null;
}

export default function CompetitionDetailClient({ competition, user, registration }: CompetitionDetailClientProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [activeRound, setActiveRound] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [regForm, setRegForm] = useState({ teamName: "", members: [{ name: user?.name ?? "", email: user?.email ?? "", college: user?.college ?? "" }] });
  const [submitForm, setSubmitForm] = useState<{ roundIdx: number; note: string; link: string; file: File | null }>({ roundIdx: 0, note: "", link: "", file: null });
  const [submitting, setSubmitting] = useState(false);
  const [certLoading, setCertLoading] = useState(false);

  const rounds = parseRounds(competition.rounds);
  const prizes = parsePrizes(competition.prizes);
  const faqs = parseFaqs(competition.faqs);
  const contacts = parseContacts(competition.contacts);
  const regMembers = registration ? (Array.isArray(registration.members) ? (registration.members as Member[]) : []) : [];

  const statusClass = statusBadgeClass(competition.status);

  const addMember = () => {
    if (regForm.members.length < competition.teamMax) {
      setRegForm((prev) => ({ ...prev, members: [...prev.members, { name: "", email: "", college: "" }] }));
    }
  };

  const removeMember = (index: number) => {
    setRegForm((prev) => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    setRegForm((prev) => {
      const members = [...prev.members];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, members };
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const res = await fetch(`/api/competitions/${competition.id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regForm),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setMessage(json.error || "Registration failed");
      return;
    }
    setMessage("Registered successfully! Refreshing…");
    setShowRegister(false);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    setSubmitting(true);
    setMessage("");

    let res: Response;
    if (submitForm.file) {
      const formData = new FormData();
      formData.append("roundIdx", String(submitForm.roundIdx));
      formData.append("note", submitForm.note);
      formData.append("link", submitForm.link);
      formData.append("file", submitForm.file);
      res = await fetch(`/api/competitions/${competition.id}/submit`, {
        method: "POST",
        body: formData,
      });
    } else {
      res = await fetch(`/api/competitions/${competition.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundIdx: submitForm.roundIdx,
          note: submitForm.note,
          link: submitForm.link,
        }),
      });
    }

    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setMessage(json.error || "Submission failed");
      return;
    }
    setMessage("Submission saved!");
    setActiveRound(null);
    window.location.reload();
  };

  const downloadCertificate = async (type: "winner" | "participation") => {
    setCertLoading(true);
    setMessage("");
    const res = await fetch(`/api/competitions/${competition.id}/certificate`, { method: "POST" });
    setCertLoading(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json.error || "Certificate not available");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `embark-${type}-certificate-${competition.id}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mySubmissionFor = (roundIdx: number) => registration?.submissions.find((s) => s.roundIdx === roundIdx);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream py-16 sm:py-20 lg:py-24">
        <svg className="absolute -top-32 -right-32 w-80 opacity-90 pointer-events-none" viewBox="0 0 330 300" aria-hidden="true">
          <path fill="#2E6BFF" d="M236 20c46 25 86 70 82 114-4 44-52 88-106 102-53 14-110-4-142-42C38 156 32 98 58 60 84 21 142 3 182 6c20 2 38 7 54 14Z" />
        </svg>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-orangeSoft text-orangeDeep rounded-full px-3 py-1">{competition.category}</span>
              <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${statusClass}`}>{competition.status}</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-charcoal leading-tight mb-4">{competition.title}</h1>
            <p className="text-lg text-inkSoft mb-6">{competition.about || competition.eligibility}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-inkSoft">Host: <strong className="text-charcoal">{competition.host}</strong></span>
              <span className="text-inkSoft">Fee: <strong className="text-charcoal">{competition.fee > 0 ? `₹${competition.fee}` : "Free"}</strong></span>
              <span className="text-inkSoft">Team: <strong className="text-charcoal">{competition.teamMin}–{competition.teamMax}</strong></span>
              {competition.ppo && <span className="text-inkSoft">PPO: <strong className="text-charcoal">Yes</strong></span>}
              {competition.beginner && <span className="text-inkSoft">Beginner-friendly: <strong className="text-charcoal">Yes</strong></span>}
              <span className="text-inkSoft">Registered: <strong className="text-charcoal">{competition.registrationCount}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.4fr] gap-12 items-start">
            <div className="space-y-10">
              {message && (
                <div className={`rounded-xl px-4 py-3 text-sm ${message.includes("failed") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {message}
                </div>
              )}

              {competition.eligibility && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Eligibility</h2>
                  <p className="text-charcoal leading-relaxed">{competition.eligibility}</p>
                </div>
              )}

              {competition.about && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">About</h2>
                  <p className="text-charcoal leading-relaxed whitespace-pre-line">{competition.about}</p>
                </div>
              )}

              {competition.rules.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Rules</h2>
                  <ul className="grid gap-3">
                    {competition.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3 text-charcoal">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange mt-2" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rounds.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-4">Rounds</h2>
                  <div className="grid gap-4">
                    {rounds.map((round, i) => {
                      const status = roundStatus(round);
                      const mySub = mySubmissionFor(i);
                      return (
                        <div key={i} className="bg-cream rounded-2xl p-5 border border-charcoal/8">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-orange tracking-widest">Round {i + 1}</span>
                            <span className={`text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 ${roundBadgeClass(status)}`}>{status}</span>
                          </div>
                          <h3 className="font-display font-bold text-lg text-charcoal mb-2">{round.name}</h3>
                          {round.brief && <p className="text-sm text-inkSoft mb-2">{round.brief}</p>}
                          {(round.opens || round.closes) && (
                            <p className="text-xs text-inkSoft mb-3">
                              {round.opens && new Date(round.opens).toLocaleString("en-IN")}
                              {round.opens && round.closes && " — "}
                              {round.closes && new Date(round.closes).toLocaleString("en-IN")}
                            </p>
                          )}
                          {mySub && (
                            <div className="text-sm text-green-700 font-medium mb-2">
                              Submitted
                              {mySub.link && <a href={mySub.link} target="_blank" rel="noreferrer" className="ml-2 text-orange hover:underline">View link</a>}
                              {mySub.filePath && <a href={`/api/submissions/${mySub.id}/download`} className="ml-2 text-orange hover:underline">Download</a>}
                            </div>
                          )}
                          {registration && roundIsOpen(round) && activeRound !== i && (
                            <Button onClick={() => { setActiveRound(i); setSubmitForm({ roundIdx: i, note: "", link: "", file: null }); }}>
                              {mySub ? "Update submission" : "Submit for this round"}
                            </Button>
                          )}
                          {activeRound === i && (
                            <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                              <input type="hidden" value={i} readOnly />
                              <div>
                                <label className="block text-xs font-semibold text-inkSoft mb-1">Link</label>
                                <input type="url" className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" value={submitForm.link} onChange={(e) => setSubmitForm((prev) => ({ ...prev, link: e.target.value }))} placeholder="https://…" />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-inkSoft mb-1">Note</label>
                                <textarea className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" rows={2} value={submitForm.note} onChange={(e) => setSubmitForm((prev) => ({ ...prev, note: e.target.value }))} />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-inkSoft mb-1">File (optional)</label>
                                <input type="file" className="text-sm" onChange={(e) => setSubmitForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))} />
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save submission"}</Button>
                                <button type="button" onClick={() => setActiveRound(null)} className="text-sm font-semibold text-inkSoft hover:underline">Cancel</button>
                              </div>
                            </form>
                          )}
                          {!registration && status === "open" && (
                            <p className="text-sm text-inkSoft">Sign in and register to submit.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {prizes.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Prizes</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {prizes.map(([label, value], i) => (
                      <div key={i} className="bg-cream rounded-xl p-4 border border-charcoal/8">
                        <div className="text-sm font-semibold text-orange">{label}</div>
                        <div className="text-charcoal">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {competition.eligibilityCriteria.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Eligibility criteria</h2>
                  <ul className="grid gap-2">
                    {competition.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="text-sm text-charcoal flex items-start gap-2"><span className="text-orange">✓</span>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {competition.teamStructure.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Team structure</h2>
                  <ul className="grid gap-2">
                    {competition.teamStructure.map((c, i) => (
                      <li key={i} className="text-sm text-charcoal flex items-start gap-2"><span className="text-orange">✓</span>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {competition.submissionGuidelines.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Submission guidelines</h2>
                  <ul className="grid gap-2">
                    {competition.submissionGuidelines.map((c, i) => (
                      <li key={i} className="text-sm text-charcoal flex items-start gap-2"><span className="text-orange">✓</span>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {competition.aboutHost && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">About the host</h2>
                  <p className="text-charcoal leading-relaxed whitespace-pre-line">{competition.aboutHost}</p>
                </div>
              )}

              {contacts.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Contacts</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {contacts.map((c, i) => (
                      <div key={i} className="bg-cream rounded-xl p-4 text-sm">
                        <div className="font-semibold text-charcoal">{c.name}</div>
                        {c.role && <div className="text-inkSoft">{c.role}</div>}
                        {c.email && <a href={`mailto:${c.email}`} className="text-orange hover:underline">{c.email}</a>}
                        {c.phone && <div className="text-inkSoft">{c.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {faqs.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-3">FAQs</h2>
                  <div className="grid gap-4">
                    {faqs.map((f, i) => (
                      <div key={i} className="bg-cream rounded-2xl p-5">
                        <h3 className="font-display font-bold text-base text-charcoal mb-2">{f.question}</h3>
                        <p className="text-sm text-inkSoft">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {competition.winners.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-charcoal mb-4">Winners</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {competition.winners.map((w, i) => (
                      <div key={i} className="bg-cream rounded-xl p-4 border border-charcoal/8">
                        <div className="text-sm font-semibold text-orange">{rankLabel(w.rank)}</div>
                        <div className="font-display font-bold text-lg text-charcoal">{w.teamName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="bg-cream rounded-3xl p-6 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] lg:sticky lg:top-24">
              <h3 className="font-display font-bold text-lg text-charcoal mb-4">Key dates</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between"><span className="text-inkSoft">Registration opens</span><span className="font-medium text-charcoal">{new Date(competition.regOpen).toLocaleDateString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-inkSoft">Registration closes</span><span className="font-medium text-charcoal">{new Date(competition.regClose).toLocaleDateString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-inkSoft">Competition starts</span><span className="font-medium text-charcoal">{new Date(competition.startAt).toLocaleDateString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="text-inkSoft">Competition ends</span><span className="font-medium text-charcoal">{new Date(competition.endAt).toLocaleDateString("en-IN")}</span></div>
                {competition.resultAt && <div className="flex justify-between"><span className="text-inkSoft">Results</span><span className="font-medium text-charcoal">{new Date(competition.resultAt).toLocaleDateString("en-IN")}</span></div>}
              </div>

              {!user && (
                <div className="space-y-3">
                  <p className="text-sm text-inkSoft">Sign in to register your team and submit round entries.</p>
                  <Button href="/login" className="w-full">Sign in to register</Button>
                </div>
              )}

              {user && !registration && (
                <div className="space-y-3">
                  {competition.status === "Live" && competition.fee === 0 ? (
                    <>
                      <p className="text-sm text-inkSoft">Registration is open. Build your team and register now.</p>
                      <Button onClick={() => setShowRegister(true)} className="w-full">Register now</Button>
                    </>
                  ) : (
                    <p className="text-sm text-inkSoft">Registration is {competition.status === "Live" ? "paid and not supported yet" : "closed"}.</p>
                  )}
                </div>
              )}

              {user && registration && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-orange mb-1">My team</div>
                    <div className="font-display font-bold text-lg text-charcoal">{registration.teamName}</div>
                    <ul className="text-sm text-inkSoft mt-2 space-y-1">
                      {regMembers.map((m, i) => (
                        <li key={i}>{m.name} — {m.college}</li>
                      ))}
                    </ul>
                  </div>

                  {registration.submissions.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-orange mb-1">Submissions</div>
                      <ul className="text-sm space-y-1">
                        {registration.submissions.map((s) => (
                          <li key={s.id} className="text-charcoal">
                            Round {s.roundIdx + 1}
                            {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="ml-2 text-orange hover:underline">Link</a>}
                            {s.filePath && <a href={`/api/submissions/${s.id}/download`} className="ml-2 text-orange hover:underline">Download</a>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(competition.winners.length > 0 || new Date() > new Date(competition.endAt)) && (
                    <Button onClick={() => downloadCertificate("participation")} disabled={certLoading} variant="ghost" className="w-full">
                      {certLoading ? "Generating…" : "Download participation certificate"}
                    </Button>
                  )}

                  {competition.winners.some((w) => w.teamName === registration.teamName) && (
                    <Button onClick={() => downloadCertificate("winner")} disabled={certLoading} className="w-full">
                      {certLoading ? "Generating…" : "Download winner certificate"}
                    </Button>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* Registration modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 bg-navy/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-charcoal">Register for {competition.title}</h2>
              <button onClick={() => setShowRegister(false)} className="text-inkSoft hover:text-charcoal">✕</button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">Team name</label>
                <input className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" value={regForm.teamName} onChange={(e) => setRegForm((prev) => ({ ...prev, teamName: e.target.value }))} required />
              </div>
              {regForm.members.map((member, i) => (
                <div key={i} className="bg-cream rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">Member {i + 1}</span>
                    {regForm.members.length > 1 && (
                      <button type="button" onClick={() => removeMember(i)} className="text-xs text-red-600 hover:underline">Remove</button>
                    )}
                  </div>
                  <input className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" placeholder="Name" value={member.name} onChange={(e) => updateMember(i, "name", e.target.value)} required />
                  <input className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" placeholder="Email" type="email" value={member.email} onChange={(e) => updateMember(i, "email", e.target.value)} required />
                  <input className="w-full rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-sm" placeholder="College" value={member.college} onChange={(e) => updateMember(i, "college", e.target.value)} required />
                </div>
              ))}
              {regForm.members.length < competition.teamMax && (
                <button type="button" onClick={addMember} className="text-sm font-semibold text-orange hover:underline">+ Add member</button>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Registering…" : "Register"}</Button>
                <button type="button" onClick={() => setShowRegister(false)} className="px-5 py-2.5 text-sm font-semibold text-inkSoft hover:text-charcoal">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function rankLabel(rank: number): string {
  if (rank === 1) return "1st Place";
  if (rank === 2) return "2nd Place";
  if (rank === 3) return "3rd Place";
  return `${rank}th Place`;
}
