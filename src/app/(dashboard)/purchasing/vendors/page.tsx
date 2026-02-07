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

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.purchasing.getVendors.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const vendors = data?.vendors || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const activeCount = vendors.filter((v) => v.status === "active").length;
  const totalBalance = 0; // Balance calculated from purchase orders

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading vendors: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Vendors" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Vendors
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your vendor relationships and accounts payable.
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
              <DropdownMenuItem onClick={() => window.open("/api/export/excel?type=vendors", "_blank")}>
                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                Export to Excel
              </DropdownMenuItem>
              <ImportDialog type="vendors">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-[18px] mr-2">upload</span>
                  Import from CSV
                </DropdownMenuItem>
              </ImportDialog>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/purchasing/vendors/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Vendor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-primary">{total}</div>}
            <p className="text-xs text-muted-foreground">Total Vendors</p>
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
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-slate-600">${totalBalance.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">Total AP Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-amber-600">{vendors.reduce((sum, v) => sum + (v._count?.vendorBills || 0), 0)}</div>}
            <p className="text-xs text-muted-foreground">Total Bills</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Vendors</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <Input placeholder="Search vendors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 w-full sm:w-64" />
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
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No vendors found. Create your first vendor to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ID</TableHead>
                    <TableHead className="font-bold">COMPANY</TableHead>
                    <TableHead className="font-bold">CONTACT</TableHead>
                    <TableHead className="font-bold">TERMS</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-right">PO COUNT</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell><Link href={`/purchasing/vendors/${vendor.id}`} className="font-medium text-primary hover:underline">{vendor.vendorId}</Link></TableCell>
                      <TableCell>
                        <div><p className="font-medium">{vendor.companyName}</p><p className="text-xs text-muted-foreground">{vendor.email || "-"}</p></div>
                      </TableCell>
                      <TableCell>
                        <div><p className="font-medium">{vendor.displayName || "-"}</p><p className="text-xs text-muted-foreground">{vendor.phone || "-"}</p></div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{vendor.paymentTerms || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={vendor.status === "active" ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-800 border-slate-200"}>
                          {vendor.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{vendor._count?.purchaseOrders || 0}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/purchasing/vendors/${vendor.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">visibility</span></Button></Link>
                          <Link href={`/purchasing/vendors/${vendor.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">edit</span></Button></Link>
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
              <p className="text-sm text-muted-foreground">Showing {vendors.length} of {total} vendors</p>
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
