"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

interface LineItem {
  id: string;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    vendorId: "",
    currencyId: "",
    shipToWarehouseId: "",
    expectedReceiptDate: "",
    memo: "",
    vendorRefNumber: "",
  });

  const [lines, setLines] = useState<LineItem[]>([]);
  const [newLine, setNewLine] = useState({
    itemId: "",
    quantity: 1,
  });

  // Fetch vendors, items, currencies, and warehouses
  const { data: vendorsData } = trpc.purchasing.getVendors.useQuery({ limit: 100 });
  const { data: itemsData } = trpc.inventory.getItems.useQuery({ limit: 100 });
  const { data: currencies } = trpc.finance.getCurrencies.useQuery();
  const { data: warehousesData } = trpc.inventory.getWarehouses.useQuery({});

  // Set default currency
  useEffect(() => {
    if (currencies && currencies.length > 0 && !formData.currencyId) {
      const defaultCurrency = currencies.find((c: any) => c.code === "USD") || currencies[0];
      setFormData(prev => ({ ...prev, currencyId: defaultCurrency.id }));
    }
  }, [currencies, formData.currencyId]);

  const createPurchaseOrder = trpc.purchasing.createPurchaseOrder.useMutation({
    onSuccess: (data) => {
      toast({ title: "Purchase order created", description: `${data.poNumber} has been created.` });
      router.push(`/purchasing/orders/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const addLine = () => {
    if (!newLine.itemId) {
      toast({ title: "Error", description: "Please select an item", variant: "destructive" });
      return;
    }

    const item = itemsData?.items?.find((i: any) => i.id === newLine.itemId);
    if (!item) return;

    const unitPrice = Number(item.basePrice) || 0;
    const amount = newLine.quantity * unitPrice;

    setLines([
      ...lines,
      {
        id: `line-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        description: item.description || "",
        quantity: newLine.quantity,
        unitPrice,
        amount,
      },
    ]);

    setNewLine({ itemId: "", quantity: 1 });
  };

  const updateLineQuantity = (lineId: string, quantity: number) => {
    setLines(
      lines.map((line) =>
        line.id === lineId
          ? { ...line, quantity, amount: quantity * line.unitPrice }
          : line
      )
    );
  };

  const updateLinePrice = (lineId: string, unitPrice: number) => {
    setLines(
      lines.map((line) =>
        line.id === lineId
          ? { ...line, unitPrice, amount: line.quantity * unitPrice }
          : line
      )
    );
  };

  const removeLine = (lineId: string) => {
    setLines(lines.filter((line) => line.id !== lineId));
  };

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!formData.vendorId) {
      toast({ title: "Error", description: "Please select a vendor", variant: "destructive" });
      return;
    }

    if (!formData.currencyId) {
      toast({ title: "Error", description: "Please select a currency", variant: "destructive" });
      return;
    }

    if (lines.length === 0) {
      toast({ title: "Error", description: "Please add at least one line item", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    createPurchaseOrder.mutate({
      vendorId: formData.vendorId,
      currencyId: formData.currencyId,
      orderDate: new Date(),
      expectedReceiptDate: formData.expectedReceiptDate ? new Date(formData.expectedReceiptDate) : undefined,
      shipToWarehouseId: formData.shipToWarehouseId || undefined,
      memo: formData.memo || undefined,
      vendorRefNumber: formData.vendorRefNumber || undefined,
      lines: lines.map((line) => ({
        itemId: line.itemId,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    });
  };

  const selectedCurrency = currencies?.find((c: any) => c.id === formData.currencyId);
  const currencySymbol = selectedCurrency?.symbol || "$";

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Purchasing", href: "/purchasing" },
          { label: "Orders", href: "/purchasing/orders" },
          { label: "New Purchase Order" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Purchase Order
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new purchase order for vendor goods.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/purchasing/orders">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Select value={formData.vendorId} onValueChange={(v) => setFormData({ ...formData, vendorId: v })}>
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorsData?.vendors?.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendorRef">Vendor Reference</Label>
                  <Input
                    id="vendorRef"
                    placeholder="Vendor's reference number"
                    value={formData.vendorRefNumber}
                    onChange={(e) => setFormData({ ...formData, vendorRefNumber: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Ship To Warehouse</Label>
                  <Select value={formData.shipToWarehouseId} onValueChange={(v) => setFormData({ ...formData, shipToWarehouseId: v })}>
                    <SelectTrigger id="warehouse">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehousesData?.warehouses?.map((wh: any) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Receipt Date</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={formData.expectedReceiptDate}
                    onChange={(e) => setFormData({ ...formData, expectedReceiptDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currencyId} onValueChange={(v) => setFormData({ ...formData, currencyId: v })}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies?.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  placeholder="Internal notes for this order"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Line Form */}
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Item</Label>
                  <Select value={newLine.itemId} onValueChange={(v) => setNewLine({ ...newLine, itemId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsData?.items?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.itemId} - {item.name} - ${Number(item.basePrice).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newLine.quantity}
                    onChange={(e) => setNewLine({ ...newLine, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Button type="button" onClick={addLine} variant="outline">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </Button>
              </div>

              {/* Lines Table */}
              {lines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">ITEM</TableHead>
                      <TableHead className="font-bold w-24">QTY</TableHead>
                      <TableHead className="font-bold w-32">UNIT PRICE</TableHead>
                      <TableHead className="font-bold text-right w-32">AMOUNT</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <p className="font-medium">{line.itemName}</p>
                          {line.description && (
                            <p className="text-xs text-muted-foreground">{line.description}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLineQuantity(line.id, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => updateLinePrice(line.id, parseFloat(e.target.value) || 0)}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {currencySymbol}{line.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeLine(line.id)}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">shopping_cart</span>
                  <p>No items added yet</p>
                  <p className="text-sm">Select an item from the dropdown to add it to the order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lines.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span>{lines.reduce((sum, l) => sum + l.quantity, 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Subtotal</span>
                  <span className="text-primary">
                    {currencySymbol}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-blue-600"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Purchase Order"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
