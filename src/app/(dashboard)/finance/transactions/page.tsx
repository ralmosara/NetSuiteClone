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

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "posted", label: "Posted" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "void", label: "Void" },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.finance.getJournalEntries.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const entries = data?.entries || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const pendingCount = data?.pendingCount || 0;
  const totalDebit = Number(data?.totalDebit || 0);
  const totalCredit = Number(data?.totalCredit || 0);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading transactions: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all financial transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>
            Export
          </Button>
          <Link href="/finance/transactions/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Journal Entry
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{total.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${totalDebit >= 1000000
                  ? `${(totalDebit / 1000000).toFixed(1)}M`
                  : totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Debits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ${totalCredit >= 1000000
                  ? `${(totalCredit / 1000000).toFixed(1)}M`
                  : totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Credits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            )}
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Journal Entries</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search entries..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
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
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search || statusFilter !== "all"
                ? "No transactions found matching your filters."
                : "No transactions yet. Create your first journal entry to get started."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">DATE</TableHead>
                    <TableHead className="font-bold">NUMBER</TableHead>
                    <TableHead className="font-bold">MEMO</TableHead>
                    <TableHead className="font-bold">ACCOUNTS</TableHead>
                    <TableHead className="font-bold text-right">DEBIT</TableHead>
                    <TableHead className="font-bold text-right">CREDIT</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.entryDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/finance/transactions/${entry.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {entry.entryNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.memo || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.lines.length > 0 ? (
                          <span title={entry.lines.map((l: any) => l.account?.name).join(", ")}>
                            {entry.lines[0]?.account?.name || "-"}
                            {entry.lines.length > 1 && ` +${entry.lines.length - 1} more`}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(entry.totalDebit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(entry.totalCredit).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.status === "posted"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : entry.status === "pending"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : entry.status === "approved"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }
                        >
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/finance/transactions/${entry.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {entries.length} of {total} entries
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
