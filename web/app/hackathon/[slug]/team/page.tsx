import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import { RemoveMemberButton, LeaveTeamButton } from "./_components/TeamActions";

export const dynamic = "force-dynamic";

export default async function HackathonTeamPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/hackathon/${params.slug}/team`);
  }

  const hackathon = await prisma.hackathon.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, slug: true, participationMode: true, teamMin: true, teamMax: true },
  });
  if (!hackathon) notFound();

  const team = await prisma.hackathonTeam.findFirst({
    where: { hackathonId: hackathon.id, members: { some: { userId: session.user.id } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      },
      leader: { select: { id: true, name: true, email: true } },
      submission: { select: { status: true } },
    },
  });

  if (!team) {
    redirect(`/hackathon/${hackathon.slug}/register`);
  }

  const isLeader = team.leaderId === session.user.id;
  const lockedStatuses = ["LOCKED", "UNDER_EVALUATION", "EVALUATED", "SHORTLISTED", "WINNER", "REJECTED"];
  const locked = team.submission ? lockedStatuses.includes(team.submission.status) : false;
  const canManage = isLeader && !locked;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl mx-auto">
          <Eyebrow>Team</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-2">{team.name}</h1>
          <p className="text-inkSoft mb-8">
            {hackathon.title} · {team.members.length} member{team.members.length !== 1 ? "s" : ""}
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal/8 pb-4">
              <div>
                <p className="font-semibold text-charcoal">{team.leader.name}</p>
                <p className="text-sm text-inkSoft">{team.leader.email}</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider bg-orangeSoft text-orangeDeep rounded-full px-3 py-1">
                Leader
              </span>
            </div>

            {team.members
              .filter((m) => m.userId !== team.leaderId)
              .map((member) => (
                <div key={member.userId} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-charcoal">{member.user.name}</p>
                    <p className="text-sm text-inkSoft">{member.user.email}</p>
                  </div>
                  {canManage && <RemoveMemberButton teamId={team.id} userId={member.userId} />}
                </div>
              ))}

            {canManage && team.members.length < hackathon.teamMax && (
              <Button href={`/hackathon/${hackathon.slug}`} variant="ghost" size="sm" className="mt-2">
                Invite members from hackathon page
              </Button>
            )}
          </div>

          {!isLeader && !locked && (
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-charcoal/8 p-6">
              <h3 className="font-semibold text-charcoal mb-2">Leave team</h3>
              <p className="text-sm text-inkSoft mb-4">You can leave the team before a submission is locked.</p>
              <LeaveTeamButton teamId={team.id} />
            </div>
          )}

          {locked && (
            <div className="mt-6 bg-cream rounded-2xl border border-charcoal/8 p-6 text-center">
              <p className="text-charcoal font-semibold">Team is locked</p>
              <p className="text-sm text-inkSoft">The submission has been finalized. Team changes are disabled.</p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
