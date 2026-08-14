import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const socialLinksSchema = z
  .object({
    linkedIn: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
  })
  .optional();

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

const serviceSchema = z.array(z.string()).default([]);

const availabilityItemSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm format"),
  timeZone: z.string().default("Asia/Kolkata"),
});

const availabilitySchema = z.array(availabilityItemSchema);

const onboardingSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  bSchool: z.string().optional(),
  degree: z.string().optional(),
  specialization: z.string().optional(),
  graduationYear: z.coerce.number().min(1950).max(2050).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  previousCompanies: commaList,
  yearsExperience: z.coerce.number().min(0).optional(),
  industry: z.string().optional(),
  function: z.string().optional(),
  expertise: commaList,
  socialLinks: socialLinksSchema,
  country: z.string().optional(),
  currency: z.string().optional(),
  whatsappNumber: z.string().optional(),
  onboardingStep: z.coerce.number().min(0).optional(),
  onboardingComplete: z.boolean().optional(),
  services: serviceSchema,
  availabilities: availabilitySchema.optional(),
});

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

async function generateUniqueSlug(name: string | null | undefined): Promise<string> {
  const base = slugify(name || "expert") || "expert";
  let slug = `${base}-${randomBytes(3).toString("hex")}`;
  let attempts = 0;
  while (await prisma.expertProfile.findUnique({ where: { slug } })) {
    slug = `${base}-${randomBytes(4).toString("hex")}`;
    attempts += 1;
    if (attempts > 10) {
      slug = `${base}-${Date.now().toString(36)}`;
      break;
    }
  }
  return slug;
}

const SERVICE_TEMPLATES: Record<
  string,
  { type: string; name: string; durationMinutes?: number; price: number }
> = {
  "1:1 Mentorship": { type: "ONE_ON_ONE", name: "1:1 Mentorship", durationMinutes: 30, price: 149900 },
  "Quick chat": { type: "ONE_ON_ONE", name: "Quick chat", durationMinutes: 15, price: 49900 },
  "Resume review": { type: "ONE_ON_ONE", name: "Resume review", durationMinutes: 30, price: 149900 },
  "Career guidance": { type: "ONE_ON_ONE", name: "Career guidance", durationMinutes: 30, price: 149900 },
  "Interview prep": { type: "ONE_ON_ONE", name: "Interview prep", durationMinutes: 30, price: 149900 },
  "Discovery Call": { type: "ONE_ON_ONE", name: "Discovery Call", durationMinutes: 30, price: 149900 },
  "Mock interview": { type: "ONE_ON_ONE", name: "Mock interview", durationMinutes: 60, price: 249900 },
  "Priority DM": { type: "PRIORITY_DM", name: "Priority DM", price: 99900 },
  "Ask me anything": { type: "PRIORITY_DM", name: "Ask me anything", price: 99900 },
};

async function assignExpertRole(userId: string) {
  const expertRole = await prisma.role.findUnique({
    where: { name: "Expert" },
  });
  if (!expertRole) return;
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: expertRole.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: expertRole.id,
    },
  });
}

async function getOnboardingState(userId: string) {
  const profile = await prisma.expertProfile.findUnique({
    where: { userId },
    include: {
      services: { orderBy: { createdAt: "desc" } },
      availabilities: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
  return { profile };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { profile } = await getOnboardingState(session.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET onboarding error:", error);
    return NextResponse.json({ message: "Failed to load onboarding state" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = session.user.id;

    const existing = await prisma.expertProfile.findUnique({
      where: { userId },
      include: { services: true },
    });

    const create = !existing;

    const profile = await prisma.$transaction(async (tx) => {
      const upserted = await tx.expertProfile.upsert({
        where: { userId },
        create: {
          userId,
          slug: await generateUniqueSlug(session.user.name),
          headline: data.headline?.trim() || null,
          bio: data.bio?.trim() || null,
          location: data.location?.trim() || null,
          bSchool: data.bSchool?.trim() || null,
          degree: data.degree?.trim() || null,
          specialization: data.specialization?.trim() || null,
          graduationYear: data.graduationYear,
          currentCompany: data.currentCompany?.trim() || null,
          currentRole: data.currentRole?.trim() || null,
          previousCompanies: data.previousCompanies,
          yearsExperience: data.yearsExperience,
          industry: data.industry?.trim() || null,
          function: data.function?.trim() || null,
          expertise: data.expertise,
          socialLinks: data.socialLinks || undefined,
          country: data.country?.trim() || "IN",
          currency: data.currency?.trim() || "INR",
          whatsappNumber: data.whatsappNumber?.trim() || null,
          onboardingStep: data.onboardingStep ?? 0,
          onboardingComplete: data.onboardingComplete ?? false,
          verificationStatus: "UNVERIFIED",
          isPublic: false,
        },
        update: {
          headline: data.headline?.trim() || undefined,
          bio: data.bio?.trim() || undefined,
          location: data.location?.trim() || undefined,
          bSchool: data.bSchool?.trim() || undefined,
          degree: data.degree?.trim() || undefined,
          specialization: data.specialization?.trim() || undefined,
          graduationYear: data.graduationYear,
          currentCompany: data.currentCompany?.trim() || undefined,
          currentRole: data.currentRole?.trim() || undefined,
          previousCompanies: data.previousCompanies.length ? data.previousCompanies : undefined,
          yearsExperience: data.yearsExperience,
          industry: data.industry?.trim() || undefined,
          function: data.function?.trim() || undefined,
          expertise: data.expertise.length ? data.expertise : undefined,
          socialLinks: data.socialLinks ? data.socialLinks : undefined,
          country: data.country?.trim() || undefined,
          currency: data.currency?.trim() || undefined,
          whatsappNumber: data.whatsappNumber?.trim() || undefined,
          onboardingStep:
            data.onboardingStep !== undefined ? data.onboardingStep : undefined,
          onboardingComplete:
            data.onboardingComplete === true || (data.onboardingStep !== undefined && data.onboardingStep >= 6)
              ? true
              : undefined,
        },
      });

      if (create) {
        await assignExpertRole(userId);
      }

      // Create default services for selections that don't already exist (by name).
      if (data.services.length) {
        const existingNames = new Set(existing?.services.map((s) => s.name) || []);
        for (const key of data.services) {
          const template = SERVICE_TEMPLATES[key];
          if (!template || existingNames.has(template.name)) continue;
          await tx.service.create({
            data: {
              expertProfileId: upserted.id,
              createdById: userId,
              type: template.type,
              name: template.name,
              description: ``,
              durationMinutes: template.durationMinutes,
              price: template.price,
              currency: upserted.currency || "INR",
              isActive: true,
            },
          });
          existingNames.add(template.name);
        }
      }

      // Replace availability with the supplied weekly schedule.
      if (data.availabilities && data.availabilities.length) {
        await tx.serviceAvailability.deleteMany({
          where: { expertProfileId: upserted.id },
        });
        await tx.serviceAvailability.createMany({
          data: data.availabilities.map((a) => ({
            expertProfileId: upserted.id,
            createdById: userId,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
            timeZone: a.timeZone,
          })),
        });
      }

      return upserted;
    });

    const { profile: fullProfile } = await getOnboardingState(userId);

    return NextResponse.json({ profile: fullProfile }, { status: create ? 201 : 200 });
  } catch (error) {
    console.error("POST onboarding error:", error);
    return NextResponse.json({ message: "Failed to save onboarding progress" }, { status: 500 });
  }
}
