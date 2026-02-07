"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const accountTypes = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "cogs", label: "Cost of Goods Sold" },
  { value: "expense", label: "Expense" },
];

const subTypes: Record<string, { value: string; label: string }[]> = {
  asset: [
    { value: "Bank", label: "Bank" },
    { value: "Accounts Receivable", label: "Accounts Receivable" },
    { value: "Other Current Asset", label: "Other Current Asset" },
    { value: "Inventory", label: "Inventory" },
    { value: "Fixed Asset", label: "Fixed Asset" },
    { value: "Other Asset", label: "Other Asset" },
  ],
  liability: [
    { value: "Accounts Payable", label: "Accounts Payable" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Other Current Liability", label: "Other Current Liability" },
    { value: "Short-term Debt", label: "Short-term Debt" },
    { value: "Long-term Debt", label: "Long-term Debt" },
    { value: "Other Liability", label: "Other Liability" },
  ],
  equity: [
    { value: "Equity", label: "Equity" },
    { value: "Retained Earnings", label: "Retained Earnings" },
  ],
  income: [
    { value: "Revenue", label: "Revenue" },
    { value: "Other Income", label: "Other Income" },
  ],
  cogs: [
    { value: "COGS", label: "Cost of Goods Sold" },
  ],
  expense: [
    { value: "Operating Expense", label: "Operating Expense" },
    { value: "Other Expense", label: "Other Expense" },
  ],
};

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    accountNumber: "",
    name: "",
    accountType: "",
    accountSubType: "",
    description: "",
    parentId: "",
    isReconcilable: false,
    isActive: true,
  });

  const { data: account, isLoading, error } = trpc.finance.getAccount.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const { data: accounts } = trpc.finance.getAccounts.useQuery({});

  useEffect(() => {
    if (account) {
      setFormData({
        accountNumber: account.accountNumber || "",
        name: account.name || "",
        accountType: account.accountType || "",
        accountSubType: account.accountSubType || "",
        description: account.description || "",
        parentId: account.parentId || "",
        isReconcilable: account.isReconcilable || false,
        isActive: account.isActive !== false,
      });
    }
  }, [account]);

  const updateAccount = trpc.finance.updateAccount.useMutation({
    onSuccess: () => {
      toast({ title: "Account updated", description: "Account has been updated successfully." });
      router.push(`/finance/accounts/${params.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountNumber || !formData.name || !formData.accountType) {
      toast({ title: "Error", description: "Account number, name, and type are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    updateAccount.mutate({
      id: params.id as string,
      accountNumber: formData.accountNumber,
      name: formData.name,
      accountType: formData.accountType,
      accountSubType: formData.accountSubType || null,
      description: formData.description || null,
      parentId: formData.parentId || null,
      isReconcilable: formData.isReconcilable,
      isActive: formData.isActive,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "accountType") {
        newData.accountSubType = "";
      }
      return newData;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-4">The account you're trying to edit doesn't exist.</p>
        <Link href="/finance/accounts">
          <Button>Back to Accounts</Button>
        </Link>
      </div>
    );
  }

  const availableSubTypes = formData.accountType ? subTypes[formData.accountType] || [] : [];
  const parentAccounts = (accounts || []).filter(
    (a) => a.accountType === formData.accountType && a.id !== params.id
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts", href: "/finance/accounts" },
          { label: account.name, href: `/finance/accounts/${account.id}` },
          { label: "Edit" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Edit Account
          </h1>
          <p className="text-muted-foreground mt-1">{account.accountNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                    placeholder="e.g., 1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type *</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(v) => handleChange("accountType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Cash and Cash Equivalents"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountSubType">Sub-Type</Label>
                <Select
                  value={formData.accountSubType || "none"}
                  onValueChange={(v) => handleChange("accountSubType", v === "none" ? "" : v)}
                  disabled={!formData.accountType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {availableSubTypes.map((subType) => (
                      <SelectItem key={subType.value} value={subType.value}>
                        {subType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Account description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Account</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(v) => handleChange("parentId", v === "none" ? "" : v)}
                  disabled={!formData.accountType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level account)</SelectItem>
                    {parentAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.accountNumber} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(v) => handleChange("isActive", v === "active")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="isReconcilable"
                  checked={formData.isReconcilable}
                  onChange={(e) => handleChange("isReconcilable", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isReconcilable" className="text-sm font-normal">
                  Reconcilable Account
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
