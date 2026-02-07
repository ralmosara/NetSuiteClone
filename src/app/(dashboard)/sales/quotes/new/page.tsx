"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

interface QuoteLine {
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerId: searchParams.get("customerId") || "",
    currencyId: "",
    quoteDate: new Date().toISOString().split("T")[0],
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    terms: "",
    memo: "",
  });

  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [newLine, setNewLine] = useState({
    itemId: "",
    quantity: 1,
  });

  // Fetch customers and items
  const { data: customersData } = trpc.customers.getCustomers.useQuery({ limit: 100 });
  const { data: itemsData } = trpc.inventory.getItems.useQuery({ limit: 100 });
  const { data: currencies } = trpc.finance.getCurrencies.useQuery();

  // Set default currency
  useEffect(() => {
    if (currencies && currencies.length > 0 && !formData.currencyId) {
      const defaultCurrency = currencies.find((c: any) => c.code === "USD") || currencies[0];
      setFormData(prev => ({ ...prev, currencyId: defaultCurrency.id }));
    }
  }, [currencies, formData.currencyId]);

  const createQuote = trpc.sales.createQuote.useMutation({
    onSuccess: (data) => {
      toast({ title: "Quote created", description: `Quote ${data.quoteNumber} has been created.` });
      router.push(`/sales/quotes/${data.id}`);
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

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLineQuantity = (index: number, quantity: number) => {
    const updatedLines = [...lines];
    updatedLines[index].quantity = quantity;
    updatedLines[index].amount = quantity * updatedLines[index].unitPrice;
    setLines(updatedLines);
  };

  const updateLinePrice = (index: number, unitPrice: number) => {
    const updatedLines = [...lines];
    updatedLines[index].unitPrice = unitPrice;
    updatedLines[index].amount = updatedLines[index].quantity * unitPrice;
    setLines(updatedLines);
  };

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      toast({ title: "Error", description: "Please select a customer", variant: "destructive" });
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
    createQuote.mutate({
      customerId: formData.customerId,
      currencyId: formData.currencyId,
      quoteDate: new Date(formData.quoteDate),
      expirationDate: new Date(formData.expirationDate),
      terms: formData.terms || undefined,
      memo: formData.memo || undefined,
      lines: lines.map((line) => ({
        itemId: line.itemId,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Sales", href: "/sales" },
          { label: "Quotes", href: "/sales/quotes" },
          { label: "New Quote" },
        ]}
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          New Quote
        </h1>
        <p className="text-muted-foreground mt-1">Create a new sales quote</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer & Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={formData.customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersData?.customers?.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select value={formData.currencyId} onValueChange={(v) => setFormData({ ...formData, currencyId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency: any) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quoteDate">Quote Date</Label>
                    <Input
                      id="quoteDate"
                      type="date"
                      value={formData.quoteDate}
                      onChange={(e) => setFormData({ ...formData, quoteDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Line Form */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Item</Label>
                    <Select value={newLine.itemId} onValueChange={(v) => setNewLine({ ...newLine, itemId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemsData?.items?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ${Number(item.basePrice).toFixed(2)}
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
                {lines.length > 0 && (
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
                      {lines.map((line, index) => (
                        <TableRow key={index}>
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
                              onChange={(e) => updateLineQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateLinePrice(index, parseFloat(e.target.value) || 0)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            ${line.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeLine(index)}
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {lines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="material-symbols-outlined text-[48px] mb-2">list</span>
                    <p>No items added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms & Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Payment terms, conditions, etc."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo</Label>
                  <Textarea
                    id="memo"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="Internal notes or customer message"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lines.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Quote"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
