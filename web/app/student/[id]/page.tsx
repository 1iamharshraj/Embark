import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { certificateTypeLabel } from "@/lib/certificate";

export const dynamic = "force-dynamic";

export default async function StudentPublicProfilePage({ params }: { params: { id: string } }) {
  const [session, user] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findUnique({
      where: { id: params.id },
      include: {
        studentProfile: true,
        expertProfile: { select: { id: true } },
      },
    }),
  ]);

  if (!user || !user.studentProfile) {
    notFound();
  }

  const isOwner = session?.user?.id === user.id;
  const profile = user.studentProfile;

  if (!profile.isPublic && !isOwner) {
    notFound();
  }

  const [teams, certificates, bookings, completedBookings, dms] = await Promise.all([
    prisma.hackathonTeam.findMany({
      where: { OR: [{ leaderId: user.id }, { members: { some: { userId: user.id } } }] },
      include: {
        hackathon: { select: { id: true, title: true, slug: true } },
        submission: { include: { result: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      include: { hackathon: { select: { title: true, slug: true } } },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { clientId: user.id, status: { notIn: ["CANCELLED", "REFUNDED"] } },
      select: { id: true },
    }),
    prisma.booking.findMany({
      where: { clientId: user.id, status: "COMPLETED" },
      select: { id: true },
    }),
    prisma.priorityDM.findMany({
      where: { studentId: user.id, status: { notIn: ["CANCELLED", "REFUNDED", "EXPIRED"] } },
      select: { id: true },
    }),
  ]);

  const hackathonCount = teams.length;
  const winnerCount = teams.filter((t) => t.submission?.result?.award === "WINNER").length;
  const finalistCount = teams.filter((t) => t.submission?.result?.award === "FINALIST").length;
  const runnerUpCount = teams.filter((t) => t.submission?.result?.award === "RUNNER_UP").length;
  const mentorshipSessions = bookings.length + dms.length;
  const completedSessions = completedBookings.length;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Eyebrow>Student profile</Eyebrow>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2 mb-1">{user.name}</h1>
          {profile.college && (
            <p className="text-inkSoft text-lg mb-6">
              {profile.degree && `${profile.degree} · `}
              {profile.college}
              {profile.graduationYear && ` · ${profile.graduationYear}`}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-charcoal/8 p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{hackathonCount}</p>
              <p className="text-xs text-inkSoft uppercase tracking-wider">Hackathons</p>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal/8 p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{winnerCount + runnerUpCount + finalistCount}</p>
              <p className="text-xs text-inkSoft uppercase tracking-wider">Recognitions</p>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal/8 p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{certificates.length}</p>
              <p className="text-xs text-inkSoft uppercase tracking-wider">Certificates</p>
            </div>
            <div className="bg-white rounded-2xl border border-charcoal/8 p-4 text-center">
              <p className="text-2xl font-bold text-charcoal">{mentorshipSessions}</p>
              <p className="text-xs text-inkSoft uppercase tracking-wider">Expert interactions</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_0.4fr] gap-8">
            <div className="space-y-8">
              {(profile.bio || profile.skills?.length || profile.targetRoles?.length || profile.targetIndustry) && (
                <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8">
                  <h2 className="font-display font-bold text-xl text-charcoal mb-4">About</h2>
                  {profile.bio && <p className="text-inkSoft whitespace-pre-line mb-4">{profile.bio}</p>}
                  {profile.targetIndustry && (
                    <p className="text-sm text-charcoal mb-2">
                      <strong>Target industry:</strong> {profile.targetIndustry}
                    </p>
                  )}
                  {profile.targetRoles && profile.targetRoles.length > 0 && (
                    <p className="text-sm text-charcoal mb-2">
                      <strong>Target roles:</strong> {profile.targetRoles.join(", ")}
                    </p>
                  )}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold uppercase tracking-wider bg-cream text-charcoal border border-charcoal/8 rounded-full px-3 py-1"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {teams.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8">
                  <h2 className="font-display font-bold text-xl text-charcoal mb-4">Hackathons</h2>
                  <div className="space-y-4">
                    {teams.map((team) => {
                      const award = team.submission?.result?.award;
                      return (
                        <div key={team.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-charcoal/8 last:border-0 pb-4 last:pb-0">
                          <div>
                            <p className="font-semibold text-charcoal">
                              <Link href={`/hackathon/${team.hackathon.slug}`} className="hover:text-orangeDeep transition">
                                {team.hackathon.title}
                              </Link>
                            </p>
                            <p className="text-sm text-inkSoft">{team.name}</p>
                            {team.submission && (
                              <p className="text-sm text-inkSoft">
                                Submission: {team.submission.title}
                                {team.submission.score !== null && ` · Score: ${team.submission.score}`}
                              </p>
                            )}
                          </div>
                          {award && (
                            <span className="inline-block text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1 bg-orangeSoft text-orangeDeep">
                              {award.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {certificates.length > 0 && (
                <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-8">
                  <h2 className="font-display font-bold text-xl text-charcoal mb-4">Certificates</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="rounded-2xl bg-cream p-4">
                        <p className="font-semibold text-charcoal">{certificateTypeLabel(cert.type)}</p>
                        <p className="text-sm text-inkSoft mb-3">{cert.hackathon.title}</p>
                        <Link
                          href={`/certificate/${cert.certificateId}`}
                          className="text-sm font-semibold text-orangeDeep hover:underline"
                        >
                          Verify →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {(profile.college || profile.degree || profile.specialization || profile.graduationYear || profile.currentSemester) && (
                <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
                  <h2 className="font-display font-bold text-lg text-charcoal mb-4">Education</h2>
                  <div className="space-y-3 text-sm">
                    {profile.college && (
                      <p>
                        <strong className="text-charcoal">College:</strong>{" "}
                        <span className="text-inkSoft">{profile.college}</span>
                      </p>
                    )}
                    {profile.degree && (
                      <p>
                        <strong className="text-charcoal">Degree:</strong>{" "}
                        <span className="text-inkSoft">{profile.degree}</span>
                      </p>
                    )}
                    {profile.specialization && (
                      <p>
                        <strong className="text-charcoal">Specialization:</strong>{" "}
                        <span className="text-inkSoft">{profile.specialization}</span>
                      </p>
                    )}
                    {profile.graduationYear && (
                      <p>
                        <strong className="text-charcoal">Graduation year:</strong>{" "}
                        <span className="text-inkSoft">{profile.graduationYear}</span>
                      </p>
                    )}
                    {profile.currentSemester && (
                      <p>
                        <strong className="text-charcoal">Semester:</strong>{" "}
                        <span className="text-inkSoft">{profile.currentSemester}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(profile.linkedIn || profile.website || profile.portfolio || profile.resumeUrl || profile.location) && (
                <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
                  <h2 className="font-display font-bold text-lg text-charcoal mb-4">Links</h2>
                  <div className="space-y-2 text-sm">
                    {profile.linkedIn && (
                      <a href={profile.linkedIn} target="_blank" rel="noreferrer" className="block text-orangeDeep hover:underline">
                        LinkedIn
                      </a>
                    )}
                    {profile.portfolio && (
                      <a href={profile.portfolio} target="_blank" rel="noreferrer" className="block text-orangeDeep hover:underline">
                        Portfolio
                      </a>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="block text-orangeDeep hover:underline">
                        Website
                      </a>
                    )}
                    {profile.resumeUrl && (
                      <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="block text-orangeDeep hover:underline">
                        Resume
                      </a>
                    )}
                    {profile.location && <p className="text-inkSoft">{profile.location}</p>}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-charcoal/8 p-6">
                <h2 className="font-display font-bold text-lg text-charcoal mb-4">Mentorship</h2>
                <div className="space-y-3 text-sm">
                  <p>
                    <strong className="text-charcoal">Sessions:</strong>{" "}
                    <span className="text-inkSoft">{mentorshipSessions}</span>
                  </p>
                  <p>
                    <strong className="text-charcoal">Completed:</strong>{" "}
                    <span className="text-inkSoft">{completedSessions}</span>
                  </p>
                </div>
              </div>

              {!profile.isPublic && isOwner && (
                <div className="rounded-2xl bg-orangeSoft p-4 text-sm text-charcoal">
                  Your profile is currently private. Only you can see this page.
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
