"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roleId: "",
    subsidiaryId: "",
    phone: "",
    isActive: true,
  });

  const { data: user, isLoading: userLoading } = trpc.setup.getUser.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const { data: roles, isLoading: rolesLoading } = trpc.setup.getRoles.useQuery();
  const { data: subsidiaries, isLoading: subsidLoading } = trpc.setup.getSubsidiaries.useQuery();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        roleId: user.role?.id || "",
        subsidiaryId: user.subsidiary?.id || "",
        phone: user.phone || "",
        isActive: user.isActive,
      });
    }
  }, [user]);

  const updateUser = trpc.setup.updateUser.useMutation({
    onSuccess: () => {
      toast({
        title: "User updated",
        description: "User has been updated successfully.",
      });
      router.push(`/setup/users/${params.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.roleId) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    updateUser.mutate({
      id: params.id as string,
      name: formData.name,
      email: formData.email,
      roleId: formData.roleId,
      subsidiaryId: formData.subsidiaryId || null,
      phone: formData.phone || null,
      isActive: formData.isActive,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Users", href: "/setup/users" },
          { label: user.name || "User", href: `/setup/users/${user.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit User
          </h1>
          <p className="text-muted-foreground mt-1">Update user information and permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g., john.doe@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  User is active
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Inactive users cannot log in to the system
              </p>
            </CardContent>
          </Card>

          {/* Access & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Access & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleId">Role *</Label>
                {rolesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.roleId}
                    onValueChange={(v) => handleChange("roleId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(roles || []).map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  The role determines what permissions this user will have
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subsidiaryId">Subsidiary</Label>
                {subsidLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.subsidiaryId || "none"}
                    onValueChange={(v) => handleChange("subsidiaryId", v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subsidiary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Subsidiaries</SelectItem>
                      {(subsidiaries || []).map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  Optionally restrict this user to a specific subsidiary
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">info</span>
                  <div className="text-sm">
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      Password not changed here
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      To reset the user's password, use the "Reset Password" option on the user detail page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-600"
            disabled={isSubmitting || !formData.name || !formData.email || !formData.roleId}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
