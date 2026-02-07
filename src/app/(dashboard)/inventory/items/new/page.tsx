"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

export default function NewItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    itemType: "inventory",
    basePrice: "",
    cost: "",
    trackInventory: true,
    purchaseUnit: "EA",
    saleUnit: "EA",
    stockUnit: "EA",
    reorderPoint: "",
    preferredStockLevel: "",
    weight: "",
    weightUnit: "lb",
    isTaxable: true,
  });

  const { data: vendors } = trpc.purchasing.getVendors.useQuery({ limit: 100 });

  const createItem = trpc.inventory.createItem.useMutation({
    onSuccess: (data) => {
      toast({ title: "Item created", description: `Item ${data.itemId} has been created successfully.` });
      router.push(`/inventory/items/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: "Error", description: "Item name is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    createItem.mutate({
      ...formData,
      basePrice: formData.basePrice ? parseFloat(formData.basePrice) : 0,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      reorderPoint: formData.reorderPoint ? parseFloat(formData.reorderPoint) : undefined,
      preferredStockLevel: formData.preferredStockLevel ? parseFloat(formData.preferredStockLevel) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Inventory", href: "/inventory" }, { label: "Items", href: "/inventory/items" }, { label: "New Item" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">New Item</h1>
          <p className="text-muted-foreground mt-1">Create a new inventory item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Enter item name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={formData.displayName} onChange={(e) => handleChange("displayName", e.target.value)} placeholder="Display name for sales" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Item description" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemType">Item Type</Label>
                <Select value={formData.itemType} onValueChange={(v) => handleChange("itemType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory Item</SelectItem>
                    <SelectItem value="non_inventory">Non-Inventory Item</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="kit">Kit/Bundle</SelectItem>
                    <SelectItem value="assembly">Assembly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Sale Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="basePrice" type="number" step="0.01" value={formData.basePrice} onChange={(e) => handleChange("basePrice", e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="cost" type="number" step="0.01" value={formData.cost} onChange={(e) => handleChange("cost", e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isTaxable" checked={formData.isTaxable} onChange={(e) => handleChange("isTaxable", e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="isTaxable" className="text-sm font-normal">Taxable</Label>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Settings */}
          <Card>
            <CardHeader><CardTitle>Inventory Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="trackInventory" checked={formData.trackInventory} onChange={(e) => handleChange("trackInventory", e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="trackInventory" className="text-sm font-normal">Track Inventory</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input id="reorderPoint" type="number" value={formData.reorderPoint} onChange={(e) => handleChange("reorderPoint", e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredStockLevel">Preferred Stock Level</Label>
                  <Input id="preferredStockLevel" type="number" value={formData.preferredStockLevel} onChange={(e) => handleChange("preferredStockLevel", e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseUnit">Purchase Unit</Label>
                  <Select value={formData.purchaseUnit} onValueChange={(v) => handleChange("purchaseUnit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EA">Each</SelectItem>
                      <SelectItem value="BOX">Box</SelectItem>
                      <SelectItem value="CASE">Case</SelectItem>
                      <SelectItem value="PALLET">Pallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saleUnit">Sale Unit</Label>
                  <Select value={formData.saleUnit} onValueChange={(v) => handleChange("saleUnit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EA">Each</SelectItem>
                      <SelectItem value="BOX">Box</SelectItem>
                      <SelectItem value="CASE">Case</SelectItem>
                      <SelectItem value="PALLET">Pallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockUnit">Stock Unit</Label>
                  <Select value={formData.stockUnit} onValueChange={(v) => handleChange("stockUnit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EA">Each</SelectItem>
                      <SelectItem value="BOX">Box</SelectItem>
                      <SelectItem value="CASE">Case</SelectItem>
                      <SelectItem value="PALLET">Pallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weight & Dimensions */}
          <Card>
            <CardHeader><CardTitle>Weight & Shipping</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" type="number" step="0.01" value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightUnit">Weight Unit</Label>
                  <Select value={formData.weightUnit} onValueChange={(v) => handleChange("weightUnit", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="bg-primary hover:bg-blue-600" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Item"}
          </Button>
        </div>
      </form>
    </div>
  );
}
