"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb } from "@/components/layout/breadcrumb";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseApiError } from "@/lib/error-utils";

interface OrderLine {
  id: number;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
}

const paymentTermsOptions = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
];

const shippingMethodOptions = [
  { value: "standard", label: "Standard Shipping" },
  { value: "express", label: "Express Shipping" },
  { value: "overnight", label: "Overnight" },
  { value: "pickup", label: "Customer Pickup" },
];

export default function NewSalesOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedShipDate: "",
    shippingMethod: "",
    shippingCost: 0,
    discountPercent: 0,
    memo: "",
    internalNotes: "",
    shipToAddress1: "",
    shipToAddress2: "",
    shipToCity: "",
    shipToState: "",
    shipToCountry: "",
    shipToPostal: "",
  });

  const [lines, setLines] = useState<OrderLine[]>([]);

  // Queries
  const { data: customersData } = trpc.customers.getCustomers.useQuery({
    page: 1,
    limit: 100,
    search: customerSearch || undefined,
  });

  const { data: itemsData } = trpc.inventory.searchItems.useQuery(
    { query: itemSearch || "a" },
    { enabled: itemSearch.length > 0 || itemOpen }
  );

  const { data: currenciesData } = trpc.finance.getCurrencies.useQuery();

  const createOrderMutation = trpc.sales.createSalesOrder.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Order Created",
        description: `Sales order ${data.orderNumber} has been created successfully.`,
      });
      router.push(`/sales/orders/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: parseApiError(error),
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const customers = customersData?.customers || [];
  const items = itemsData || [];
  const defaultCurrency = currenciesData?.find((c) => c.code === "USD");

  // Calculate totals
  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const lineAmount = line.quantity * line.unitPrice * (1 - line.discountPercent / 100);
      return sum + lineAmount;
    }, 0);
  }, [lines]);

  const discountAmount = subtotal * (formData.discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;

  const taxAmount = useMemo(() => {
    return lines.reduce((sum, line) => {
      const lineAmount = line.quantity * line.unitPrice * (1 - line.discountPercent / 100);
      return sum + (lineAmount * line.taxRate / 100);
    }, 0) * (1 - formData.discountPercent / 100);
  }, [lines, formData.discountPercent]);

  const total = taxableAmount + taxAmount + formData.shippingCost;

  const handleCustomerSelect = (customer: typeof customers[0]) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.companyName || customer.displayName || "",
      shipToAddress1: customer.shippingAddress1 || customer.billingAddress1 || "",
      shipToAddress2: customer.shippingAddress2 || customer.billingAddress2 || "",
      shipToCity: customer.shippingCity || customer.billingCity || "",
      shipToState: customer.shippingState || customer.billingState || "",
      shipToCountry: customer.shippingCountry || customer.billingCountry || "",
      shipToPostal: customer.shippingPostal || customer.billingPostal || "",
    });
    setCustomerOpen(false);
  };

  const handleAddLine = (item: typeof items[0]) => {
    setLines([
      ...lines,
      {
        id: Date.now(),
        itemId: item.id,
        itemName: item.name,
        description: "",
        quantity: 1,
        unitPrice: Number(item.basePrice) || 0,
        discountPercent: 0,
        taxRate: 8.75, // Default tax rate
      },
    ]);
    setItemOpen(false);
    setItemSearch("");
  };

  const handleUpdateLine = (index: number, field: keyof OrderLine, value: string | number) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customer = "Please select a customer";
    }

    if (lines.length === 0) {
      newErrors.lines = "Please add at least one line item";
    }

    // Validate line items
    lines.forEach((line, index) => {
      if (line.quantity <= 0) {
        newErrors[`line_${index}_quantity`] = "Quantity must be greater than 0";
      }
      if (line.unitPrice < 0) {
        newErrors[`line_${index}_price`] = "Unit price cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    createOrderMutation.mutate({
      customerId: formData.customerId,
      currencyId: defaultCurrency?.id || "",
      orderDate: new Date(formData.orderDate),
      expectedShipDate: formData.expectedShipDate ? new Date(formData.expectedShipDate) : undefined,
      shippingMethod: formData.shippingMethod || undefined,
      shippingCost: formData.shippingCost,
      discountPercent: formData.discountPercent,
      memo: formData.memo || undefined,
      internalNotes: formData.internalNotes || undefined,
      shipToAddress1: formData.shipToAddress1 || undefined,
      shipToAddress2: formData.shipToAddress2 || undefined,
      shipToCity: formData.shipToCity || undefined,
      shipToState: formData.shipToState || undefined,
      shipToCountry: formData.shipToCountry || undefined,
      shipToPostal: formData.shipToPostal || undefined,
      lines: lines.map((line) => ({
        itemId: line.itemId,
        description: line.description || undefined,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent,
        taxRate: line.taxRate,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Orders", href: "/sales/orders" },
          { label: "New Order" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Sales Order
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new sales order for a customer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer *</Label>
                    <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerOpen}
                          className="w-full justify-between"
                        >
                          {formData.customerName || "Select a customer..."}
                          <span className="material-symbols-outlined text-[18px] ml-2">unfold_more</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search customers..."
                            value={customerSearch}
                            onValueChange={setCustomerSearch}
                          />
                          <CommandList>
                            <CommandEmpty>No customers found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.companyName || customer.displayName || ""}
                                  onSelect={() => handleCustomerSelect(customer)}
                                >
                                  <div>
                                    <p className="font-medium">{customer.companyName || customer.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{customer.customerId} - {customer.email}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.customer && (
                      <p className="text-sm text-destructive">{errors.customer}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Order Date *</Label>
                    <Input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  </div>
                </div>

                {formData.customerId && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-4">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Address Line 1"
                        value={formData.shipToAddress1}
                        onChange={(e) => setFormData({ ...formData, shipToAddress1: e.target.value })}
                      />
                      <Input
                        placeholder="Address Line 2"
                        value={formData.shipToAddress2}
                        onChange={(e) => setFormData({ ...formData, shipToAddress2: e.target.value })}
                      />
                      <Input
                        placeholder="City"
                        value={formData.shipToCity}
                        onChange={(e) => setFormData({ ...formData, shipToCity: e.target.value })}
                      />
                      <Input
                        placeholder="State"
                        value={formData.shipToState}
                        onChange={(e) => setFormData({ ...formData, shipToState: e.target.value })}
                      />
                      <Input
                        placeholder="Postal Code"
                        value={formData.shipToPostal}
                        onChange={(e) => setFormData({ ...formData, shipToPostal: e.target.value })}
                      />
                      <Input
                        placeholder="Country"
                        value={formData.shipToCountry}
                        onChange={(e) => setFormData({ ...formData, shipToCountry: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Line Items</CardTitle>
                  {errors.lines && (
                    <p className="text-sm text-destructive mt-1">{errors.lines}</p>
                  )}
                </div>
                <Popover open={itemOpen} onOpenChange={setItemOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                      Add Item
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search items..."
                        value={itemSearch}
                        onValueChange={setItemSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No items found.</CommandEmpty>
                        <CommandGroup>
                          {items.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={item.name}
                              onSelect={() => handleAddLine(item)}
                            >
                              <div className="flex justify-between w-full">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.itemId}</p>
                                </div>
                                <span className="text-sm font-medium">
                                  ${Number(item.basePrice || 0).toFixed(2)}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent className="p-0">
                {lines.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <span className="material-symbols-outlined text-[48px] mb-2">shopping_cart</span>
                    <p>No items added yet. Click "Add Item" to add line items.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-bold">ITEM</TableHead>
                        <TableHead className="font-bold text-center w-24">QTY</TableHead>
                        <TableHead className="font-bold text-right w-28">PRICE</TableHead>
                        <TableHead className="font-bold text-center w-24">DISC %</TableHead>
                        <TableHead className="font-bold text-center w-24">TAX %</TableHead>
                        <TableHead className="font-bold text-right w-28">AMOUNT</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => {
                        const lineAmount = line.quantity * line.unitPrice * (1 - line.discountPercent / 100);
                        return (
                          <TableRow key={line.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{line.itemName}</p>
                                <Input
                                  placeholder="Description"
                                  value={line.description}
                                  onChange={(e) => handleUpdateLine(index, "description", e.target.value)}
                                  className="h-7 mt-1 text-xs"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => handleUpdateLine(index, "quantity", parseInt(e.target.value) || 1)}
                                className="h-8 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.unitPrice}
                                onChange={(e) => handleUpdateLine(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={line.discountPercent}
                                onChange={(e) => handleUpdateLine(index, "discountPercent", parseFloat(e.target.value) || 0)}
                                className="h-8 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={line.taxRate}
                                onChange={(e) => handleUpdateLine(index, "taxRate", parseFloat(e.target.value) || 0)}
                                className="h-8 text-center"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${lineAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveLine(index)}
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                {lines.length > 0 && (
                  <div className="border-t p-4">
                    <div className="max-w-xs ml-auto space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount ({formData.discountPercent}%)</span>
                          <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      {formData.shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>${formData.shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Memo (visible to customer)</Label>
                  <Textarea
                    placeholder="Add notes visible on the order..."
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <Textarea
                    placeholder="Internal notes (not visible to customer)..."
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Expected Ship Date</Label>
                  <Input
                    type="date"
                    value={formData.expectedShipDate}
                    onChange={(e) => setFormData({ ...formData, expectedShipDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shipping Method</Label>
                  <Select
                    value={formData.shippingMethod}
                    onValueChange={(v) => setFormData({ ...formData, shippingMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Cost</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Order Discount %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{lines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                  {formData.shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">${formData.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600"
                disabled={isSubmitting || !formData.customerId || lines.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-2 animate-spin">progress_activity</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] mr-2">save</span>
                    Create Order
                  </>
                )}
              </Button>
              <Link href="/sales/orders">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
