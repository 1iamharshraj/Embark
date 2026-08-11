import Link from "next/link";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import UserRoleAssign from "./_components/UserRoleAssign";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  await checkPagePermission("user.view");

  const query = searchParams?.q || "";

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 50,
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
  ]);

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
            ← Back to admin
          </Link>
          <Eyebrow>RBAC</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mt-2 mb-8">Users</h1>

          <form className="mb-6">
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name or email"
              className="w-full sm:w-96 rounded-xl border border-charcoal/12 px-4 py-2.5 text-charcoal focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
            />
          </form>

          <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-charcoal/8">
                <tr>
                  <th className="text-left font-semibold text-charcoal px-5 py-3">User</th>
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
                    <td colSpan={3} className="px-5 py-10 text-center text-inkSoft">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
