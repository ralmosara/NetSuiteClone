"use client";

import { useState, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";
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

interface InvoiceLine {
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

const paymentTermsOptions = [
  { value: "Due on Receipt", label: "Due on Receipt" },
  { value: "Net 15", label: "Net 15" },
  { value: "Net 30", label: "Net 30" },
  { value: "Net 45", label: "Net 45" },
  { value: "Net 60", label: "Net 60" },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    terms: "Net 30",
    memo: "",
    billToAddress1: "",
    billToAddress2: "",
    billToCity: "",
    billToState: "",
    billToCountry: "",
    billToPostal: "",
  });

  const [lines, setLines] = useState<InvoiceLine[]>([]);

  // Queries
  const { data: customersData, isLoading: customersLoading } = trpc.customers.getCustomers.useQuery({
    page: 1,
    limit: 100,
    search: customerSearch || undefined,
  });

  const { data: itemsData } = trpc.inventory.searchItems.useQuery(
    { query: itemSearch || "a" },
    { enabled: itemSearch.length > 0 || itemOpen }
  );

  const { data: currenciesData } = trpc.finance.getCurrencies.useQuery();

  const createInvoiceMutation = trpc.sales.createInvoice.useMutation({
    onSuccess: (data) => {
      router.push(`/sales/invoices/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const customers = customersData?.customers || [];
  const items = itemsData || [];
  const defaultCurrency = currenciesData?.find((c) => c.code === "USD");

  // Calculate totals
  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  }, [lines]);

  const taxAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice * line.taxRate / 100), 0);
  }, [lines]);

  const total = subtotal + taxAmount;

  const handleCustomerSelect = (customer: typeof customers[0]) => {
    setFormData({
      ...formData,
      customerId: customer.id,
      customerName: customer.companyName || customer.displayName || "",
      billToAddress1: customer.billingAddress1 || "",
      billToAddress2: customer.billingAddress2 || "",
      billToCity: customer.billingCity || "",
      billToState: customer.billingState || "",
      billToCountry: customer.billingCountry || "",
      billToPostal: customer.billingPostal || "",
    });
    setCustomerOpen(false);
  };

  const handleAddLine = (item: typeof items[0]) => {
    setLines([
      ...lines,
      {
        itemId: item.id,
        itemName: item.name,
        description: "",
        quantity: 1,
        unitPrice: Number(item.basePrice) || 0,
        taxRate: 0,
      },
    ]);
    setItemOpen(false);
    setItemSearch("");
  };

  const handleUpdateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert("Please select a customer");
      return;
    }

    if (lines.length === 0) {
      alert("Please add at least one line item");
      return;
    }

    setIsSubmitting(true);

    createInvoiceMutation.mutate({
      customerId: formData.customerId,
      currencyId: defaultCurrency?.id || "",
      invoiceDate: new Date(formData.invoiceDate),
      terms: formData.terms,
      memo: formData.memo || undefined,
      billToAddress1: formData.billToAddress1 || undefined,
      billToAddress2: formData.billToAddress2 || undefined,
      billToCity: formData.billToCity || undefined,
      billToState: formData.billToState || undefined,
      billToCountry: formData.billToCountry || undefined,
      billToPostal: formData.billToPostal || undefined,
      lines: lines.map((line) => ({
        itemId: line.itemId,
        description: line.description || undefined,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Invoices", href: "/sales/invoices" },
          { label: "New Invoice" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Invoice
          </h1>
          <p className="text-muted-foreground mt-1">
            Create a new invoice for a customer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Customer *</Label>
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
                                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {formData.customerId && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">Bill To</h4>
                      <Input
                        placeholder="Address Line 1"
                        value={formData.billToAddress1}
                        onChange={(e) => setFormData({ ...formData, billToAddress1: e.target.value })}
                      />
                      <Input
                        placeholder="Address Line 2"
                        value={formData.billToAddress2}
                        onChange={(e) => setFormData({ ...formData, billToAddress2: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="City"
                          value={formData.billToCity}
                          onChange={(e) => setFormData({ ...formData, billToCity: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          value={formData.billToState}
                          onChange={(e) => setFormData({ ...formData, billToState: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Postal Code"
                          value={formData.billToPostal}
                          onChange={(e) => setFormData({ ...formData, billToPostal: e.target.value })}
                        />
                        <Input
                          placeholder="Country"
                          value={formData.billToCountry}
                          onChange={(e) => setFormData({ ...formData, billToCountry: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
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
                    No items added yet. Click "Add Item" to add line items.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-bold">ITEM</TableHead>
                        <TableHead className="font-bold">DESCRIPTION</TableHead>
                        <TableHead className="font-bold text-center w-24">QTY</TableHead>
                        <TableHead className="font-bold text-right w-32">PRICE</TableHead>
                        <TableHead className="font-bold text-center w-24">TAX %</TableHead>
                        <TableHead className="font-bold text-right w-32">AMOUNT</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{line.itemName}</TableCell>
                          <TableCell>
                            <Input
                              placeholder="Description"
                              value={line.description}
                              onChange={(e) => handleUpdateLine(index, "description", e.target.value)}
                              className="h-8"
                            />
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
                              step="0.01"
                              value={line.taxRate}
                              onChange={(e) => handleUpdateLine(index, "taxRate", parseFloat(e.target.value) || 0)}
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${(line.quantity * line.unitPrice).toFixed(2)}
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
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes or instructions for this invoice..."
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select
                    value={formData.terms}
                    onValueChange={(v) => setFormData({ ...formData, terms: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTermsOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
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
                    Create Invoice
                  </>
                )}
              </Button>
              <Link href="/sales/invoices">
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
