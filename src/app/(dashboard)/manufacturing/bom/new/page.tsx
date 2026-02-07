"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

interface ComponentLine {
  id: string;
  itemId: string;
  quantity: string;
}

export default function NewBOMPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    assemblyItemId: "",
    revision: "1.0",
    effectiveDate: "",
  });

  const [components, setComponents] = useState<ComponentLine[]>([
    { id: "1", itemId: "", quantity: "1" },
  ]);

  const { data: itemsData, isLoading: itemsLoading } = trpc.inventory.getItems.useQuery({
    limit: 500,
  });

  const items = itemsData?.items || [];

  const createBOM = trpc.manufacturing.createBOM.useMutation({
    onSuccess: (data) => {
      toast({
        title: "BOM created",
        description: `Bill of Materials ${data.bomId} has been created successfully.`,
      });
      router.push("/manufacturing/bom");
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({ title: "Error", description: "Please enter a BOM name", variant: "destructive" });
      return;
    }

    if (!formData.assemblyItemId) {
      toast({ title: "Error", description: "Please select an assembly item", variant: "destructive" });
      return;
    }

    const validComponents = components.filter(
      (c) => c.itemId && parseFloat(c.quantity) > 0
    );

    if (validComponents.length === 0) {
      toast({ title: "Error", description: "Please add at least one component", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    createBOM.mutate({
      name: formData.name,
      assemblyItemId: formData.assemblyItemId,
      revision: formData.revision || "1.0",
      effectiveDate: formData.effectiveDate ? new Date(formData.effectiveDate) : undefined,
      components: validComponents.map((c, index) => ({
        itemId: c.itemId,
        quantity: parseFloat(c.quantity),
        lineNumber: index + 1,
      })),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addComponent = () => {
    setComponents([
      ...components,
      { id: Date.now().toString(), itemId: "", quantity: "1" },
    ]);
  };

  const removeComponent = (id: string) => {
    if (components.length <= 1) {
      toast({ title: "Error", description: "At least one component is required", variant: "destructive" });
      return;
    }
    setComponents(components.filter((c) => c.id !== id));
  };

  const updateComponent = (id: string, field: keyof ComponentLine, value: string) => {
    setComponents(
      components.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Filter out the assembly item from component options to prevent circular reference
  const availableComponents = items.filter((item) => item.id !== formData.assemblyItemId);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Bill of Materials", href: "/manufacturing/bom" },
          { label: "New BOM" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Bill of Materials
          </h1>
          <p className="text-muted-foreground mt-1">Create a new product assembly structure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* BOM Details */}
          <Card>
            <CardHeader>
              <CardTitle>BOM Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">BOM Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Desktop Computer Assembly"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assemblyItemId">Assembly Item (Finished Product) *</Label>
                {itemsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.assemblyItemId}
                    onValueChange={(v) => handleChange("assemblyItemId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select the finished product" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No items available
                        </SelectItem>
                      ) : (
                        items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.itemId} - {item.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  The item that will be produced using this BOM
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revision">Revision</Label>
                  <Input
                    id="revision"
                    value={formData.revision}
                    onChange={(e) => handleChange("revision", e.target.value)}
                    placeholder="e.g., 1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleChange("effectiveDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {components.filter((c) => c.itemId).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Components</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-600">
                    {components.reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Quantity</p>
                </div>
              </div>

              {formData.assemblyItemId && (
                <div className="p-4 border rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Produces</p>
                  <p className="font-medium">
                    {items.find((i) => i.id === formData.assemblyItemId)?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {items.find((i) => i.id === formData.assemblyItemId)?.itemId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Components */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Components</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addComponent}>
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              Add Component
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold w-12">#</TableHead>
                    <TableHead className="font-bold">COMPONENT ITEM *</TableHead>
                    <TableHead className="font-bold w-32">QUANTITY *</TableHead>
                    <TableHead className="font-bold text-center w-20">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component, index) => (
                    <TableRow key={component.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        {itemsLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            value={component.itemId}
                            onValueChange={(v) => updateComponent(component.id, "itemId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select component" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableComponents.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.itemId} - {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={component.quantity}
                          onChange={(e) => updateComponent(component.id, "quantity", e.target.value)}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeComponent(component.id)}
                          >
                            <span className="material-symbols-outlined text-[18px] text-destructive">
                              delete
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-600"
            disabled={isSubmitting || !formData.name || !formData.assemblyItemId}
          >
            {isSubmitting ? "Creating..." : "Create BOM"}
          </Button>
        </div>
      </form>
    </div>
  );
}
