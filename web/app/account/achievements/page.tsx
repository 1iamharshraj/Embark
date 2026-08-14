import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import { displayStatus, hackathonStatus, statusBadgeClass, HackathonWithTimelines } from "@/lib/hackathon";
import { certificateTypeLabel } from "@/lib/certificate";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [registrations, teams, certificates] = await Promise.all([
    prisma.hackathonRegistration.findMany({
      where: { userId, status: "REGISTERED" },
      include: {
        hackathon: { include: { timelines: { orderBy: { startsAt: "asc" } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.hackathonTeam.findMany({
      where: { OR: [{ leaderId: userId }, { members: { some: { userId } } }] },
      include: {
        hackathon: { include: { timelines: { orderBy: { startsAt: "asc" } } } },
        submission: { include: { result: true, evaluations: { where: { finalizedAt: { not: null } } } } },
        members: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId },
      include: { hackathon: { select: { title: true, slug: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Eyebrow>Achievements</Eyebrow>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">My hackathons</h1>
        <p className="text-inkSoft mt-2">Your registrations, teams, submissions and certificates.</p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-8">
        <h2 className="font-display font-bold text-xl text-charcoal mb-5">Registrations</h2>
        {registrations.length === 0 ? (
          <p className="text-inkSoft">You haven&apos;t registered for any hackathons yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {registrations.map((reg) => {
              const h = reg.hackathon as HackathonWithTimelines;
              const status = hackathonStatus(h);
              return (
                <Link
                  key={reg.id}
                  href={`/hackathon/${h.slug}`}
                  className="group block rounded-2xl border border-charcoal/8 bg-cream p-5 hover:border-orange/40 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-inkSoft">
                      {h.category}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusBadgeClass(
                        status
                      )}`}
                    >
                      {displayStatus(h)}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal leading-tight group-hover:text-orangeDeep transition">
                    {h.title}
                  </h3>
                  <p className="text-sm text-inkSoft mt-1">Registered on {new Date(reg.createdAt).toLocaleDateString()}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8 mb-8">
        <h2 className="font-display font-bold text-xl text-charcoal mb-5">My teams & submissions</h2>
        {teams.length === 0 ? (
          <p className="text-inkSoft">You are not part of any team yet.</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="rounded-2xl border border-charcoal/8 bg-cream p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-charcoal">{team.name}</h3>
                    <p className="text-sm text-inkSoft">{team.hackathon.title}</p>
                  </div>
                  <Link
                    href={`/hackathon/${team.hackathon.slug}/submit`}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2 hover:bg-[#1740A8] transition text-sm"
                  >
                    {team.submission ? "Update submission" : "Submit solution"}
                  </Link>
                </div>
                {team.submission && (
                  <div className="text-sm text-charcoal">
                    <p>
                      <span className="font-semibold">Submission:</span> {team.submission.title}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span> {team.submission.status.replace(/_/g, " ")}
                    </p>
                    {team.submission.score !== null && (
                      <p>
                        <span className="font-semibold">Average score:</span> {team.submission.score}
                      </p>
                    )}
                    {team.submission.result && (
                      <p className="mt-1">
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-1 bg-orangeSoft text-orangeDeep">
                          Rank #{team.submission.result.rank} · {team.submission.result.award?.replace(/_/g, " ")}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
        <h2 className="font-display font-bold text-xl text-charcoal mb-5">Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-inkSoft">No certificates issued yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-2xl border border-charcoal/8 bg-cream p-5 flex flex-col"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft mb-2">
                  {cert.hackathon.title}
                </p>
                <h3 className="font-display font-bold text-lg text-charcoal mb-1">
                  {certificateTypeLabel(cert.type)}
                </h3>
                <p className="text-sm text-inkSoft mb-4">Issued {new Date(cert.issuedAt).toLocaleDateString()}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Link
                    href={`/certificate/${cert.certificateId}`}
                    className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-4 py-2 hover:bg-[#1740A8] transition text-sm"
                  >
                    Verify
                  </Link>
                  {cert.pdfUrl && (
                    <a
                      href={cert.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal border border-charcoal/15 px-4 py-2 hover:bg-orange/10 transition text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
