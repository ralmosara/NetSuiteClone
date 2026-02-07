"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function RolesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [deleteRole, setDeleteRole] = useState<{ id: string; name: string } | null>(null);
  const [duplicateRole, setDuplicateRole] = useState<{ id: string; name: string } | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [dupName, setDupName] = useState("");

  const { data: roles, isLoading } = trpc.setup.getRoles.useQuery();
  const { data: permissions } = trpc.setup.getPermissions.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.setup.createRole.useMutation({
    onSuccess: (data) => {
      toast({ title: "Role created", description: `${data.name} has been created.` });
      utils.setup.getRoles.invalidate();
      setCreateOpen(false);
      setFormName("");
      setFormDescription("");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const updateMutation = trpc.setup.updateRole.useMutation({
    onSuccess: (data) => {
      toast({ title: "Role updated", description: `${data.name} has been updated.` });
      utils.setup.getRoles.invalidate();
      setEditRole(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const deleteMutation = trpc.setup.deleteRole.useMutation({
    onSuccess: () => {
      toast({ title: "Role deleted", description: "The role has been removed." });
      utils.setup.getRoles.invalidate();
      setDeleteRole(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const duplicateMutation = trpc.setup.duplicateRole.useMutation({
    onSuccess: (data) => {
      toast({ title: "Role duplicated", description: `${data.name} has been created.` });
      utils.setup.getRoles.invalidate();
      setDuplicateRole(null);
      setDupName("");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const filteredRoles = (roles || []).filter(
    (role) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      (role.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = (roles || []).reduce((sum, r) => sum + r._count.users, 0);
  const customRoles = (roles || []).filter((r) => !r.isSystem).length;
  const moduleCount = new Set((permissions || []).map((p) => p.module)).size;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Roles" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access permissions.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600" onClick={() => { setFormName(""); setFormDescription(""); setCreateOpen(true); }}>
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{roles?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total Roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{customRoles}</div>
                <p className="text-xs text-muted-foreground">Custom Roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-slate-600">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Users Assigned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-amber-600">{moduleCount}</div>
                <p className="text-xs text-muted-foreground">Modules</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Roles</CardTitle>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-8 ml-auto" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-slate-400">shield_person</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {search ? "No roles match your search" : "No roles found"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">ROLE NAME</TableHead>
                  <TableHead className="font-bold">DESCRIPTION</TableHead>
                  <TableHead className="font-bold text-center">USERS</TableHead>
                  <TableHead className="font-bold text-center">PERMISSIONS</TableHead>
                  <TableHead className="font-bold">TYPE</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <Link href={`/setup/roles/${role.id}`} className="font-medium text-primary hover:underline">
                        {role.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px]">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">{role._count.users}</TableCell>
                    <TableCell className="text-center">{role.permissions.length}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Link href={`/setup/roles/${role.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={role.isSystem}
                          title="Edit"
                          onClick={() => {
                            setFormName(role.name);
                            setFormDescription(role.description || "");
                            setEditRole({ id: role.id, name: role.name, description: role.description });
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Duplicate"
                          onClick={() => {
                            setDupName(`${role.name} (Copy)`);
                            setDuplicateRole({ id: role.id, name: role.name });
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          disabled={role.isSystem || role._count.users > 0}
                          title={role.isSystem ? "System roles cannot be deleted" : role._count.users > 0 ? "Reassign users first" : "Delete"}
                          onClick={() => setDeleteRole({ id: role.id, name: role.name })}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Add a new custom role. You can assign permissions after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-name">Role Name *</Label>
              <Input
                id="create-name"
                placeholder="e.g. Sales Representative"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                placeholder="Brief description of this role's purpose"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ name: formName, description: formDescription || undefined })}
              disabled={!formName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editRole} onOpenChange={(open) => !open && setEditRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role name and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Role Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
            <Button
              onClick={() => editRole && updateMutation.mutate({ id: editRole.id, name: formName, description: formDescription || null })}
              disabled={!formName.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Role Dialog */}
      <Dialog open={!!duplicateRole} onOpenChange={(open) => !open && setDuplicateRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Role</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{duplicateRole?.name}&quot; with all its permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="dup-name">New Role Name *</Label>
              <Input
                id="dup-name"
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateRole(null)}>Cancel</Button>
            <Button
              onClick={() => duplicateRole && duplicateMutation.mutate({ id: duplicateRole.id, name: dupName })}
              disabled={!dupName.trim() || duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? "Duplicating..." : "Duplicate Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRole} onOpenChange={(open) => !open && setDeleteRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteRole?.name}&quot;? This action cannot be undone.
              All permission assignments for this role will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteRole && deleteMutation.mutate({ id: deleteRole.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
