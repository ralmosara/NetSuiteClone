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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
      Inactive
    </Badge>
  );
};

export default function BOMPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBOMId, setSelectedBOMId] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.manufacturing.getBOMs.useQuery({
    search: search || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const boms = data?.boms || [];
  const total = data?.total || 0;

  // Get selected BOM details
  const { data: selectedBOM } = trpc.manufacturing.getBOMById.useQuery(
    { id: selectedBOMId as string },
    { enabled: !!selectedBOMId }
  );

  // Auto-select first BOM if none selected
  if (!selectedBOMId && boms.length > 0 && !isLoading) {
    setSelectedBOMId(boms[0].id);
  }

  const activeBOMs = boms.filter((b) => b.isActive).length;
  const totalComponents = boms.reduce((sum, b) => sum + (b.components?.length || 0), 0);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading BOMs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Manufacturing", href: "/manufacturing" },
          { label: "Bill of Materials" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bill of Materials
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage product assembly structures and component lists.
          </p>
        </div>
        <Link href="/manufacturing/bom/new">
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            New BOM
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{total}</div>
            )}
            <p className="text-xs text-muted-foreground">Total BOMs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{activeBOMs}</div>
            )}
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-slate-600">{totalComponents}</div>
            )}
            <p className="text-xs text-muted-foreground">Total Components</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{total - activeBOMs}</div>
            )}
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BOM List */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">All BOMs</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <Input
                    placeholder="Search BOMs..."
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : boms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "No BOMs found matching your filters."
                  : "No BOMs yet. Create your first BOM to get started."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">BOM ID</TableHead>
                    <TableHead className="font-bold">NAME</TableHead>
                    <TableHead className="font-bold">REV</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boms.map((bom) => (
                    <TableRow
                      key={bom.id}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                        selectedBOMId === bom.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                      onClick={() => setSelectedBOMId(bom.id)}
                    >
                      <TableCell>
                        <span className="font-medium text-primary">{bom.bomId}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{bom.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {bom.components?.length || 0} components
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{bom.revision}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(bom.isActive)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* BOM Details */}
        <Card>
          <CardHeader className="border-b">
            {selectedBOM ? (
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedBOM.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedBOM.bomId} • Rev {selectedBOM.revision}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/manufacturing/bom/${selectedBOM.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <CardTitle className="text-lg">BOM Details</CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {!selectedBOM ? (
              <div className="p-8 text-center text-muted-foreground">
                <span className="material-symbols-outlined text-[48px] mb-2">inventory_2</span>
                <p>Select a BOM to view its components</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-6 text-sm flex-wrap">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedBOM.isActive)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Components:</span>
                      <span className="ml-2 font-medium">{selectedBOM.components?.length || 0}</span>
                    </div>
                    {selectedBOM.effectiveDate && (
                      <div>
                        <span className="text-muted-foreground">Effective:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedBOM.effectiveDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedBOM.components && selectedBOM.components.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-bold w-12">#</TableHead>
                        <TableHead className="font-bold">COMPONENT</TableHead>
                        <TableHead className="font-bold text-right">QTY</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBOM.components.map((component: any, index: number) => (
                        <TableRow key={component.id}>
                          <TableCell className="text-muted-foreground">
                            {component.lineNumber || index + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <Link
                                href={`/inventory/items/${component.item?.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {component.item?.name || "Unknown Item"}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {component.item?.itemId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {component.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>No components in this BOM</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
