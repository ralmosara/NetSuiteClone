"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { ReactNode } from "react";

interface PermissionGateProps {
  permission?: string;
  anyPermission?: string[];
  module?: "dashboard" | "sales" | "purchasing" | "inventory" | "finance" | "payroll" | "reports" | "setup";
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({
  permission,
  anyPermission,
  module,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasModuleAccess } = usePermissions();

  let allowed = false;

  if (permission) {
    allowed = hasPermission(permission);
  } else if (anyPermission) {
    allowed = hasAnyPermission(anyPermission);
  } else if (module) {
    allowed = hasModuleAccess(module);
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
