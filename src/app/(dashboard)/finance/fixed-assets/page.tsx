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

const fixedAssets = [
  {
    id: "fa-1",
    assetId: "FA-0001",
    name: "Dell Server Rack",
    assetType: "Equipment",
    purchaseDate: "Jan 15, 2022",
    purchasePrice: 45000,
    accumulatedDepreciation: 13500,
    netBookValue: 31500,
    usefulLife: 60,
    depreciationMethod: "Straight Line",
    status: "active",
  },
  {
    id: "fa-2",
    assetId: "FA-0002",
    name: "Company Vehicle - Ford Transit",
    assetType: "Vehicle",
    purchaseDate: "Mar 20, 2021",
    purchasePrice: 35000,
    accumulatedDepreciation: 17500,
    netBookValue: 17500,
    usefulLife: 60,
    depreciationMethod: "Straight Line",
    status: "active",
  },
  {
    id: "fa-3",
    assetId: "FA-0003",
    name: "Office Furniture Set",
    assetType: "Furniture",
    purchaseDate: "Jun 1, 2020",
    purchasePrice: 12000,
    accumulatedDepreciation: 8400,
    netBookValue: 3600,
    usefulLife: 84,
    depreciationMethod: "Straight Line",
    status: "active",
  },
  {
    id: "fa-4",
    assetId: "FA-0004",
    name: "CNC Milling Machine",
    assetType: "Machinery",
    purchaseDate: "Sep 10, 2022",
    purchasePrice: 125000,
    accumulatedDepreciation: 25000,
    netBookValue: 100000,
    usefulLife: 120,
    depreciationMethod: "Straight Line",
    status: "active",
  },
  {
    id: "fa-5",
    assetId: "FA-0005",
    name: "HP Laptop Fleet (10 units)",
    assetType: "Equipment",
    purchaseDate: "Feb 28, 2023",
    purchasePrice: 15000,
    accumulatedDepreciation: 2500,
    netBookValue: 12500,
    usefulLife: 36,
    depreciationMethod: "Straight Line",
    status: "active",
  },
  {
    id: "fa-6",
    assetId: "FA-0006",
    name: "Old Printer System",
    assetType: "Equipment",
    purchaseDate: "Apr 5, 2018",
    purchasePrice: 8000,
    accumulatedDepreciation: 8000,
    netBookValue: 0,
    usefulLife: 60,
    depreciationMethod: "Straight Line",
    status: "fully_depreciated",
  },
  {
    id: "fa-7",
    assetId: "FA-0007",
    name: "Warehouse Building",
    assetType: "Building",
    purchaseDate: "Jul 1, 2015",
    purchasePrice: 850000,
    accumulatedDepreciation: 170000,
    netBookValue: 680000,
    usefulLife: 480,
    depreciationMethod: "Straight Line",
    status: "active",
  },
];

const assetTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "Equipment", label: "Equipment" },
  { value: "Vehicle", label: "Vehicle" },
  { value: "Furniture", label: "Furniture" },
  { value: "Machinery", label: "Machinery" },
  { value: "Building", label: "Building" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "fully_depreciated", label: "Fully Depreciated" },
  { value: "disposed", label: "Disposed" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
    fully_depreciated: { label: "Fully Depreciated", className: "bg-slate-100 text-slate-800 border-slate-200" },
    disposed: { label: "Disposed", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.active;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getAssetTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    Equipment: "computer",
    Vehicle: "local_shipping",
    Furniture: "chair",
    Machinery: "precision_manufacturing",
    Building: "apartment",
  };
  return icons[type] || "category";
};

export default function FixedAssetsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssets = fixedAssets.filter((a) => {
    const matchesSearch =
      a.assetId.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || a.assetType === typeFilter;
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPurchasePrice = fixedAssets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalAccumDepreciation = fixedAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalNetBookValue = fixedAssets.reduce((sum, a) => sum + a.netBookValue, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Fixed Assets" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Fixed Assets
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage company assets and track depreciation.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/depreciation">
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">trending_down</span>
              Run Depreciation
            </Button>
          </Link>
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{fixedAssets.length}</div>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${(totalPurchasePrice / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Original Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              ${(totalAccumDepreciation / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Accum. Depreciation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(totalNetBookValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Net Book Value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Asset Register</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
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
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">ASSET ID</TableHead>
                <TableHead className="font-bold">NAME</TableHead>
                <TableHead className="font-bold">TYPE</TableHead>
                <TableHead className="font-bold">PURCHASE DATE</TableHead>
                <TableHead className="font-bold text-right">COST</TableHead>
                <TableHead className="font-bold text-right">ACCUM. DEPR.</TableHead>
                <TableHead className="font-bold text-right">NBV</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <Link href={`/finance/fixed-assets/${asset.id}`} className="font-medium text-primary hover:underline">
                      {asset.assetId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-muted-foreground text-[20px]">
                        {getAssetTypeIcon(asset.assetType)}
                      </span>
                      <span className="font-medium">{asset.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.assetType}</TableCell>
                  <TableCell className="text-muted-foreground">{asset.purchaseDate}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${asset.purchasePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-amber-600">
                    ${asset.accumulatedDepreciation.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${asset.netBookValue.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}