"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: item, isLoading, error } = trpc.inventory.getItem.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateItem = trpc.inventory.updateItem.useMutation({
    onSuccess: () => {
      toast({ title: "Item updated", description: "Item has been updated." });
      utils.inventory.getItem.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const deleteItem = trpc.inventory.deleteItem.useMutation({
    onSuccess: () => {
      toast({ title: "Item deleted", description: "Item has been deleted successfully." });
      router.push("/inventory/items");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    },
  });

  const handleToggleStatus = () => {
    const newStatus = item?.isActive !== false ? false : true;
    updateItem.mutate({ id: params.id as string, isActive: newStatus });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteItem.mutate({ id: params.id as string });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
        <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
        <Link href="/inventory/items">
          <Button>Back to Items</Button>
        </Link>
      </div>
    );
  }

  const totalOnHand = item.stockLevels?.reduce((sum, sl) => sum + Number(sl.quantityOnHand), 0) || 0;
  const totalAvailable = item.stockLevels?.reduce((sum, sl) => sum + Number(sl.quantityAvailable), 0) || 0;
  const totalCommitted = item.stockLevels?.reduce((sum, sl) => sum + Number(sl.quantityCommitted || 0), 0) || 0;
  const margin = Number(item.basePrice) > 0 && Number(item.cost) > 0
    ? ((Number(item.basePrice) - Number(item.cost)) / Number(item.basePrice) * 100).toFixed(1)
    : "0";
  const isLowStock = Number(item.reorderPoint || 0) > 0 && totalOnHand <= Number(item.reorderPoint);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: "Items", href: "/inventory/items" },
          { label: item.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">
              {item.itemType === "service" ? "build" : "inventory_2"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {item.name}
              </h1>
              <Badge variant="outline" className={
                isLowStock
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : item.isActive !== false
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
              }>
                {isLowStock ? "Low Stock" : item.isActive !== false ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {item.itemId} • {item.itemType?.replace("_", " ") || "Inventory"}
            </p>
          </div>
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
              <DropdownMenuItem onClick={handleToggleStatus}>
                <span className="material-symbols-outlined text-[18px] mr-2">
                  {item.isActive !== false ? "block" : "check_circle"}
                </span>
                {item.isActive !== false ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">delete</span>
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/inventory/items/${item.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">inventory</span>
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalOnHand}</div>
            <p className="text-xs text-muted-foreground">On Hand</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${Number(item.basePrice || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Sale Price</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${Number(item.cost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{margin}%</div>
            <p className="text-xs text-muted-foreground">Margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="stock"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Stock Levels
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Item ID</p>
                    <p className="font-medium">{item.itemId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Type</p>
                    <p className="font-medium capitalize">{item.itemType?.replace("_", " ") || "inventory"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Track Inventory</p>
                    <p className="font-medium">{item.trackInventory !== false ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Taxable</p>
                    <p className="font-medium">{item.isTaxable !== false ? "Yes" : "No"}</p>
                  </div>
                  {item.weight && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Weight</p>
                      <p className="font-medium">{Number(item.weight)} {item.weightUnit || "lb"}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Stock Unit</p>
                    <p className="font-medium">{item.stockUnit || "EA"}</p>
                  </div>
                </div>
                {item.description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Description</p>
                    <p className="text-sm mt-1">{item.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purchasing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Cost</p>
                    <p className="font-medium">${Number(item.cost || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Reorder Point</p>
                    <p className="font-medium">{item.reorderPoint ? `${item.reorderPoint} units` : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Preferred Stock</p>
                    <p className="font-medium">{item.preferredStockLevel ? `${item.preferredStockLevel} units` : "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Purchase Unit</p>
                    <p className="font-medium">{item.purchaseUnit || "EA"}</p>
                  </div>
                </div>
                {item.preferredVendor && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Preferred Vendor</p>
                    <Link href={`/purchasing/vendors/${item.preferredVendor.id}`} className="font-medium text-primary hover:underline">
                      {item.preferredVendor.companyName}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock by Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {item.stockLevels && item.stockLevels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">WAREHOUSE</TableHead>
                      <TableHead className="font-bold">LOCATION</TableHead>
                      <TableHead className="font-bold text-right">ON HAND</TableHead>
                      <TableHead className="font-bold text-right">COMMITTED</TableHead>
                      <TableHead className="font-bold text-right">AVAILABLE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.stockLevels.map((stock: any) => (
                      <TableRow key={stock.id}>
                        <TableCell>
                          <p className="font-medium">{stock.location?.warehouse?.name || "Unknown"}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {stock.location?.name || stock.location?.code || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{Number(stock.quantityOnHand)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{Number(stock.quantityCommitted || 0)}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">{Number(stock.quantityAvailable)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right">{totalOnHand}</TableCell>
                      <TableCell className="text-right">{totalCommitted}</TableCell>
                      <TableCell className="text-right text-green-600">{totalAvailable}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                  <p>No stock records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {item.inventoryTransactions && item.inventoryTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">TYPE</TableHead>
                      <TableHead className="font-bold">REFERENCE</TableHead>
                      <TableHead className="font-bold">LOCATION</TableHead>
                      <TableHead className="font-bold text-right">QUANTITY</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.inventoryTransactions.map((txn: any) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(txn.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              txn.transactionType === "sale"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : txn.transactionType === "receipt" || txn.transactionType === "purchase"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                            }
                          >
                            {txn.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{txn.transactionId}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {txn.location?.name || txn.location?.code || "-"}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${Number(txn.quantity) < 0 ? "text-red-600" : "text-green-600"}`}>
                          {Number(txn.quantity) > 0 ? "+" : ""}{Number(txn.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">history</span>
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {item.name}? This action cannot be undone.
              {totalOnHand > 0 && (
                <span className="block mt-2 text-amber-600">
                  Note: Items with existing stock cannot be deleted.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
