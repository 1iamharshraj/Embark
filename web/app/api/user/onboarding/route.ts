import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type PrismaTx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const commaList = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  })
  .default([]);

const onboardingSchema = z
  .object({
    persona: z.enum(["student", "expert", "institution", "recruiter"]),
    // Student fields
    college: z.string().optional(),
    graduationYear: z.coerce.number().min(1950).max(2050).optional(),
    specialization: z.string().optional(),
    targetIndustry: z.string().optional(),
    targetRoles: z.string().optional(),
    skills: z.string().optional(),
    interests: z.string().optional(),
    bio: z.string().optional(),
    linkedIn: z.string().optional(),
    location: z.string().optional(),
    // Expert fields
    currentRole: z.string().optional(),
    company: z.string().optional(),
    yearsExperience: z.coerce.number().min(0).optional(),
    expertise: commaList,
    headline: z.string().optional(),
    bSchool: z.string().optional(),
    industry: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    // Organization fields
    name: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    roleIntent: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.persona === "student") {
      if (!data.college || data.college.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "College is required",
          path: ["college"],
        });
      }
      return;
    }

    if (data.persona === "expert") {
      // Expert details are collected in the dedicated onboarding wizard.
      return;
    }

    // institution or recruiter
    if (!data.name || data.name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization name is required",
        path: ["name"],
      });
    }
  });

async function assignRole(tx: PrismaTx, userId: string, roleName: string) {
  const role = await tx.role.findUnique({ where: { name: roleName } });
  if (!role) return false;
  await tx.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });
  return true;
}

async function removeRole(tx: PrismaTx, userId: string, roleName: string) {
  const role = await tx.role.findUnique({ where: { name: roleName } });
  if (!role) return;
  await tx.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });
}

function splitList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const userId = session.user.id;

  try {
    let redirectTo = "/account";

    await prisma.$transaction(async (tx) => {
      if (data.persona === "student") {
        await tx.studentProfile.upsert({
          where: { userId },
          create: {
            userId,
            college: data.college?.trim(),
            graduationYear: data.graduationYear,
            specialization: data.specialization?.trim() || null,
            targetIndustry: data.targetIndustry?.trim() || null,
            targetRoles: splitList(data.targetRoles),
            skills: splitList(data.skills),
            interests: splitList(data.interests),
            bio: data.bio?.trim() || null,
            linkedIn: data.linkedIn?.trim() || null,
            location: data.location?.trim() || null,
          },
          update: {
            college: data.college?.trim(),
            graduationYear: data.graduationYear,
            specialization: data.specialization?.trim() || null,
            targetIndustry: data.targetIndustry?.trim() || null,
            targetRoles: splitList(data.targetRoles),
            skills: splitList(data.skills),
            interests: splitList(data.interests),
            bio: data.bio?.trim() || null,
            linkedIn: data.linkedIn?.trim() || null,
            location: data.location?.trim() || null,
          },
        });

        await assignRole(tx, userId, "Student");

        await tx.user.update({
          where: { id: userId },
          data: {
            onboardingComplete: true,
            onboardingRole: "Student",
            college: data.college?.trim() || "",
          },
        });

        redirectTo = "/account";
        return;
      }

      if (data.persona === "expert") {
        // Expert profile details are collected in the dedicated onboarding wizard.
        // Here we only set the role and leave onboardingComplete false so the
        // middleware redirects to /getting-started until the wizard is finished.
        await removeRole(tx, userId, "Student");
        await assignRole(tx, userId, "Expert");

        await tx.user.update({
          where: { id: userId },
          data: {
            onboardingComplete: false,
            onboardingRole: "Expert",
          },
        });

        redirectTo = "/expert/onboarding";
        return;
      }

      // institution or recruiter
      const type = data.persona === "institution" ? "INSTITUTION" : "RECRUITER";
      const roleName = data.persona === "institution" ? "Institution" : "Recruiter";
      redirectTo = data.persona === "institution" ? "/invite-an-expert" : "/account";

      await tx.organizationProfile.upsert({
        where: { userId },
        create: {
          userId,
          type,
          name: data.name!.trim(),
          city: data.city?.trim() || null,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          industry: data.industry?.trim() || null,
          roleIntent: data.roleIntent?.trim() || null,
        },
        update: {
          type,
          name: data.name!.trim(),
          city: data.city?.trim() || null,
          phone: data.phone?.trim() || null,
          website: data.website?.trim() || null,
          industry: data.industry?.trim() || null,
          roleIntent: data.roleIntent?.trim() || null,
        },
      });

      await removeRole(tx, userId, "Student");
      await assignRole(tx, userId, roleName);

      await tx.user.update({
        where: { id: userId },
        data: {
          onboardingComplete: true,
          onboardingRole: roleName,
        },
      });
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    const roles = updatedUser?.roles.map((ur) => ur.role.name) || [];
    const permissionsSet = new Set<string>();
    updatedUser?.roles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissionsSet.add(`${rp.permission.resource}.${rp.permission.action}`);
      });
    });

    return NextResponse.json({
      ok: true,
      redirectTo,
      onboardingComplete: updatedUser?.onboardingComplete ?? true,
      roles,
      permissions: Array.from(permissionsSet),
    });
  } catch (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json({ error: "Failed to save onboarding details" }, { status: 500 });
  }
}
