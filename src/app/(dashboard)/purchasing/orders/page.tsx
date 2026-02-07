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
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "sent", label: "Sent" },
  { value: "partially_received", label: "Partially Received" },
  { value: "received", label: "Received" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-800 border-slate-200" },
    pending_approval: { label: "Pending Approval", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800 border-blue-200" },
    partially_received: { label: "Partial Receipt", className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    received: { label: "Received", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.draft;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.purchasing.getPurchaseOrders.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;
  const stats = data?.stats;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading purchase orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Purchase Orders" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage purchase orders and vendor procurement.
          </p>
        </div>
        <Link href="/purchasing/orders/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Purchase Order
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
            <p className="text-xs text-muted-foreground">Total POs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{stats?.pendingCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Pending Receipt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-slate-600">
                ${Number(stats?.monthSpend || 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${Number(stats?.ytdSpend || 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">YTD Spend</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Purchase Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search orders..."
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
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
              <p>No purchase orders found</p>
              <Link href="/purchasing/orders/new">
                <Button className="mt-4" variant="outline">
                  Create First Purchase Order
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">PO #</TableHead>
                  <TableHead className="font-bold">VENDOR</TableHead>
                  <TableHead className="font-bold">DATE</TableHead>
                  <TableHead className="font-bold">EXPECTED</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">TOTAL</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <Link href={`/purchasing/orders/${order.id}`} className="font-medium text-primary hover:underline">
                        {order.poNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.vendor?.companyName}</p>
                        <p className="text-xs text-muted-foreground">{order.vendor?.vendorId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.expectedReceiptDate ? new Date(order.expectedReceiptDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right font-bold">
                      ${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Link href={`/purchasing/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                        </Link>
                        <Link href={`/purchasing/orders/${order.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pages} ({total} orders)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pages}
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
