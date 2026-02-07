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
import { Separator } from "@/components/ui/separator";
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

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    planned: { label: "Planned", className: "bg-slate-100 text-slate-800 border-slate-200" },
    released: { label: "Released", className: "bg-purple-100 text-purple-800 border-purple-200" },
    in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.planned;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getPriorityBadge = (priority: string) => {
  const config: Record<string, { label: string; className: string }> = {
    low: { label: "Low", className: "bg-slate-100 text-slate-800 border-slate-200" },
    normal: { label: "Normal", className: "bg-blue-100 text-blue-800 border-blue-200" },
    high: { label: "High", className: "bg-amber-100 text-amber-800 border-amber-200" },
    urgent: { label: "Urgent", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[priority] || config.normal;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completedQty, setCompletedQty] = useState("");
  const [scrappedQty, setScrappedQty] = useState("");

  const { data: workOrder, isLoading, error } = trpc.manufacturing.getWorkOrderById.useQuery(
    { id: params.id as string },
    { enabled: !!params.id }
  );

  const utils = trpc.useUtils();

  const updateStatus = trpc.manufacturing.updateWorkOrderStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Work order updated", description: "Status has been updated successfully." });
      utils.manufacturing.getWorkOrderById.invalidate({ id: params.id as string });
      setCompleteDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
    },
  });

  const handleStatusChange = (newStatus: "planned" | "released" | "in_progress" | "completed" | "closed") => {
    if (newStatus === "in_progress" && workOrder?.status === "planned") {
      updateStatus.mutate({
        id: params.id as string,
        status: newStatus,
        actualStartDate: new Date(),
      });
    } else if (newStatus === "completed") {
      setCompleteDialogOpen(true);
    } else {
      updateStatus.mutate({ id: params.id as string, status: newStatus });
    }
  };

  const handleCompleteSubmit = () => {
    const completed = parseInt(completedQty) || 0;
    const scrapped = parseInt(scrappedQty) || 0;

    updateStatus.mutate({
      id: params.id as string,
      status: "completed",
      completedQuantity: (workOrder?.completedQuantity || 0) + completed,
      scrappedQuantity: (workOrder?.scrappedQuantity || 0) + scrapped,
      actualEndDate: new Date(),
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

  if (error || !workOrder) {
    return (
      <div className="p-8 text-center">
        <span className="material-symbols-outlined text-[64px] text-muted-foreground mb-4">error</span>
        <h2 className="text-xl font-semibold mb-2">Work Order Not Found</h2>
        <p className="text-muted-foreground mb-4">The work order you're looking for doesn't exist.</p>
        <Link href="/manufacturing/work-orders">
          <Button>Back to Work Orders</Button>
        </Link>
      </div>
    );
  }

  const completedQuantity = workOrder.completedQuantity || 0;
  const scrappedQuantity = workOrder.scrappedQuantity || 0;
  const plannedQuantity = workOrder.plannedQuantity || 1;
  const completionPercentage = Math.round((completedQuantity / plannedQuantity) * 100);
  const remaining = plannedQuantity - completedQuantity - scrappedQuantity;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Work Orders", href: "/manufacturing/work-orders" },
          { label: workOrder.workOrderNumber },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {workOrder.workOrderNumber}
            </h1>
            {getStatusBadge(workOrder.status)}
            {getPriorityBadge(workOrder.priority)}
          </div>
          <p className="text-muted-foreground mt-1">
            {workOrder.bom?.name || "Unknown Product"}
          </p>
          <p className="text-sm text-muted-foreground">
            Created {new Date(workOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">more_vert</span>
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {workOrder.status === "planned" && (
                <DropdownMenuItem onClick={() => handleStatusChange("released")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">send</span>
                  Release to Production
                </DropdownMenuItem>
              )}
              {(workOrder.status === "planned" || workOrder.status === "released") && (
                <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">play_arrow</span>
                  Start Production
                </DropdownMenuItem>
              )}
              {workOrder.status === "in_progress" && (
                <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">check_circle</span>
                  Complete Work Order
                </DropdownMenuItem>
              )}
              {workOrder.status === "completed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("closed")}>
                  <span className="material-symbols-outlined text-[18px] mr-2">lock</span>
                  Close Work Order
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="material-symbols-outlined text-[18px] mr-2">print</span>
                Print Work Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {workOrder.status === "in_progress" && (
            <Button
              className="bg-primary hover:bg-blue-600"
              onClick={() => setCompleteDialogOpen(true)}
            >
              <span className="material-symbols-outlined text-[18px] mr-2">check_circle</span>
              Record Completion
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Production Progress</span>
            <span className="font-bold text-primary">{completionPercentage}%</span>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{completedQuantity} completed</span>
            <span>{scrappedQuantity} scrapped</span>
            <span>{Math.max(remaining, 0)} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {plannedQuantity}
            </div>
            <p className="text-xs text-muted-foreground">Planned Qty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {completedQuantity}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {scrappedQuantity}
            </div>
            <p className="text-xs text-muted-foreground">Scrapped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {Math.max(remaining, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {workOrder.inspections?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">QC Inspections</p>
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
            value="components"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Components
          </TabsTrigger>
          <TabsTrigger
            value="inspections"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            QC Inspections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Bill of Materials</p>
                    <p className="font-medium">{workOrder.bom?.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">
                      {workOrder.bom?.bomId} Rev {workOrder.bom?.revision || "1.0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Priority</p>
                    <p className="font-medium capitalize">{workOrder.priority}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Status</p>
                    <div className="mt-1">{getStatusBadge(workOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Components</p>
                    <p className="font-medium">{workOrder.bom?.components?.length || 0} items</p>
                  </div>
                </div>
                {workOrder.memo && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Memo</p>
                      <p className="text-sm mt-1">{workOrder.memo}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Planned Start</p>
                    <p className="font-medium">
                      {workOrder.plannedStartDate
                        ? new Date(workOrder.plannedStartDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Planned End</p>
                    <p className="font-medium">
                      {workOrder.plannedEndDate
                        ? new Date(workOrder.plannedEndDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Actual Start</p>
                    <p className="font-medium">
                      {workOrder.actualStartDate
                        ? new Date(workOrder.actualStartDate).toLocaleDateString()
                        : "Not started"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Actual End</p>
                    <p className="font-medium">
                      {workOrder.actualEndDate
                        ? new Date(workOrder.actualEndDate).toLocaleDateString()
                        : "In progress"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Created</p>
                  <p className="font-medium">
                    {new Date(workOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {workOrder.bom?.components && workOrder.bom.components.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">#</TableHead>
                      <TableHead className="font-bold">COMPONENT</TableHead>
                      <TableHead className="font-bold text-right">QTY PER UNIT</TableHead>
                      <TableHead className="font-bold text-right">TOTAL REQUIRED</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrder.bom.components.map((comp: any, index: number) => (
                      <TableRow key={comp.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell>
                          <Link
                            href={`/inventory/items/${comp.item?.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {comp.item?.name || "Unknown Item"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{comp.item?.itemId}</p>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {comp.quantity}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {comp.quantity * plannedQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                  <p>No components defined in the BOM</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Quality Control Inspections</CardTitle>
              <Link href={`/manufacturing/qc-inspection?workOrderId=${workOrder.id}`}>
                <Button size="sm">
                  <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                  New Inspection
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {workOrder.inspections && workOrder.inspections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">INSPECTION #</TableHead>
                      <TableHead className="font-bold">DATE</TableHead>
                      <TableHead className="font-bold">INSPECTOR</TableHead>
                      <TableHead className="font-bold">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrder.inspections.map((insp: any) => (
                      <TableRow key={insp.id}>
                        <TableCell>
                          <Link
                            href={`/manufacturing/qc-inspection/${insp.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {insp.inspectionNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(insp.inspectionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{insp.inspectorName}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              insp.status === "passed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : insp.status === "failed"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : insp.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }
                          >
                            {insp.status.charAt(0).toUpperCase() + insp.status.slice(1).replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-[48px] mb-2">fact_check</span>
                  <p>No QC inspections recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete Units Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Production Completion</DialogTitle>
            <DialogDescription>
              Enter the number of units completed and any scrapped units.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completedQty">Completed Units</Label>
              <Input
                id="completedQty"
                type="number"
                min="0"
                max={remaining}
                value={completedQty}
                onChange={(e) => setCompletedQty(e.target.value)}
                placeholder="Enter completed quantity"
              />
              <p className="text-xs text-muted-foreground">
                {remaining} units remaining to be produced
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scrappedQty">Scrapped Units (Optional)</Label>
              <Input
                id="scrappedQty"
                type="number"
                min="0"
                value={scrappedQty}
                onChange={(e) => setScrappedQty(e.target.value)}
                placeholder="Enter scrapped quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSubmit}
              disabled={updateStatus.isPending || (!completedQty && !scrappedQty)}
            >
              {updateStatus.isPending ? "Saving..." : "Record Completion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
