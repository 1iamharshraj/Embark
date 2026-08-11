import { prisma } from "../lib/prisma";

async function main() {
  console.log("roles:", await prisma.role.count());
  console.log("permissions:", await prisma.permission.count());
  console.log("rolePermissions:", await prisma.rolePermission.count());
  console.log("userRoles:", await prisma.userRole.count());

  const admin = await prisma.user.findUnique({
    where: { email: "ajay.san36@gmail.com" },
    include: { roles: { include: { role: true } } },
  });

  console.log("admin roles:", admin?.roles.map((r) => r.role.name));

  const superAdmin = await prisma.role.findUnique({
    where: { name: "Super Admin" },
    include: { permissions: { include: { permission: true } } },
  });

  console.log("Super Admin permissions:", superAdmin?.permissions.length);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
