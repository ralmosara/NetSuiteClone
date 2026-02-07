"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewAccountPage() {
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
  });

  const { data: accounts } = trpc.finance.getAccounts.useQuery({});

  const createAccount = trpc.finance.createAccount.useMutation({
    onSuccess: (data) => {
      toast({ title: "Account created", description: `Account ${data.accountNumber} has been created successfully.` });
      router.push(`/finance/accounts/${data.id}`);
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
    createAccount.mutate({
      accountNumber: formData.accountNumber,
      name: formData.name,
      accountType: formData.accountType,
      accountSubType: formData.accountSubType || undefined,
      description: formData.description || undefined,
      parentId: formData.parentId || undefined,
      isReconcilable: formData.isReconcilable,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset sub-type when type changes
      if (field === "accountType") {
        newData.accountSubType = "";
      }
      return newData;
    });
  };

  const availableSubTypes = formData.accountType ? subTypes[formData.accountType] || [] : [];
  const parentAccounts = (accounts || []).filter((a) => a.accountType === formData.accountType);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts", href: "/finance/accounts" },
          { label: "New Account" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Account
          </h1>
          <p className="text-muted-foreground mt-1">Create a new general ledger account</p>
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
                    {parentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.accountNumber} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optionally make this account a sub-account of another
                </p>
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
              <p className="text-xs text-muted-foreground">
                Enable if this account should be reconciled with external statements (e.g., bank accounts)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
