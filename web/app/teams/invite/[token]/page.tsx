import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";

const SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export default async function AcceptInvitePage({ params }: { params: { token: string } }) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect(`/login?callbackUrl=/teams/invite/${params.token}`);
  }

  let payload: { teamId: string; email: string };
  try {
    payload = jwt.verify(params.token, SECRET) as { teamId: string; email: string };
  } catch {
    return (
      <section className="bg-cream py-24">
        <Container>
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-2">Invalid invite</h1>
            <p className="text-inkSoft">This invite link is invalid or has expired.</p>
          </div>
        </Container>
      </section>
    );
  }

  if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
    return (
      <section className="bg-cream py-24">
        <Container>
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-2">Email mismatch</h1>
            <p className="text-inkSoft">This invite was sent to {payload.email}. Please log in with that email.</p>
          </div>
        </Container>
      </section>
    );
  }

  const team = await prisma.hackathonTeam.findUnique({
    where: { id: payload.teamId },
    include: { members: true, hackathon: { select: { slug: true } } },
  });

  if (!team) {
    return (
      <section className="bg-cream py-24">
        <Container>
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 text-center">
            <h1 className="font-display font-bold text-2xl text-charcoal mb-2">Team not found</h1>
            <p className="text-inkSoft">The team you were invited to no longer exists.</p>
          </div>
        </Container>
      </section>
    );
  }

  const alreadyMember = team.members.find((m) => m.userId === user.id);
  if (!alreadyMember) {
    await prisma.hackathonTeamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "MEMBER",
      },
    });
  }

  redirect(`/hackathon/${team.hackathon.slug}`);
}
