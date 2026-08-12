import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Button from "@/components/Button";
import UserRoleAssign from "./_components/UserRoleAssign";
import UserStatusToggle from "./_components/UserStatusToggle";

const PER_PAGE = 25;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string; role?: string; active?: string; college?: string; page?: string };
}) {
  await checkPagePermission("user.view");

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const query = searchParams?.q?.trim() || "";
  const roleFilter = searchParams?.role;
  const activeFilter = searchParams?.active;
  const collegeFilter = searchParams?.college?.trim() || "";
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10));

  const where: {
    OR?: { email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }[];
    active?: boolean;
    college?: { contains: string; mode: "insensitive" };
    roles?: { some: { roleId: string } };
  } = {};

  if (query) {
    where.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { name: { contains: query, mode: "insensitive" } },
    ];
  }

  if (activeFilter === "active") where.active = true;
  if (activeFilter === "suspended") where.active = false;
  if (collegeFilter) where.college = { contains: collegeFilter, mode: "insensitive" };
  if (roleFilter) where.roles = { some: { roleId: roleFilter } };

  const [users, roles, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        roles: {
          include: { role: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.role.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  function queryString(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (roleFilter) params.set("role", roleFilter);
    if (activeFilter) params.set("active", activeFilter);
    if (collegeFilter) params.set("college", collegeFilter);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) params.delete(k);
      else params.set(k, v);
    });
    const s = params.toString();
    return s ? `?${s}` : "";
  }

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
                ← Back to admin
              </Link>
              <Eyebrow>RBAC</Eyebrow>
              <h1 className="font-display font-bold text-3xl text-charcoal mt-2">Users</h1>
            </div>
            <Button href="/admin/roles">Manage roles</Button>
          </div>

          <form className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name or email"
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
            <select
              name="role"
              defaultValue={roleFilter || ""}
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              name="active"
              defaultValue={activeFilter || ""}
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <input
              name="college"
              type="search"
              defaultValue={collegeFilter}
              placeholder="Filter by college"
              className="rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-5 py-2.5 hover:bg-[#1740A8] transition"
              >
                Filter
              </button>
              <Link
                href="/admin/users"
                className="inline-flex items-center justify-center rounded-full font-semibold bg-cream text-charcoal border border-charcoal/15 px-5 py-2.5 hover:bg-orange/10 transition"
              >
                Reset
              </Link>
            </div>
          </form>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">User</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">College</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Status</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Current roles</th>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">Assign roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-charcoal/8 last:border-0 align-top">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal">{u.name}</div>
                      <div className="text-xs text-inkSoft">{u.email}</div>
                    </td>
                    <td className="px-5 py-4 text-inkSoft">{u.college || "—"}</td>
                    <td className="px-5 py-4">
                      <UserStatusToggle userId={u.id} active={u.active} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((ur) => (
                          <span
                            key={ur.role.id}
                            className="inline-block text-xs bg-cream text-inkSoft rounded-full px-2 py-0.5 border border-charcoal/8"
                          >
                            {ur.role.name}
                          </span>
                        ))}
                        {u.roles.length === 0 && <span className="text-xs text-inkSoft">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <UserRoleAssign
                        user={{
                          id: u.id,
                          email: u.email,
                          name: u.name,
                          roles: u.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
                        }}
                        allRoles={roles}
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-inkSoft">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-inkSoft">
              Showing {users.length} of {total} users · Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users${queryString({ page: String(page - 1) })}`}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-white border border-charcoal/8 text-charcoal px-4 py-2 hover:border-orange/40 transition"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users${queryString({ page: String(page + 1) })}`}
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-white border border-charcoal/8 text-charcoal px-4 py-2 hover:border-orange/40 transition"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
