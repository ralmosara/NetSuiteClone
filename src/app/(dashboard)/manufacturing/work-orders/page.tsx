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
  { value: "planned", label: "Planned" },
  { value: "released", label: "Released" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    planned: { label: "Planned", className: "bg-slate-100 text-slate-800 border-slate-200" },
    released: { label: "Released", className: "bg-purple-100 text-purple-800 border-purple-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.planned;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const config: Record<string, { className: string }> = {
    urgent: { className: "bg-red-100 text-red-800 border-red-200" },
    high: { className: "bg-amber-100 text-amber-800 border-amber-200" },
    normal: { className: "bg-slate-100 text-slate-800 border-slate-200" },
    low: { className: "bg-slate-50 text-slate-600 border-slate-200" },
  };
  const { className } = config[priority] || config.normal;
  return (
    <Badge variant="outline" className={className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export default function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = trpc.manufacturing.getWorkOrders.useQuery({
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    search: search || undefined,
  });

  const { data: stats } = trpc.manufacturing.getManufacturingStats.useQuery();

  const workOrders = data?.workOrders || [];
  const total = data?.total || 0;

  const totalUnitsPlanned = workOrders.reduce((sum, wo) => sum + wo.plannedQuantity, 0);
  const totalUnitsCompleted = workOrders.reduce((sum, wo) => sum + (wo.completedQuantity || 0), 0);
  const completionRate = totalUnitsPlanned > 0 ? (totalUnitsCompleted / totalUnitsPlanned) * 100 : 0;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading work orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Work Orders" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Work Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage production work orders and track progress.
          </p>
        </div>
        <Link href="/manufacturing/work-orders/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New Work Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{stats?.totalWorkOrders || total}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Work Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats?.inProgressWorkOrders || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-600">{totalUnitsPlanned}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Units Planned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {completionRate.toFixed(0)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Work Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search work orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          ) : workOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search || statusFilter !== "all"
                ? "No work orders found matching your filters."
                : "No work orders yet. Create your first work order to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">WO #</TableHead>
                  <TableHead className="font-bold">PRODUCT</TableHead>
                  <TableHead className="font-bold text-center">PROGRESS</TableHead>
                  <TableHead className="font-bold">DUE DATE</TableHead>
                  <TableHead className="font-bold">PRIORITY</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => {
                  const completed = wo.completedQuantity || 0;
                  const planned = wo.plannedQuantity || 1;
                  const progress = (completed / planned) * 100;

                  return (
                    <TableRow key={wo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell>
                        <Link
                          href={`/manufacturing/work-orders/${wo.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {wo.workOrderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wo.bom?.name || "Unknown BOM"}</p>
                          <p className="text-xs text-muted-foreground">{wo.bom?.bomId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden min-w-[60px]">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {completed}/{planned}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {wo.plannedEndDate
                          ? new Date(wo.plannedEndDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(wo.priority)}</TableCell>
                      <TableCell>{getStatusBadge(wo.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Link href={`/manufacturing/work-orders/${wo.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
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
