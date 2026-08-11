import Link from "next/link";
import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import RoleForm from "../../_components/RoleForm";

export default async function EditRolePage({ params }: { params: { id: string } }) {
  await checkPagePermission("role.update");

  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: { include: { permission: true } },
      },
    }),
    prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    }),
  ]);

  if (!role || !permissions.length) notFound();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <RoleForm
        mode="edit"
        submitUrl={`/api/admin/roles/${role.id}`}
        initial={{
          name: role.name,
          description: role.description || "",
          permissionIds: role.permissions.map((rp) => rp.permission.id),
        }}
        permissions={permissions.map((p) => ({
          id: p.id,
          resource: p.resource,
          action: p.action,
          description: p.description,
        }))}
        header={
          <>
            <Link href="/admin/roles" className="text-sm font-semibold text-orange hover:underline mb-4 inline-block">
              ← Back to roles
            </Link>
            <Eyebrow>Edit role</Eyebrow>
            <h1 className="font-display font-bold text-3xl text-charcoal mt-2">{role.name}</h1>
          </>
        }
      />
    </section>
  );
}
