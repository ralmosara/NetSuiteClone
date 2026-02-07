"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";

const depreciationSchedule = [
  {
    id: "dep-1",
    assetId: "FA-0001",
    assetName: "Dell Server Rack",
    assetType: "Equipment",
    method: "Straight Line",
    monthlyAmount: 750,
    ytdDepreciation: 7500,
    remainingLife: 30,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
  {
    id: "dep-2",
    assetId: "FA-0002",
    assetName: "Company Vehicle - Ford Transit",
    assetType: "Vehicle",
    method: "Straight Line",
    monthlyAmount: 583.33,
    ytdDepreciation: 5833.30,
    remainingLife: 24,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
  {
    id: "dep-3",
    assetId: "FA-0003",
    assetName: "Office Furniture Set",
    assetType: "Furniture",
    method: "Straight Line",
    monthlyAmount: 142.86,
    ytdDepreciation: 1428.60,
    remainingLife: 18,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
  {
    id: "dep-4",
    assetId: "FA-0004",
    assetName: "CNC Milling Machine",
    assetType: "Machinery",
    method: "Straight Line",
    monthlyAmount: 1041.67,
    ytdDepreciation: 10416.70,
    remainingLife: 96,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
  {
    id: "dep-5",
    assetId: "FA-0005",
    assetName: "HP Laptop Fleet (10 units)",
    assetType: "Equipment",
    method: "Straight Line",
    monthlyAmount: 416.67,
    ytdDepreciation: 3333.36,
    remainingLife: 28,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
  {
    id: "dep-7",
    assetId: "FA-0007",
    assetName: "Warehouse Building",
    assetType: "Building",
    method: "Straight Line",
    monthlyAmount: 1770.83,
    ytdDepreciation: 17708.30,
    remainingLife: 380,
    lastRunDate: "Sep 30, 2023",
    selected: true,
  },
];

const depreciationHistory = [
  { period: "Sep 2023", totalAmount: 4705.36, assetsProcessed: 6, journalEntry: "JE-2023-0921", status: "posted" },
  { period: "Aug 2023", totalAmount: 4705.36, assetsProcessed: 6, journalEntry: "JE-2023-0831", status: "posted" },
  { period: "Jul 2023", totalAmount: 4705.36, assetsProcessed: 6, journalEntry: "JE-2023-0731", status: "posted" },
  { period: "Jun 2023", totalAmount: 4705.36, assetsProcessed: 6, journalEntry: "JE-2023-0630", status: "posted" },
  { period: "May 2023", totalAmount: 4288.69, assetsProcessed: 5, journalEntry: "JE-2023-0531", status: "posted" },
];

export default function DepreciationPage() {
  const [period, setPeriod] = useState("oct-2023");
  const [selectedAssets, setSelectedAssets] = useState<string[]>(
    depreciationSchedule.map((d) => d.id)
  );

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedAssets.length === depreciationSchedule.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(depreciationSchedule.map((d) => d.id));
    }
  };

  const selectedTotal = depreciationSchedule
    .filter((d) => selectedAssets.includes(d.id))
    .reduce((sum, d) => sum + d.monthlyAmount, 0);

  const totalMonthlyDepreciation = depreciationSchedule.reduce(
    (sum, d) => sum + d.monthlyAmount,
    0
  );

  const totalYTDDepreciation = depreciationSchedule.reduce(
    (sum, d) => sum + d.ytdDepreciation,
    0
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Depreciation" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Run Depreciation
          </h1>
          <p className="text-muted-foreground mt-1">
            Calculate and post monthly depreciation for fixed assets.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/fixed-assets">
            <Button variant="outline">
              <span className="material-symbols-outlined text-[18px] mr-2">inventory_2</span>
              View Assets
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {depreciationSchedule.length}
            </div>
            <p className="text-xs text-muted-foreground">Depreciable Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${totalMonthlyDepreciation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Monthly Depreciation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              ${(totalYTDDepreciation / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">YTD Depreciation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${selectedTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Selected for Run</p>
          </CardContent>
        </Card>
      </div>

      {/* Run Depreciation Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Depreciation Schedule</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select assets to include in the depreciation run
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="space-y-1">
                <label className="text-sm font-medium">Period</label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oct-2023">October 2023</SelectItem>
                    <SelectItem value="nov-2023">November 2023</SelectItem>
                    <SelectItem value="dec-2023">December 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-primary hover:bg-blue-600 mt-6">
                <span className="material-symbols-outlined text-[18px] mr-2">play_arrow</span>
                Run Depreciation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAssets.length === depreciationSchedule.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="font-bold">ASSET ID</TableHead>
                <TableHead className="font-bold">ASSET NAME</TableHead>
                <TableHead className="font-bold">TYPE</TableHead>
                <TableHead className="font-bold">METHOD</TableHead>
                <TableHead className="font-bold text-right">MONTHLY AMT</TableHead>
                <TableHead className="font-bold text-right">YTD DEPR.</TableHead>
                <TableHead className="font-bold text-right">REMAINING LIFE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationSchedule.map((item) => (
                <TableRow
                  key={item.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                    selectedAssets.includes(item.id) ? "" : "opacity-50"
                  }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedAssets.includes(item.id)}
                      onCheckedChange={() => toggleAsset(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/finance/fixed-assets/${item.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.assetId}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{item.assetName}</TableCell>
                  <TableCell className="text-muted-foreground">{item.assetType}</TableCell>
                  <TableCell className="text-muted-foreground">{item.method}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${item.monthlyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-amber-600">
                    ${item.ytdDepreciation.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.remainingLife} months
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-100 dark:bg-slate-800 font-bold">
                <TableCell colSpan={5} className="text-right">
                  Total Selected ({selectedAssets.length} assets)
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${selectedTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Depreciation History */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Depreciation History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">PERIOD</TableHead>
                <TableHead className="font-bold text-right">TOTAL AMOUNT</TableHead>
                <TableHead className="font-bold text-center">ASSETS PROCESSED</TableHead>
                <TableHead className="font-bold">JOURNAL ENTRY</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationHistory.map((entry, idx) => (
                <TableRow key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-medium">{entry.period}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${entry.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">{entry.assetsProcessed}</TableCell>
                  <TableCell>
                    <Link href="#" className="text-primary hover:underline">
                      {entry.journalEntry}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Posted
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">undo</span>
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
