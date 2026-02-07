"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
  dashboard: { label: "Dashboard", icon: "dashboard" },
  sales: { label: "Sales", icon: "point_of_sale" },
  purchasing: { label: "Purchasing", icon: "shopping_cart" },
  inventory: { label: "Inventory", icon: "inventory_2" },
  finance: { label: "Finance", icon: "account_balance" },
  payroll: { label: "Payroll", icon: "payments" },
  reports: { label: "Reports", icon: "analytics" },
  setup: { label: "Setup", icon: "settings" },
};

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [editing, setEditing] = useState(false);
  // Map of permissionId → true for checked permissions
  const [checkedPerms, setCheckedPerms] = useState<Record<string, boolean>>({});

  const { data: role, isLoading, error } = trpc.setup.getRole.useQuery({ id });
  const { data: allPermissions } = trpc.setup.getPermissions.useQuery();
  const utils = trpc.useUtils();

  const updatePermsMutation = trpc.setup.updateRolePermissions.useMutation({
    onSuccess: () => {
      toast({ title: "Permissions updated", description: "Role permissions have been saved." });
      utils.setup.getRole.invalidate({ id });
      utils.setup.getRoles.invalidate();
      setEditing(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    if (!allPermissions) return {};
    const grouped: Record<string, typeof allPermissions> = {};
    for (const perm of allPermissions) {
      if (!grouped[perm.module]) grouped[perm.module] = [];
      grouped[perm.module].push(perm);
    }
    return grouped;
  }, [allPermissions]);

  const modules = Object.keys(permissionsByModule).sort(
    (a, b) => Object.keys(MODULE_LABELS).indexOf(a) - Object.keys(MODULE_LABELS).indexOf(b)
  );

  // Get all unique actions across all permissions
  const actions = useMemo(() => {
    if (!allPermissions) return [];
    const actionSet = new Set<string>();
    for (const perm of allPermissions) {
      const action = perm.code.split(":")[1];
      if (action) actionSet.add(action);
    }
    return ["view", "create", "edit", "delete"].filter((a) => actionSet.has(a));
  }, [allPermissions]);

  // Build a lookup: "module:action" → permissionId
  const permLookup = useMemo(() => {
    if (!allPermissions) return {};
    const map: Record<string, string> = {};
    for (const perm of allPermissions) {
      map[perm.code] = perm.id;
    }
    return map;
  }, [allPermissions]);

  // Set of currently assigned permission IDs
  const assignedPermIds = useMemo(() => {
    if (!role) return new Set<string>();
    return new Set(role.permissions.map((rp) => rp.permissionId));
  }, [role]);

  // Initialize checked permissions from role data
  useEffect(() => {
    if (role && allPermissions) {
      const initial: Record<string, boolean> = {};
      for (const rp of role.permissions) {
        initial[rp.permissionId] = true;
      }
      setCheckedPerms(initial);
    }
  }, [role, allPermissions]);

  const togglePerm = (permId: string) => {
    setCheckedPerms((prev) => ({ ...prev, [permId]: !prev[permId] }));
  };

  const toggleModule = (module: string) => {
    const modulePerms = permissionsByModule[module] || [];
    const allChecked = modulePerms.every((p) => checkedPerms[p.id]);
    const update: Record<string, boolean> = { ...checkedPerms };
    for (const p of modulePerms) {
      update[p.id] = !allChecked;
    }
    setCheckedPerms(update);
  };

  const toggleAll = () => {
    if (!allPermissions) return;
    const allChecked = allPermissions.every((p) => checkedPerms[p.id]);
    const update: Record<string, boolean> = {};
    for (const p of allPermissions) {
      update[p.id] = !allChecked;
    }
    setCheckedPerms(update);
  };

  const handleSave = () => {
    const perms = Object.entries(checkedPerms)
      .filter(([, checked]) => checked)
      .map(([permId]) => ({ permissionId: permId, accessLevel: "full" as const }));
    updatePermsMutation.mutate({ roleId: id, permissions: perms });
  };

  const handleCancel = () => {
    // Reset to current role permissions
    if (role) {
      const initial: Record<string, boolean> = {};
      for (const rp of role.permissions) {
        initial[rp.permissionId] = true;
      }
      setCheckedPerms(initial);
    }
    setEditing(false);
  };

  const checkedCount = Object.values(checkedPerms).filter(Boolean).length;
  const totalPerms = allPermissions?.length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Setup", href: "/setup" }, { label: "Roles", href: "/setup/roles" }, { label: "Not Found" }]} />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3">error</span>
            <p className="text-lg font-medium">Role not found</p>
            <p className="text-muted-foreground text-sm mt-1">The role you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/setup/roles">
              <Button className="mt-4" variant="outline">Back to Roles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Roles", href: "/setup/roles" },
          { label: role.name },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[24px]">shield_person</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {role.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  role.isSystem
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }
              >
                {role.isSystem ? "System" : "Custom"}
              </Badge>
            </div>
            {role.description && (
              <p className="text-muted-foreground mt-0.5">{role.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/setup/roles">
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
              Back
            </Button>
          </Link>
          {!role.isSystem && !editing && (
            <Button onClick={() => setEditing(true)}>
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit Permissions
            </Button>
          )}
          {editing && (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} disabled={updatePermsMutation.isPending}>
                {updatePermsMutation.isPending ? "Saving..." : "Save Permissions"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Permission Matrix */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Permission Matrix</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editing
                      ? `${checkedCount} of ${totalPerms} permissions selected`
                      : `${assignedPermIds.size} of ${totalPerms} permissions assigned`
                    }
                  </p>
                </div>
                {editing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAll}
                  >
                    {allPermissions?.every((p) => checkedPerms[p.id]) ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold w-48">MODULE</TableHead>
                    {actions.map((action) => (
                      <TableHead key={action} className="font-bold text-center w-28">
                        {(ACTION_LABELS[action] || action).toUpperCase()}
                      </TableHead>
                    ))}
                    {editing && (
                      <TableHead className="font-bold text-center w-24">ALL</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => {
                    const modulePerms = permissionsByModule[module] || [];
                    const info = MODULE_LABELS[module] || { label: module, icon: "extension" };
                    const moduleAllChecked = modulePerms.every((p) => checkedPerms[p.id]);
                    const moduleSomeChecked = modulePerms.some((p) => checkedPerms[p.id]);

                    return (
                      <TableRow key={module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-muted-foreground">{info.icon}</span>
                            <span className="font-medium">{info.label}</span>
                          </div>
                        </TableCell>
                        {actions.map((action) => {
                          const code = `${module}:${action}`;
                          const permId = permLookup[code];
                          if (!permId) {
                            return <TableCell key={action} className="text-center text-muted-foreground">—</TableCell>;
                          }

                          const isAssigned = editing ? !!checkedPerms[permId] : assignedPermIds.has(permId);

                          return (
                            <TableCell key={action} className="text-center">
                              {editing ? (
                                <Checkbox
                                  checked={!!checkedPerms[permId]}
                                  onCheckedChange={() => togglePerm(permId)}
                                  className="mx-auto"
                                />
                              ) : (
                                <div className="flex justify-center">
                                  {isAssigned ? (
                                    <span className="material-symbols-outlined text-[20px] text-green-600">check_circle</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[20px] text-slate-300">remove</span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                        {editing && (
                          <TableCell className="text-center">
                            <Checkbox
                              checked={moduleAllChecked}
                              onCheckedChange={() => toggleModule(module)}
                              className={cn("mx-auto", moduleSomeChecked && !moduleAllChecked && "opacity-60")}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{role.isSystem ? "System Role" : "Custom Role"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Permissions</p>
                <p className="text-sm font-medium">{assignedPermIds.size} of {totalPerms}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Users Assigned</p>
                <p className="text-sm font-medium">{role.users.length}</p>
              </div>
              {role.isSystem && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                    <p className="text-xs">System roles cannot be edited or deleted.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Users</CardTitle>
            </CardHeader>
            <CardContent>
              {role.users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users assigned</p>
              ) : (
                <div className="space-y-3">
                  {role.users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                  {role.users.length > 0 && (
                    <Link href={`/setup/users?roleId=${role.id}`}>
                      <Button variant="ghost" size="sm" className="w-full text-xs mt-2">
                        View all users
                        <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
