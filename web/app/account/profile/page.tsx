import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import { StudentProfileForm } from "./_components/StudentProfileForm";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  if (!user) redirect("/login");

  const sp = user.studentProfile;

  const initial = {
    college: sp?.college || user.college || "",
    degree: sp?.degree || "",
    specialization: sp?.specialization || "",
    graduationYear: sp?.graduationYear || undefined,
    currentSemester: sp?.currentSemester || "",
    targetIndustry: sp?.targetIndustry || "",
    targetRoles: sp?.targetRoles?.join(", ") || "",
    skills: sp?.skills?.join(", ") || "",
    interests: sp?.interests?.join(", ") || "",
    resumeUrl: sp?.resumeUrl || "",
    portfolio: sp?.portfolio || "",
    bio: sp?.bio || "",
    linkedIn: sp?.linkedIn || "",
    website: sp?.website || "",
    location: sp?.location || "",
    isPublic: sp?.isPublic ?? true,
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Eyebrow>Profile</Eyebrow>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-charcoal mt-2">Student profile</h1>
        <p className="text-inkSoft mt-2 max-w-2xl">
          Add details that help mentors, recruiters and competition panels understand you.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-charcoal/8 shadow-[0_2px_8px_rgba(22,22,22,0.06),0_12px_32px_rgba(22,22,22,0.07)] p-6 sm:p-8">
        <StudentProfileForm initial={initial} />
      </div>
    </div>
  );
}
