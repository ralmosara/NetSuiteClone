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

const transfers = [
  {
    id: "tr-1",
    transferNumber: "TR-1050",
    fromWarehouse: "San Francisco Main",
    fromCode: "WH-SF-MAIN",
    toWarehouse: "New York Distribution",
    toCode: "WH-NY-DIST",
    date: "Oct 24, 2023",
    itemCount: 5,
    status: "in_transit",
  },
  {
    id: "tr-2",
    transferNumber: "TR-1049",
    fromWarehouse: "San Francisco Main",
    fromCode: "WH-SF-MAIN",
    toWarehouse: "Texas Regional",
    toCode: "WH-TX-REG",
    date: "Oct 22, 2023",
    itemCount: 12,
    status: "received",
  },
  {
    id: "tr-3",
    transferNumber: "TR-1048",
    fromWarehouse: "New York Distribution",
    fromCode: "WH-NY-DIST",
    toWarehouse: "San Francisco Main",
    toCode: "WH-SF-MAIN",
    date: "Oct 20, 2023",
    itemCount: 3,
    status: "received",
  },
  {
    id: "tr-4",
    transferNumber: "TR-1047",
    fromWarehouse: "Texas Regional",
    fromCode: "WH-TX-REG",
    toWarehouse: "New York Distribution",
    toCode: "WH-NY-DIST",
    date: "Oct 18, 2023",
    itemCount: 8,
    status: "pending",
  },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_transit", label: "In Transit" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    in_transit: { label: "In Transit", className: "bg-blue-100 text-blue-800 border-blue-200" },
    received: { label: "Received", className: "bg-green-100 text-green-800 border-green-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function TransfersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.fromWarehouse.toLowerCase().includes(search.toLowerCase()) ||
      t.toWarehouse.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: "Transfers" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory Transfers
          </h1>
          <p className="text-muted-foreground mt-1">
            Transfer stock between warehouse locations.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{transfers.length}</div>
            <p className="text-xs text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {transfers.filter((t) => t.status === "in_transit").length}
            </div>
            <p className="text-xs text-muted-foreground">In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {transfers.filter((t) => t.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {transfers.filter((t) => t.status === "received").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Transfers</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search transfers..."
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
                <TableHead className="font-bold">TRANSFER #</TableHead>
                <TableHead className="font-bold">FROM</TableHead>
                <TableHead className="font-bold">TO</TableHead>
                <TableHead className="font-bold">DATE</TableHead>
                <TableHead className="font-bold text-center">ITEMS</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link href={`/inventory/transfers/${transfer.id}`} className="font-medium text-primary hover:underline">
                      {transfer.transferNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.fromWarehouse}</p>
                      <p className="text-xs text-muted-foreground">{transfer.fromCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-muted-foreground text-[16px]">
                        arrow_forward
                      </span>
                      <div>
                        <p className="font-medium">{transfer.toWarehouse}</p>
                        <p className="text-xs text-muted-foreground">{transfer.toCode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transfer.date}</TableCell>
                  <TableCell className="text-center">{transfer.itemCount}</TableCell>
                  <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
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
