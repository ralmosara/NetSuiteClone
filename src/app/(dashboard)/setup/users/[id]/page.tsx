"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const { data: user, isLoading, error } = trpc.setup.getUser.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateUser = trpc.setup.updateUser.useMutation({
    onSuccess: () => {
      toast({ title: "User updated", description: "User has been updated successfully." });
      utils.setup.getUser.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const resetPassword = trpc.setup.resetUserPassword.useMutation({
    onSuccess: () => {
      toast({ title: "Password reset", description: "Password has been reset successfully." });
      setResetPasswordOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const handleToggleStatus = () => {
    updateUser.mutate({ id: params.id as string, isActive: !user?.isActive });
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    resetPassword.mutate({ userId: params.id as string, newPassword });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
        <Link href="/setup/users">
          <Button>Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Users", href: "/setup/users" },
          { label: user.name || "User" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-white text-xl font-semibold">
              {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  user.isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }
              >
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            {user.role && (
              <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                {user.role.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">more_vert</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleStatus}>
                <span className="material-symbols-outlined text-[18px] mr-2">
                  {user.isActive ? "block" : "check_circle"}
                </span>
                {user.isActive ? "Deactivate User" : "Activate User"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setResetPasswordOpen(true)}>
                <span className="material-symbols-outlined text-[18px] mr-2">lock_reset</span>
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/setup/users/${user.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Phone</p>
                <p className="font-medium">{user.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <p className="font-medium">{user.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Last Login</p>
                <p className="font-medium">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString()
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Created</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Access & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Role</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {user.role?.name || "No Role Assigned"}
                </Badge>
                {user.role?.description && (
                  <span className="text-sm text-muted-foreground">- {user.role.description}</span>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Subsidiary</p>
              <p className="font-medium">{user.subsidiary?.name || "All Subsidiaries"}</p>
              {user.subsidiary?.code && (
                <p className="text-xs text-muted-foreground">{user.subsidiary.code}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Department</p>
              <p className="font-medium">{user.department?.name || "No Department"}</p>
              {user.department?.code && (
                <p className="text-xs text-muted-foreground">{user.department.code}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {user.name}. They will need to use this password to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPassword.isPending || newPassword.length < 8}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
