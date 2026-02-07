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
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

const getStatusBadge = (status: string, dueDate: Date) => {
  // Check if overdue
  if (status === "open" && new Date(dueDate) < new Date()) {
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
  }

  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    open: { label: "Open", className: "bg-blue-100 text-blue-800 border-blue-200" },
    partially_paid: { label: "Partial", className: "bg-amber-100 text-amber-800 border-amber-200" },
    paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
    void: { label: "Void", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.sales.getInvoices.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const invoices = data?.invoices || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const stats = data?.stats;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading invoices: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Invoices" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Invoices
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer invoices and payments.
          </p>
        </div>
        <Link href="/sales/invoices/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{total}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats?.openCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{stats?.overdueCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-slate-600">
                ${Number(stats?.totalOutstanding || 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Outstanding</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Invoices</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search invoices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
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
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="material-symbols-outlined text-[48px] mb-2">receipt</span>
              <p>No invoices found</p>
              <Link href="/sales/invoices/new">
                <Button className="mt-4" variant="outline">
                  Create First Invoice
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">INVOICE #</TableHead>
                  <TableHead className="font-bold">CUSTOMER</TableHead>
                  <TableHead className="font-bold">DATE</TableHead>
                  <TableHead className="font-bold">DUE DATE</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">AMOUNT</TableHead>
                  <TableHead className="font-bold text-right">BALANCE DUE</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <Link href={`/sales/invoices/${inv.id}`} className="font-medium text-primary hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inv.customer?.companyName || inv.customer?.displayName || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{inv.customer?.customerId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(inv.status, inv.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      ${Number(inv.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${Number(inv.amountDue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Link href={`/sales/invoices/${inv.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                        </Link>
                        <Link href={`/sales/invoices/${inv.id}?action=payment`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Record Payment" disabled={inv.status === "paid" || inv.status === "void"}>
                            <span className="material-symbols-outlined text-[18px]">payments</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(`/api/pdf/invoice/${inv.id}`, "_blank")}
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pages} ({total} invoices)
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
        </CardContent>
      </Card>
    </div>
  );
}
