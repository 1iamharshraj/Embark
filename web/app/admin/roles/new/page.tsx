import Link from "next/link";
import { notFound } from "next/navigation";
import { checkPagePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Eyebrow from "@/components/Eyebrow";
import RoleForm from "../_components/RoleForm";

export default async function NewRolePage() {
  await checkPagePermission("role.create");

  const permissions = await prisma.permission.findMany({
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });

  if (!permissions.length) notFound();

  return (
    <section className="bg-cream py-16 sm:py-24">
      <RoleForm
        mode="create"
        submitUrl="/api/admin/roles"
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
            <Eyebrow>New role</Eyebrow>
            <h1 className="font-display font-bold text-3xl text-charcoal mt-2">Create a role</h1>
          </>
        }
      />
    </section>
  );
}
