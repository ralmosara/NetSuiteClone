"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

type Permission = { code: string; accessLevel: string };
type ModuleName = "dashboard" | "sales" | "purchasing" | "inventory" | "finance" | "payroll" | "reports" | "setup";

export function usePermissions() {
  const { data: session } = useSession();

  const permissions: Permission[] = (session?.user as any)?.permissions ?? [];
  const role: string = (session?.user as any)?.role ?? "";

  return useMemo(() => {
    const permissionSet = new Set(permissions.map((p) => p.code));

    const hasPermission = (code: string): boolean => permissionSet.has(code);

    const hasAnyPermission = (codes: string[]): boolean =>
      codes.some((code) => permissionSet.has(code));

    const hasModuleAccess = (module: ModuleName): boolean =>
      permissions.some((p) => p.code.startsWith(`${module}:`));

    return { hasPermission, hasAnyPermission, hasModuleAccess, role, permissions };
  }, [permissions, role]);
}
