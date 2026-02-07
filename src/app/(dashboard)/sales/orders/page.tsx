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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "pending_fulfillment", label: "Pending Fulfillment" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: {
      label: "Draft",
      className: "bg-slate-100 text-slate-800 border-slate-200",
    },
    pending_approval: {
      label: "Pending Approval",
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    pending_fulfillment: {
      label: "Pending Fulfillment",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    fulfilled: {
      label: "Fulfilled",
      className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    closed: {
      label: "Closed",
      className: "bg-slate-100 text-slate-800 border-slate-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default function SalesOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.sales.getSalesOrders.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined,
  });

  const { data: statsData } = trpc.sales.getDashboardStats.useQuery();

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const pendingFulfillment = orders.filter((o) => o.status === "pending_fulfillment").length;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Orders" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sales Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer sales orders.
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
              <DropdownMenuItem onClick={() => window.open("/api/export/excel?type=sales-orders", "_blank")}>
                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/sales/orders/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Sales Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{statsData?.totalOrders || total}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{statsData?.pendingOrders || pendingFulfillment}</div>
            )}
            <p className="text-xs text-muted-foreground">Pending Fulfillment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${Number(statsData?.monthRevenue || 0).toLocaleString()}
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
              <div className="text-2xl font-bold text-slate-600">
                ${Number(statsData?.totalRevenue || 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders found. Create your first sales order to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ORDER #</TableHead>
                    <TableHead className="font-bold">CUSTOMER</TableHead>
                    <TableHead className="font-bold">DATE</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ITEMS</TableHead>
                    <TableHead className="font-bold text-right">TOTAL</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <Link
                          href={`/sales/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer?.companyName || order.customer?.displayName || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.customer?.customerId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-center">{order._count?.lines || 0}</TableCell>
                      <TableCell className="text-right font-bold">
                        ${Number(order.total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/sales/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </Button>
                          </Link>
                          <Link href={`/sales/orders/${order.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/sales/invoices/new?orderId=${order.id}`}>
                                  <span className="material-symbols-outlined text-[18px] mr-2">receipt</span>
                                  Create Invoice
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <span className="material-symbols-outlined text-[18px] mr-2">content_copy</span>
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <span className="material-symbols-outlined text-[18px] mr-2">print</span>
                                Print
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} of {total} orders
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
