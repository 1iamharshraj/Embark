import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { hashSync } from "bcryptjs";
import { readFile } from "fs/promises";
import { prisma } from "../lib/prisma";
import { uploadFile } from "../lib/storage";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const DUMP_PATH = process.env.DUMP_PATH || "";

function exit(message: string) {
  console.log(message);
  process.exit(0);
}

function log(...args: unknown[]) {
  console.log("[migrate]", ...args);
}

function logError(...args: unknown[]) {
  console.error("[migrate]", ...args);
}

async function loadDump(): Promise<Record<string, unknown[]>> {
  if (DUMP_PATH) {
    const raw = await readFile(DUMP_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, unknown[]>;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    exit(
      "No Supabase source configured. Set one of:\n" +
        "  1. SUPABASE_URL + SUPABASE_SERVICE_KEY to read live tables, or\n" +
        "  2. DUMP_PATH to read a local JSON dump.\n" +
        "\nExample JSON dump shape:\n" +
        JSON.stringify({ users: [], profiles: [], competitions: [], registrations: [], submissions: [], advancements: [], winners: [] }, null, 2)
    );
  }

  const client: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const tables = [
    "users",
    "profiles",
    "competitions",
    "registrations",
    "submissions",
    "advancements",
    "winners",
  ];
  const dump: Record<string, unknown[]> = {};
  for (const table of tables) {
    log(`Fetching ${table}...`);
    const { data, error } = await client.from(table).select("*");
    if (error) {
      logError(`Warning: could not fetch ${table}: ${error.message}`);
      dump[table] = [];
    } else {
      dump[table] = (data as unknown[]) ?? [];
      log(`Fetched ${dump[table].length} ${table}`);
    }
  }
  return dump;
}

function cuid(): string {
  // Tiny CUID-like generator good enough for a one-off migration.
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `c${t}${r}`;
}

function defaultPassword(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string | number | Date);
  return isNaN(d.getTime()) ? null : d;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  return [];
}

function asJson(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  return value;
}

async function migrateUsers(users: unknown[]) {
  if (!users.length) return;
  log(`Migrating ${users.length} users...`);
  let skipped = 0;
  for (const row of users) {
    const r = row as Record<string, unknown>;
    const email = asString(r.email).toLowerCase().trim();
    if (!email) continue;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }

    const password = hashSync(defaultPassword(), 10);
    await prisma.user.create({
      data: {
        id: asString(r.id) || cuid(),
        email,
        name: asString(r.name || (r.profile as Record<string, unknown>)?.name || email.split("@")[0]),
        password,
        college: asString(r.college || (r.profile as Record<string, unknown>)?.college),
        isAdmin: asBool(r.isAdmin),
        createdAt: asDate(r.created_at) || new Date(),
        updatedAt: asDate(r.updated_at) || new Date(),
      },
    });
  }
  log(`Users done. New: ${users.length - skipped}, skipped: ${skipped}.`);
  log("NOTE: migrated users have random passwords. They must use password reset to log in.");
}

async function migrateCompetitions(competitions: unknown[]) {
  if (!competitions.length) return;
  log(`Migrating ${competitions.length} competitions...`);
  let skipped = 0;
  for (const row of competitions) {
    const r = row as Record<string, unknown>;
    const id = asString(r.id);
    if (!id) continue;

    const existing = await prisma.competition.findUnique({ where: { id } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.competition.create({
      data: {
        id,
        title: asString(r.title || r.name),
        host: asString(r.host) || "Embark India",
        category: asString(r.category) || "General Management",
        banner: asString(r.banner) || "orange",
        fee: asNumber(r.fee),
        teamMin: asNumber(r.team_min ?? r.teamMin, 1),
        teamMax: asNumber(r.team_max ?? r.teamMax, 4),
        eligibility: asString(r.eligibility),
        about: asString(r.about),
        rules: asStringArray(r.rules),
        prizes: asJson(r.prizes) ?? [],
        ppo: asBool(r.ppo),
        beginner: asBool(r.beginner),
        draft: asBool(r.draft) ? true : false,
        regOpen: asDate(r.reg_open ?? r.regOpen) || new Date(),
        regClose: asDate(r.reg_close ?? r.regClose) || new Date(),
        startAt: asDate(r.start_at ?? r.startAt) || new Date(),
        endAt: asDate(r.end_at ?? r.endAt) || new Date(),
        resultAt: asDate(r.result_at ?? r.resultAt),
        rounds: asJson(r.rounds) ?? [],
        eligibilityCriteria: asStringArray(r.eligibility_criteria ?? r.eligibilityCriteria),
        teamStructure: asStringArray(r.team_structure ?? r.teamStructure),
        institutes: asStringArray(r.institutes),
        compStructure: asStringArray(r.comp_structure ?? r.compStructure),
        submissionGuidelines: asStringArray(r.submission_guidelines ?? r.submissionGuidelines),
        contacts: asJson(r.contacts) ?? [],
        aboutHost: asString(r.about_host ?? r.aboutHost),
        faqs: asJson(r.faqs) ?? [],
        viewBoost: asNumber(r.view_boost ?? r.viewBoost),
        seedRegs: asNumber(r.seed_regs ?? r.seedRegs),
        banners: asStringArray(r.banners),
        views: asNumber(r.views),
      },
    });
  }
  log(`Competitions done. New: ${competitions.length - skipped}, skipped: ${skipped}.`);
}

async function migrateRegistrations(registrations: unknown[]): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();
  if (!registrations.length) return idMap;
  log(`Migrating ${registrations.length} registrations...`);

  for (const row of registrations) {
    const r = row as Record<string, unknown>;
    const oldId = asString(r.id);
    if (!oldId) continue;

    const newId = cuid();
    idMap.set(oldId, newId);
    const userId = asString(r.user_id ?? r.userId);
    const compId = asString(r.comp_id ?? r.compId);
    if (!userId || !compId) continue;

    const existing = await prisma.registration.findUnique({ where: { id: newId } }).catch(() => null);
    if (existing) continue;

    try {
      await prisma.registration.create({
        data: {
          id: newId,
          userId,
          compId,
          teamName: asString(r.team_name ?? r.teamName) || "Team",
          members: asJson(r.members) ?? [],
          createdAt: asDate(r.created_at) || new Date(),
        },
      });
    } catch (e) {
      logError(`Skipped registration ${oldId}:`, (e as Error).message);
    }
  }
  return idMap;
}

async function migrateSubmissions(
  submissions: unknown[],
  registrationIdMap: Map<string, string>,
  supabase?: SupabaseClient
) {
  if (!submissions.length) return;
  log(`Migrating ${submissions.length} submissions...`);
  for (const row of submissions) {
    const r = row as Record<string, unknown>;
    const oldRegId = asString(r.reg_id ?? r.regId ?? r.registration_id);
    const regId = registrationIdMap.get(oldRegId) || oldRegId;
    const compId = asString(r.comp_id ?? r.compId);
    const userId = asString(r.user_id ?? r.userId);
    const roundIdx = asNumber(r.round_idx ?? r.roundIdx, 0);
    if (!regId || !compId || !userId) continue;

    let filePath = asString(r.file_path ?? r.filePath ?? r.file_url ?? r.fileUrl);
    if (filePath && supabase && filePath.startsWith("http")) {
      try {
        const path = new URL(filePath).pathname;
        const { data, error } = await supabase.storage.from("submissions").download(path);
        if (error || !data) throw error || new Error("No data");
        const buffer = Buffer.from(await data.arrayBuffer());
        const key = `uploads/${userId}/${compId}/round${roundIdx}/migrated-${Date.now()}`;
        await uploadFile(buffer, key, "application/octet-stream");
        filePath = key;
        log(`Copied submission file ${path} -> ${key}`);
      } catch (e) {
        logError(`Could not migrate file ${filePath}:`, (e as Error).message);
      }
    }

    try {
      await prisma.submission.create({
        data: {
          id: cuid(),
          compId,
          regId,
          userId,
          roundIdx,
          filePath: filePath || null,
          link: asString(r.link) || null,
          note: asString(r.note),
          createdAt: asDate(r.created_at) || new Date(),
          updatedAt: asDate(r.updated_at) || new Date(),
        },
      });
    } catch (e) {
      logError(`Skipped submission:`, (e as Error).message);
    }
  }
  log("Submissions done.");
}

async function migrateAdvancements(advancements: unknown[], registrationIdMap: Map<string, string>) {
  if (!advancements.length) return;
  log(`Migrating ${advancements.length} advancements...`);
  for (const row of advancements) {
    const r = row as Record<string, unknown>;
    const compId = asString(r.comp_id ?? r.compId);
    const oldRegId = asString(r.reg_id ?? r.regId ?? r.registration_id);
    const regId = registrationIdMap.get(oldRegId) || oldRegId;
    const roundIdx = asNumber(r.round_idx ?? r.roundIdx, 0);
    if (!compId || !regId) continue;

    try {
      await prisma.advancement.create({
        data: {
          compId,
          regId,
          roundIdx,
          createdAt: asDate(r.created_at) || new Date(),
        },
      });
    } catch (e) {
      logError(`Skipped advancement:`, (e as Error).message);
    }
  }
  log("Advancements done.");
}

async function migrateWinners(winners: unknown[], registrationIdMap: Map<string, string>) {
  if (!winners.length) return;
  log(`Migrating ${winners.length} winners...`);
  for (const row of winners) {
    const r = row as Record<string, unknown>;
    const compId = asString(r.comp_id ?? r.compId);
    const oldRegId = asString(r.reg_id ?? r.regId ?? r.registration_id);
    const regId = registrationIdMap.get(oldRegId) || oldRegId;
    if (!compId || !regId) continue;

    try {
      await prisma.winner.create({
        data: {
          compId,
          regId,
          rank: asNumber(r.rank, 1),
          teamName: asString(r.team_name ?? r.teamName) || "Team",
          createdAt: asDate(r.created_at) || new Date(),
        },
      });
    } catch (e) {
      logError(`Skipped winner:`, (e as Error).message);
    }
  }
  log("Winners done.");
}

async function main() {
  const dump = await loadDump();
  const supabase =
    SUPABASE_URL && SUPABASE_SERVICE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
      : undefined;

  await migrateUsers(dump.users || []);
  await migrateCompetitions(dump.competitions || []);
  const regIdMap = await migrateRegistrations(dump.registrations || []);
  await migrateSubmissions(dump.submissions || [], regIdMap, supabase);
  await migrateAdvancements(dump.advancements || [], regIdMap);
  await migrateWinners(dump.winners || [], regIdMap);

  await prisma.$disconnect();
  log("Migration complete.");
}

main().catch(async (e) => {
  logError(e);
  await prisma.$disconnect();
  process.exit(1);
});
