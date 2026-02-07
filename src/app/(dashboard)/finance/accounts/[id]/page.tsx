"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const getTypeBadge = (type: string) => {
  const config: Record<string, { label: string; className: string }> = {
    asset: { label: "Asset", className: "bg-blue-100 text-blue-800 border-blue-200" },
    liability: { label: "Liability", className: "bg-red-100 text-red-800 border-red-200" },
    equity: { label: "Equity", className: "bg-purple-100 text-purple-800 border-purple-200" },
    income: { label: "Income", className: "bg-green-100 text-green-800 border-green-200" },
    cogs: { label: "COGS", className: "bg-amber-100 text-amber-800 border-amber-200" },
    expense: { label: "Expense", className: "bg-orange-100 text-orange-800 border-orange-200" },
  };
  const { label, className } = config[type] || { label: type, className: "bg-slate-100 text-slate-800" };
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: account, isLoading, error } = trpc.finance.getAccount.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateAccount = trpc.finance.updateAccount.useMutation({
    onSuccess: () => {
      toast({ title: "Account updated", description: "Account has been updated." });
      utils.finance.getAccount.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const handleToggleStatus = () => {
    const newStatus = !account?.isActive;
    updateAccount.mutate({ id: params.id as string, isActive: newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Account Not Found</h2>
        <p className="text-muted-foreground mb-4">The account you're looking for doesn't exist.</p>
        <Link href="/finance/accounts">
          <Button>Back to Accounts</Button>
        </Link>
      </div>
    );
  }

  const balance = Number(account.balance || 0);
  const totalDebits = account.journalEntryLines?.reduce(
    (sum, line) => sum + Number(line.debit || 0),
    0
  ) || 0;
  const totalCredits = account.journalEntryLines?.reduce(
    (sum, line) => sum + Number(line.credit || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts", href: "/finance/accounts" },
          { label: account.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {account.name}
              </h1>
              {getTypeBadge(account.accountType)}
              <Badge
                variant="outline"
                className={
                  account.isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }
              >
                {account.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {account.accountNumber} {account.accountSubType && `• ${account.accountSubType}`}
            </p>
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
                  {account.isActive ? "block" : "check_circle"}
                </span>
                {account.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/finance/accounts/${account.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
          <Link href="/finance/transactions/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${balance < 0 ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
              {balance < 0 ? "(" : ""}${Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}{balance < 0 ? ")" : ""}
            </div>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${totalDebits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total Debits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ${totalCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {account.journalEntryLines?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Transactions
          </TabsTrigger>
          {account.children && account.children.length > 0 && (
            <TabsTrigger
              value="subaccounts"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Sub-Accounts
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Account Number</p>
                    <p className="font-medium">{account.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Account Type</p>
                    <p className="font-medium capitalize">{account.accountType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Sub-Type</p>
                    <p className="font-medium">{account.accountSubType || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-medium">{account.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Reconcilable</p>
                    <p className="font-medium">{account.isReconcilable ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Created</p>
                    <p className="font-medium">{new Date(account.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {account.description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Description</p>
                    <p className="text-sm mt-1">{account.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relationships</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {account.parent && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Parent Account</p>
                    <Link
                      href={`/finance/accounts/${account.parent.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {account.parent.accountNumber} - {account.parent.name}
                    </Link>
                  </div>
                )}
                {account.subsidiary && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Subsidiary</p>
                    <p className="font-medium">{account.subsidiary.name}</p>
                  </div>
                )}
                {account.children && account.children.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Sub-Accounts</p>
                    <p className="font-medium">{account.children.length} sub-accounts</p>
                  </div>
                )}
                {!account.parent && !account.subsidiary && (!account.children || account.children.length === 0) && (
                  <p className="text-muted-foreground">No relationships defined</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {account.journalEntryLines && account.journalEntryLines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">ENTRY #</TableHead>
                      <TableHead className="font-bold">MEMO</TableHead>
                      <TableHead className="font-bold text-right">DEBIT</TableHead>
                      <TableHead className="font-bold text-right">CREDIT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.journalEntryLines.map((line: any) => (
                      <TableRow key={line.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(line.journalEntry?.entryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/finance/transactions/${line.journalEntry?.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {line.journalEntry?.entryNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {line.memo || line.journalEntry?.memo || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(line.debit) > 0
                            ? `$${Number(line.debit).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(line.credit) > 0
                            ? `$${Number(line.credit).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">receipt_long</span>
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {account.children && account.children.length > 0 && (
          <TabsContent value="subaccounts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sub-Accounts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">ACCOUNT #</TableHead>
                      <TableHead className="font-bold">NAME</TableHead>
                      <TableHead className="font-bold">TYPE</TableHead>
                      <TableHead className="font-bold text-right">BALANCE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.children.map((child: any) => (
                      <TableRow key={child.id}>
                        <TableCell>
                          <Link
                            href={`/finance/accounts/${child.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {child.accountNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">{child.name}</TableCell>
                        <TableCell>{getTypeBadge(child.accountType)}</TableCell>
                        <TableCell className="text-right font-bold">
                          ${Number(child.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
