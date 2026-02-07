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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ code: "", name: "", aisle: "", rack: "", shelf: "", bin: "" });

  const { data: warehouse, isLoading, error } = trpc.inventory.getWarehouse.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateWarehouse = trpc.inventory.updateWarehouse.useMutation({
    onSuccess: () => {
      toast({ title: "Warehouse updated", description: "Warehouse has been updated." });
      utils.inventory.getWarehouse.invalidate({ id: params.id as string });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const createLocation = trpc.inventory.createLocation.useMutation({
    onSuccess: () => {
      toast({ title: "Location created", description: "New storage location has been added." });
      utils.inventory.getWarehouse.invalidate({ id: params.id as string });
      setAddLocationOpen(false);
      setNewLocation({ code: "", name: "", aisle: "", rack: "", shelf: "", bin: "" });
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const handleToggleStatus = () => {
    const newStatus = !warehouse?.isActive;
    updateWarehouse.mutate({ id: params.id as string, isActive: newStatus });
  };

  const handleAddLocation = () => {
    if (!newLocation.code || !newLocation.name) {
      toast({ title: "Error", description: "Location code and name are required", variant: "destructive" });
      return;
    }
    createLocation.mutate({
      warehouseId: params.id as string,
      ...newLocation,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Warehouse Not Found</h2>
        <p className="text-muted-foreground mb-4">The warehouse you're looking for doesn't exist.</p>
        <Link href="/inventory/warehouses">
          <Button>Back to Warehouses</Button>
        </Link>
      </div>
    );
  }

  const totalItems = warehouse.locations?.reduce(
    (sum, loc) => sum + (loc.stockLevels?.length || 0),
    0
  ) || 0;

  const totalStock = warehouse.locations?.reduce(
    (sum, loc) =>
      sum + (loc.stockLevels?.reduce((s, sl) => s + Number(sl.quantityOnHand), 0) || 0),
    0
  ) || 0;

  const totalValue = warehouse.locations?.reduce(
    (sum, loc) =>
      sum + (loc.stockLevels?.reduce((s, sl) => s + Number(sl.quantityOnHand) * Number(sl.item?.cost || 0), 0) || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Inventory", href: "/inventory" },
          { label: "Warehouses", href: "/inventory/warehouses" },
          { label: warehouse.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">warehouse</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {warehouse.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  warehouse.isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                }
              >
                {warehouse.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {warehouse.code} {warehouse.subsidiary && `• ${warehouse.subsidiary.name}`}
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
                  {warehouse.isActive ? "block" : "check_circle"}
                </span>
                {warehouse.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href={`/inventory/warehouses/${warehouse.id}/edit`}>
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
              Edit
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-blue-600" onClick={() => setAddLocationOpen(true)}>
            <span className="material-symbols-outlined text-[18px] mr-2">add_location</span>
            Add Location
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {warehouse.locations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Storage Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Inventory Value</p>
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
            value="locations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Locations
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warehouse Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Code</p>
                    <p className="font-medium">{warehouse.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <p className="font-medium">{warehouse.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Subsidiary</p>
                    <p className="font-medium">{warehouse.subsidiary?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Created</p>
                    <p className="font-medium">{new Date(warehouse.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {warehouse.address1 && <p>{warehouse.address1}</p>}
                {warehouse.address2 && <p>{warehouse.address2}</p>}
                <p>
                  {[warehouse.city, warehouse.state, warehouse.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {warehouse.country && <p>{warehouse.country}</p>}
                {!warehouse.address1 && !warehouse.city && (
                  <p className="text-muted-foreground">No address specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Storage Locations</CardTitle>
              <Button size="sm" onClick={() => setAddLocationOpen(true)}>
                <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                Add Location
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {warehouse.locations && warehouse.locations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">CODE</TableHead>
                      <TableHead className="font-bold">NAME</TableHead>
                      <TableHead className="font-bold">AISLE</TableHead>
                      <TableHead className="font-bold">RACK</TableHead>
                      <TableHead className="font-bold">SHELF</TableHead>
                      <TableHead className="font-bold">BIN</TableHead>
                      <TableHead className="font-bold text-right">ITEMS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouse.locations.map((loc: any) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium">{loc.code}</TableCell>
                        <TableCell>{loc.name}</TableCell>
                        <TableCell className="text-muted-foreground">{loc.aisle || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{loc.rack || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{loc.shelf || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{loc.bin || "-"}</TableCell>
                        <TableCell className="text-right">{loc.stockLevels?.length || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">location_on</span>
                  <p>No storage locations yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setAddLocationOpen(true)}>
                    Add First Location
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory by Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {warehouse.locations && warehouse.locations.some((l: any) => l.stockLevels?.length > 0) ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">LOCATION</TableHead>
                      <TableHead className="font-bold">ITEM</TableHead>
                      <TableHead className="font-bold text-right">ON HAND</TableHead>
                      <TableHead className="font-bold text-right">COMMITTED</TableHead>
                      <TableHead className="font-bold text-right">AVAILABLE</TableHead>
                      <TableHead className="font-bold text-right">VALUE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouse.locations.flatMap((loc: any) =>
                      (loc.stockLevels || []).map((sl: any) => (
                        <TableRow key={sl.id}>
                          <TableCell className="font-medium">{loc.code}</TableCell>
                          <TableCell>
                            <Link
                              href={`/inventory/items/${sl.item?.id}`}
                              className="text-primary hover:underline"
                            >
                              {sl.item?.name || "-"}
                            </Link>
                            <p className="text-xs text-muted-foreground">{sl.item?.itemId}</p>
                          </TableCell>
                          <TableCell className="text-right">{Number(sl.quantityOnHand)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {Number(sl.quantityCommitted || 0)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            {Number(sl.quantityAvailable)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${(Number(sl.quantityOnHand) * Number(sl.item?.cost || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                  <p>No inventory in this warehouse</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Storage Location</DialogTitle>
            <DialogDescription>
              Create a new storage location in {warehouse.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loc-code">Location Code *</Label>
                <Input
                  id="loc-code"
                  value={newLocation.code}
                  onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                  placeholder="e.g., A-01-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-name">Location Name *</Label>
                <Input
                  id="loc-name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g., Aisle A Row 1"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loc-aisle">Aisle</Label>
                <Input
                  id="loc-aisle"
                  value={newLocation.aisle}
                  onChange={(e) => setNewLocation({ ...newLocation, aisle: e.target.value })}
                  placeholder="A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-rack">Rack</Label>
                <Input
                  id="loc-rack"
                  value={newLocation.rack}
                  onChange={(e) => setNewLocation({ ...newLocation, rack: e.target.value })}
                  placeholder="01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-shelf">Shelf</Label>
                <Input
                  id="loc-shelf"
                  value={newLocation.shelf}
                  onChange={(e) => setNewLocation({ ...newLocation, shelf: e.target.value })}
                  placeholder="01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-bin">Bin</Label>
                <Input
                  id="loc-bin"
                  value={newLocation.bin}
                  onChange={(e) => setNewLocation({ ...newLocation, bin: e.target.value })}
                  placeholder="01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLocationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation} disabled={createLocation.isPending}>
              {createLocation.isPending ? "Creating..." : "Add Location"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
