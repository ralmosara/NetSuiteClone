"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";

const inspections = [
  {
    id: "qci-1",
    inspectionNumber: "QCI-0050",
    workOrderNumber: "WO-58291",
    workOrderId: "wo-1",
    product: "Desktop Computer - Standard Config",
    inspectionDate: "Oct 24, 2023",
    inspector: "Sarah Lee",
    unitsInspected: 20,
    unitsPassed: 19,
    unitsFailed: 1,
    status: "completed",
    result: "passed",
  },
  {
    id: "qci-2",
    inspectionNumber: "QCI-0049",
    workOrderNumber: "WO-58290",
    workOrderId: "wo-2",
    product: "Server Rack Unit",
    inspectionDate: "Oct 23, 2023",
    inspector: "Mike Chen",
    unitsInspected: 5,
    unitsPassed: 5,
    unitsFailed: 0,
    status: "completed",
    result: "passed",
  },
  {
    id: "qci-3",
    inspectionNumber: "QCI-0048",
    workOrderNumber: "WO-58289",
    workOrderId: "wo-3",
    product: "Workstation Pro Bundle",
    inspectionDate: "Oct 22, 2023",
    inspector: "Sarah Lee",
    unitsInspected: 15,
    unitsPassed: 12,
    unitsFailed: 3,
    status: "completed",
    result: "failed",
  },
  {
    id: "qci-4",
    inspectionNumber: "QCI-0047",
    workOrderNumber: "WO-58291",
    workOrderId: "wo-1",
    product: "Desktop Computer - Standard Config",
    inspectionDate: "Oct 20, 2023",
    inspector: "Sarah Lee",
    unitsInspected: 17,
    unitsPassed: 17,
    unitsFailed: 0,
    status: "completed",
    result: "passed",
  },
  {
    id: "qci-5",
    inspectionNumber: "QCI-0046",
    workOrderNumber: "WO-58288",
    workOrderId: "wo-4",
    product: "Network Switch Assembly",
    inspectionDate: "Oct 19, 2023",
    inspector: "Mike Chen",
    unitsInspected: 25,
    unitsPassed: 24,
    unitsFailed: 1,
    status: "completed",
    result: "passed",
  },
  {
    id: "qci-6",
    inspectionNumber: "QCI-0051",
    workOrderNumber: "WO-58292",
    workOrderId: "wo-5",
    product: "Laptop Repair Kit",
    inspectionDate: "Oct 25, 2023",
    inspector: "Sarah Lee",
    unitsInspected: 0,
    unitsPassed: 0,
    unitsFailed: 0,
    status: "pending",
    result: null,
  },
];

const checklistTemplate = [
  { id: 1, parameter: "Visual Inspection", specification: "No visible defects", category: "Appearance" },
  { id: 2, parameter: "Dimensional Check", specification: "Within ±0.5mm tolerance", category: "Measurements" },
  { id: 3, parameter: "Weight Verification", specification: "Within ±50g of spec", category: "Measurements" },
  { id: 4, parameter: "Power-On Test", specification: "System boots successfully", category: "Functional" },
  { id: 5, parameter: "Component Seating", specification: "All components secure", category: "Assembly" },
  { id: 6, parameter: "Cable Management", specification: "Cables properly routed", category: "Assembly" },
  { id: 7, parameter: "Thermal Test", specification: "Temp < 70°C under load", category: "Performance" },
  { id: 8, parameter: "Stress Test", specification: "No errors after 30min", category: "Performance" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const resultOptions = [
  { value: "all", label: "All Results" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-800 border-blue-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getResultBadge = (result: string | null) => {
  if (!result) return null;
  const config: Record<string, { label: string; className: string }> = {
    passed: { label: "Passed", className: "bg-green-100 text-green-800 border-green-200" },
    failed: { label: "Failed", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[result] || config.passed;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function QCInspectionPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      i.inspectionNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.workOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.product.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    const matchesResult = resultFilter === "all" || i.result === resultFilter;
    return matchesSearch && matchesStatus && matchesResult;
  });

  const totalInspected = inspections
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + i.unitsInspected, 0);
  const totalPassed = inspections
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + i.unitsPassed, 0);
  const totalFailed = inspections
    .filter((i) => i.status === "completed")
    .reduce((sum, i) => sum + i.unitsFailed, 0);
  const passRate = totalInspected > 0 ? ((totalPassed / totalInspected) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "QC Inspections" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Quality Control Inspections
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage product quality inspections and track defects.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Inspection
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{inspections.length}</div>
            <p className="text-xs text-muted-foreground">Total Inspections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">{totalInspected}</div>
            <p className="text-xs text-muted-foreground">Units Inspected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <p className="text-xs text-muted-foreground">Units Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">Units Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{passRate}%</div>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspections Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">All Inspections</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    {resultOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">INSPECTION #</TableHead>
                  <TableHead className="font-bold">WORK ORDER</TableHead>
                  <TableHead className="font-bold">DATE</TableHead>
                  <TableHead className="font-bold text-center">PASS/FAIL</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold">RESULT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((insp) => (
                  <TableRow key={insp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell>
                      <Link
                        href={`/manufacturing/qc-inspection/${insp.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {insp.inspectionNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Link
                          href={`/manufacturing/work-orders/${insp.workOrderId}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {insp.workOrderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {insp.product}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{insp.inspectionDate}</TableCell>
                    <TableCell className="text-center">
                      {insp.status === "completed" ? (
                        <span className="font-mono text-sm">
                          <span className="text-green-600">{insp.unitsPassed}</span>
                          {" / "}
                          <span className="text-red-600">{insp.unitsFailed}</span>
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(insp.status)}</TableCell>
                    <TableCell>{getResultBadge(insp.result)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Checklist Template */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Checklist Template</CardTitle>
              <Button variant="outline" size="sm">
                <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {checklistTemplate.map((item) => (
                <div key={item.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium">
                      {item.id}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{item.parameter}</p>
                      <p className="text-xs text-muted-foreground">{item.specification}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect Analysis */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Defect Analysis (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Visual Defects</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-red-600">12</span>
                <span className="text-xs text-muted-foreground mb-1">units</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "30%" }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Assembly Errors</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-amber-600">8</span>
                <span className="text-xs text-muted-foreground mb-1">units</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Functional Failures</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-orange-600">5</span>
                <span className="text-xs text-muted-foreground mb-1">units</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "12.5%" }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Component Issues</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-purple-600">3</span>
                <span className="text-xs text-muted-foreground mb-1">units</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: "7.5%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
