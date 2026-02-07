"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function WarehousesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = trpc.inventory.getWarehouses.useQuery({});
  const { data: statsData } = trpc.inventory.getDashboardStats.useQuery();

  const warehouses = data?.warehouses || [];

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(search.toLowerCase()) ||
      wh.code.toLowerCase().includes(search.toLowerCase()) ||
      (wh.city && wh.city.toLowerCase().includes(search.toLowerCase()))
  );

  const totalLocations = warehouses.reduce((sum, wh) => sum + (wh._count?.locations || 0), 0);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading warehouses: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: "Warehouses" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Warehouses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage warehouse locations and inventory storage.
          </p>
        </div>
        <Link href="/inventory/warehouses/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Add Warehouse
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{warehouses.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{totalLocations}</div>
            )}
            <p className="text-xs text-muted-foreground">Storage Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-600">
                {statsData?.activeItems?.toLocaleString() || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                ${((statsData?.totalValue || 0) / 1000000).toFixed(2)}M
              </div>
            )}
            <p className="text-xs text-muted-foreground">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Warehouses</CardTitle>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search warehouses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? "No warehouses found matching your search." : "No warehouses yet. Create your first warehouse to get started."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">CODE</TableHead>
                  <TableHead className="font-bold">NAME</TableHead>
                  <TableHead className="font-bold">SUBSIDIARY</TableHead>
                  <TableHead className="font-bold">ADDRESS</TableHead>
                  <TableHead className="font-bold text-center">LOCATIONS</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-center">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((wh) => (
                  <TableRow key={wh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <Link href={`/inventory/warehouses/${wh.id}`} className="font-medium text-primary hover:underline">
                        {wh.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{wh.name}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {wh.subsidiary?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {[wh.address1, wh.city, wh.state, wh.country].filter(Boolean).join(", ") || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">{wh._count?.locations || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          wh.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }
                      >
                        {wh.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Link href={`/inventory/warehouses/${wh.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                        </Link>
                        <Link href={`/inventory/warehouses/${wh.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </CardContent>
      </Card>
    </div>
  );
}
