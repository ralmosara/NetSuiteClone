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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const purchaseOrders = [
  {
    id: "po-1",
    poNumber: "PO-5012",
    orderDate: "Oct 24, 2023",
    expectedDelivery: "Nov 5, 2023",
    items: 3,
    total: 58677.53,
    status: "approved",
    shipTo: "San Francisco Main",
  },
  {
    id: "po-2",
    poNumber: "PO-5008",
    orderDate: "Oct 18, 2023",
    expectedDelivery: "Oct 30, 2023",
    items: 5,
    total: 32450.00,
    status: "received",
    shipTo: "New York Distribution",
  },
  {
    id: "po-3",
    poNumber: "PO-5003",
    orderDate: "Oct 10, 2023",
    expectedDelivery: "Oct 22, 2023",
    items: 2,
    total: 15280.00,
    status: "received",
    shipTo: "San Francisco Main",
  },
  {
    id: "po-4",
    poNumber: "PO-4998",
    orderDate: "Oct 5, 2023",
    expectedDelivery: "Oct 18, 2023",
    items: 8,
    total: 42500.00,
    status: "received",
    shipTo: "Texas Regional",
  },
  {
    id: "po-5",
    poNumber: "PO-4985",
    orderDate: "Sep 28, 2023",
    expectedDelivery: "Oct 12, 2023",
    items: 4,
    total: 28750.00,
    status: "received",
    shipTo: "San Francisco Main",
  },
  {
    id: "po-6",
    poNumber: "PO-5015",
    orderDate: "Oct 26, 2023",
    expectedDelivery: "Nov 10, 2023",
    items: 6,
    total: 45200.00,
    status: "pending",
    shipTo: "New York Distribution",
  },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "shipped", label: "Shipped" },
  { value: "received", label: "Received" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
    shipped: { label: "Shipped", className: "bg-purple-100 text-purple-800 border-purple-200" },
    received: { label: "Received", className: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function SupplierOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = purchaseOrders.filter((o) => {
    const matchesSearch = o.poNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrders = purchaseOrders.filter((o) => o.status !== "received" && o.status !== "cancelled");
  const openOrdersValue = openOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage purchase orders from your customer.
          </p>
        </div>
        <Button variant="outline">
          <span className="material-symbols-outlined text-[18px] mr-2">download</span>
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{purchaseOrders.length}</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{openOrders.length}</div>
            <p className="text-xs text-muted-foreground">Open Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(openOrdersValue / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Open Order Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              {purchaseOrders.filter((o) => o.status === "received").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">PO NUMBER</TableHead>
                <TableHead className="font-bold">ORDER DATE</TableHead>
                <TableHead className="font-bold">EXPECTED DELIVERY</TableHead>
                <TableHead className="font-bold">SHIP TO</TableHead>
                <TableHead className="font-bold text-center">ITEMS</TableHead>
                <TableHead className="font-bold text-right">TOTAL</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link
                      href={`/supplier/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.poNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                  <TableCell className="text-muted-foreground">{order.expectedDelivery}</TableCell>
                  <TableCell>{order.shipTo}</TableCell>
                  <TableCell className="text-center">{order.items}</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
