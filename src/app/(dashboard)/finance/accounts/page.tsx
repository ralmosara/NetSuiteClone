"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { trpc } from "@/lib/trpc";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "cogs", label: "Cost of Goods Sold" },
  { value: "expense", label: "Expense" },
];

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

export default function ChartOfAccountsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: accounts, isLoading, error } = trpc.finance.getAccounts.useQuery({
    accountType: typeFilter !== "all" ? typeFilter : undefined,
  });

  const { data: stats } = trpc.finance.getAccountStats.useQuery();

  const filteredAccounts = (accounts || []).filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(search.toLowerCase()) ||
      acc.accountNumber.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading accounts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Chart of Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your general ledger account structure.
          </p>
        </div>
        <Link href="/finance/accounts/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Account
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{stats?.totalAccounts || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                ${((stats?.totalAssets || 0) / 1000000).toFixed(2)}M
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ${((stats?.totalLiabilities || 0) / 1000).toFixed(0)}K
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Liabilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.activeAccounts || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Active Accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Accounts</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search || typeFilter !== "all"
                ? "No accounts found matching your filters."
                : "No accounts yet. Create your first account to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">ACCOUNT #</TableHead>
                  <TableHead className="font-bold">NAME</TableHead>
                  <TableHead className="font-bold">TYPE</TableHead>
                  <TableHead className="font-bold">SUB-TYPE</TableHead>
                  <TableHead className="font-bold text-right">BALANCE</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((acc) => {
                  const balance = Number(acc.balance || 0);
                  return (
                    <TableRow key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <Link href={`/finance/accounts/${acc.id}`} className="font-medium text-primary hover:underline">
                          {acc.accountNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{acc.name}</TableCell>
                      <TableCell>{getTypeBadge(acc.accountType)}</TableCell>
                      <TableCell className="text-muted-foreground">{acc.accountSubType || "-"}</TableCell>
                      <TableCell className={`text-right font-bold ${balance < 0 ? "text-red-600" : ""}`}>
                        {balance < 0 ? "(" : ""}${Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}{balance < 0 ? ")" : ""}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            acc.isActive
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }
                        >
                          {acc.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/finance/accounts/${acc.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Button>
                          </Link>
                          <Link href={`/finance/accounts/${acc.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
