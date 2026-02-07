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
import { ImportDialog } from "@/components/import-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.customers.getCustomers.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const customers = data?.customers || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const activeCount = customers.filter((c) => c.status === "active").length;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading customers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Customers" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer relationships and accounts.
          </p>
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
              <DropdownMenuItem onClick={() => window.open("/api/export/excel?type=customers", "_blank")}>
                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                Export to Excel
              </DropdownMenuItem>
              <ImportDialog type="customers" onSuccess={() => utils.customers.getCustomers.invalidate()}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-[18px] mr-2">upload</span>
                  Import from CSV
                </DropdownMenuItem>
              </ImportDialog>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/sales/customers/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">person_add</span>
              New Customer
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-primary">{total}</div>}
            <p className="text-xs text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{activeCount}</div>}
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-slate-600">{customers.reduce((sum, c) => sum + (c._count?.salesOrders || 0), 0)}</div>}
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-amber-600">{customers.reduce((sum, c) => sum + (c._count?.invoices || 0), 0)}</div>}
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Customers</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <Input placeholder="Search customers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 w-full sm:w-64" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No customers found. Create your first customer to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ID</TableHead>
                    <TableHead className="font-bold">COMPANY</TableHead>
                    <TableHead className="font-bold">CONTACT</TableHead>
                    <TableHead className="font-bold">INDUSTRY</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-right">ORDERS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell><Link href={`/sales/customers/${customer.id}`} className="font-medium text-primary hover:underline">{customer.customerId}</Link></TableCell>
                      <TableCell>
                        <div><p className="font-medium">{customer.companyName || customer.displayName}</p><p className="text-xs text-muted-foreground">{customer.email}</p></div>
                      </TableCell>
                      <TableCell>
                        <div><p className="font-medium">{customer.displayName || "-"}</p><p className="text-xs text-muted-foreground">{customer.phone || "-"}</p></div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.industry || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={customer.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-800 border-slate-200"}>
                          {customer.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{customer._count?.salesOrders || 0}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/sales/customers/${customer.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">visibility</span></Button></Link>
                          <Link href={`/sales/customers/${customer.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">edit</span></Button></Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">more_vert</span></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Showing {customers.length} of {total} customers</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
