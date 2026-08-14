import {
  hasPermission,
  hasRole,
  requirePermission,
  requireRole,
  requireResourceOwner,
  type AuthorizedUser,
} from "@/lib/rbac";

const baseUser: AuthorizedUser = {
  id: "u1",
  email: "test@example.com",
  name: "Test User",
  college: "Test College",
  isAdmin: false,
  roles: ["Student"],
  permissions: ["hackathon.read", "service.book"],
};

describe("hasPermission", () => {
  it("returns false for null user", () => {
    expect(hasPermission(null, "hackathon.read")).toBe(false);
  });

  it("returns true when user has the exact permission", () => {
    expect(hasPermission(baseUser, "hackathon.read")).toBe(true);
  });

  it("returns false when user lacks the permission", () => {
    expect(hasPermission(baseUser, "hackathon.delete")).toBe(false);
  });

  it("grants all permissions to admin users", () => {
    const admin = { ...baseUser, isAdmin: true };
    expect(hasPermission(admin, "hackathon.delete")).toBe(true);
  });

  it("grants all permissions to Super Admin role", () => {
    const superAdmin = { ...baseUser, roles: ["Super Admin"] };
    expect(hasPermission(superAdmin, "admin.access")).toBe(true);
  });
});

describe("hasRole", () => {
  it("returns true when user has the role", () => {
    expect(hasRole(baseUser, "Student")).toBe(true);
  });

  it("returns false when user does not have the role", () => {
    expect(hasRole(baseUser, "Expert")).toBe(false);
  });

  it("returns false for null user", () => {
    expect(hasRole(null, "Student")).toBe(false);
  });
});

describe("requirePermission", () => {
  it("does not throw when permission is granted", () => {
    expect(() => requirePermission(baseUser, "hackathon.read")).not.toThrow();
  });

  it("throws FORBIDDEN when permission is missing", () => {
    expect(() => requirePermission(baseUser, "admin.access")).toThrow("FORBIDDEN");
  });
});

describe("requireRole", () => {
  it("does not throw when role is present", () => {
    expect(() => requireRole(baseUser, "Student")).not.toThrow();
  });

  it("throws FORBIDDEN when role is missing", () => {
    expect(() => requireRole(baseUser, "Expert")).toThrow("FORBIDDEN");
  });
});

describe("requireResourceOwner", () => {
  it("does not throw when user owns the resource", () => {
    expect(() => requireResourceOwner(baseUser, "u1")).not.toThrow();
  });

  it("throws FORBIDDEN when user does not own the resource", () => {
    expect(() => requireResourceOwner(baseUser, "u2")).toThrow("FORBIDDEN");
  });

  it("allows admins to access any resource", () => {
    const admin = { ...baseUser, isAdmin: true };
    expect(() => requireResourceOwner(admin, "u2")).not.toThrow();
  });
});
