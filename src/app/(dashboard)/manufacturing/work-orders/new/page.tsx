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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function NewWorkOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bomId: "",
    plannedQuantity: "",
    plannedStartDate: "",
    plannedEndDate: "",
    priority: "normal",
    memo: "",
  });

  const { data: bomsData, isLoading: bomsLoading } = trpc.manufacturing.getBOMs.useQuery({
    isActive: true,
  });

  const boms = bomsData?.boms || [];

  const createWorkOrder = trpc.manufacturing.createWorkOrder.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Work order created",
        description: `Work order ${data.workOrderNumber} has been created successfully.`,
      });
      router.push(`/manufacturing/work-orders/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bomId) {
      toast({ title: "Error", description: "Please select a Bill of Materials", variant: "destructive" });
      return;
    }

    const plannedQuantity = parseInt(formData.plannedQuantity);
    if (!plannedQuantity || plannedQuantity < 1) {
      toast({ title: "Error", description: "Please enter a valid quantity (minimum 1)", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    createWorkOrder.mutate({
      bomId: formData.bomId,
      plannedQuantity,
      plannedStartDate: formData.plannedStartDate ? new Date(formData.plannedStartDate) : undefined,
      plannedEndDate: formData.plannedEndDate ? new Date(formData.plannedEndDate) : undefined,
      priority: formData.priority as "low" | "normal" | "high" | "urgent",
      memo: formData.memo || undefined,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedBom = boms.find((b) => b.id === formData.bomId);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Work Orders", href: "/manufacturing/work-orders" },
          { label: "New Work Order" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Work Order
          </h1>
          <p className="text-muted-foreground mt-1">Create a new production work order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Work Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Work Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bomId">Bill of Materials *</Label>
                {bomsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={formData.bomId}
                    onValueChange={(v) => handleChange("bomId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a BOM" />
                    </SelectTrigger>
                    <SelectContent>
                      {boms.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No BOMs available
                        </SelectItem>
                      ) : (
                        boms.map((bom) => (
                          <SelectItem key={bom.id} value={bom.id}>
                            {bom.bomId} - {bom.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {selectedBom && (
                  <p className="text-xs text-muted-foreground">
                    Revision {selectedBom.revision} • {selectedBom.components?.length || 0} components
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedQuantity">Planned Quantity *</Label>
                <Input
                  id="plannedQuantity"
                  type="number"
                  min="1"
                  value={formData.plannedQuantity}
                  onChange={(e) => handleChange("plannedQuantity", e.target.value)}
                  placeholder="Enter quantity to produce"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => handleChange("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => handleChange("memo", e.target.value)}
                  placeholder="Additional notes or instructions"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plannedStartDate">Planned Start Date</Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  value={formData.plannedStartDate}
                  onChange={(e) => handleChange("plannedStartDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedEndDate">Planned End Date</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={formData.plannedEndDate}
                  onChange={(e) => handleChange("plannedEndDate", e.target.value)}
                  min={formData.plannedStartDate}
                />
              </div>

              {selectedBom && selectedBom.components && selectedBom.components.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Components Required</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedBom.components.map((comp: any) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">{comp.item?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{comp.item?.itemId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {comp.quantity} x {formData.plannedQuantity || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            = {comp.quantity * (parseInt(formData.plannedQuantity) || 0)} units
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-600"
            disabled={isSubmitting || !formData.bomId || !formData.plannedQuantity}
          >
            {isSubmitting ? "Creating..." : "Create Work Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
