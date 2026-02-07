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

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "inventory", label: "Inventory" },
  { value: "service", label: "Service" },
  { value: "non_inventory", label: "Non-Inventory" },
  { value: "kit", label: "Kit/Bundle" },
];

export default function ItemsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.inventory.getItems.useQuery({
    page,
    limit: 20,
    itemType: typeFilter !== "all" ? typeFilter : undefined,
    search: search || undefined,
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const inventoryCount = items.filter((i) => i.itemType === "inventory").length;
  const lowStockCount = items.filter((i) => {
    const reorderPoint = Number(i.reorderPoint) || 0;
    return i.totalStock <= reorderPoint && reorderPoint > 0;
  }).length;
  const totalValue = items.reduce((sum, i) => sum + (i.totalStock * Number(i.cost || 0)), 0);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading items: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: "Items" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Items
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and inventory levels.
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
              <DropdownMenuItem onClick={() => window.open("/api/export/excel?type=items", "_blank")}>
                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                Export to Excel
              </DropdownMenuItem>
              <ImportDialog type="items">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-[18px] mr-2">upload</span>
                  Import from CSV
                </DropdownMenuItem>
              </ImportDialog>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/inventory/items/new">
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              New Item
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-primary">{total}</div>}
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{inventoryCount}</div>}
            <p className="text-xs text-muted-foreground">Inventory Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>}
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold text-slate-600">${totalValue.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Items</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <Input placeholder="Search items..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 w-full sm:w-64" />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No items found. Create your first item to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">ITEM ID</TableHead>
                    <TableHead className="font-bold">NAME</TableHead>
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold text-right">PRICE</TableHead>
                    <TableHead className="font-bold text-right">COST</TableHead>
                    <TableHead className="font-bold text-center">QTY ON HAND</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLowStock = Number(item.reorderPoint || 0) > 0 && item.totalStock <= Number(item.reorderPoint);
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell><Link href={`/inventory/items/${item.id}`} className="font-medium text-primary hover:underline">{item.itemId}</Link></TableCell>
                        <TableCell>
                          <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.description || "-"}</p></div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{item.itemType?.replace("_", " ") || "inventory"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${Number(item.basePrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right text-muted-foreground">${Number(item.cost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-center">
                          {item.trackInventory !== false ? (
                            <span className={isLowStock ? "text-amber-600 font-bold" : ""}>{item.totalStock}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={isLowStock ? "bg-amber-100 text-amber-800 border-amber-200" : item.isActive !== false ? "bg-green-100 text-green-800 border-green-200" : "bg-slate-100 text-slate-800 border-slate-200"}>
                            {isLowStock ? "Low Stock" : item.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Link href={`/inventory/items/${item.id}`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">visibility</span></Button></Link>
                            <Link href={`/inventory/items/${item.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">edit</span></Button></Link>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><span className="material-symbols-outlined text-[18px]">more_vert</span></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">Showing {items.length} of {total} items</p>
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
