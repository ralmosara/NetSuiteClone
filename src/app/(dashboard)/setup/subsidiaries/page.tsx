"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const subsidiaries = [
  {
    id: "sub-1",
    code: "US-HQ",
    name: "US Headquarters",
    parent: null,
    currency: "USD",
    country: "United States",
    city: "San Francisco",
    employees: 85,
    isElimination: false,
    isActive: true,
  },
  {
    id: "sub-2",
    code: "UK-OPS",
    name: "UK Operations",
    parent: "US-HQ",
    currency: "GBP",
    country: "United Kingdom",
    city: "London",
    employees: 32,
    isElimination: false,
    isActive: true,
  },
  {
    id: "sub-3",
    code: "DE-GMBH",
    name: "Germany GmbH",
    parent: "US-HQ",
    currency: "EUR",
    country: "Germany",
    city: "Munich",
    employees: 18,
    isElimination: false,
    isActive: true,
  },
  {
    id: "sub-4",
    code: "FR-SARL",
    name: "France SARL",
    parent: "DE-GMBH",
    currency: "EUR",
    country: "France",
    city: "Paris",
    employees: 12,
    isElimination: false,
    isActive: true,
  },
  {
    id: "sub-5",
    code: "CA-INC",
    name: "Canada Inc",
    parent: "US-HQ",
    currency: "CAD",
    country: "Canada",
    city: "Toronto",
    employees: 24,
    isElimination: false,
    isActive: true,
  },
  {
    id: "sub-6",
    code: "AU-PTY",
    name: "Australia Pty Ltd",
    parent: "US-HQ",
    currency: "AUD",
    country: "Australia",
    city: "Sydney",
    employees: 8,
    isElimination: false,
    isActive: false,
  },
  {
    id: "sub-7",
    code: "ELIM",
    name: "Eliminations",
    parent: null,
    currency: "USD",
    country: "N/A",
    city: "N/A",
    employees: 0,
    isElimination: true,
    isActive: true,
  },
];

// Build hierarchy
const getHierarchy = () => {
  const roots = subsidiaries.filter((s) => !s.parent && !s.isElimination);
  const children: Record<string, typeof subsidiaries> = {};

  subsidiaries.forEach((sub) => {
    if (sub.parent) {
      if (!children[sub.parent]) children[sub.parent] = [];
      children[sub.parent].push(sub);
    }
  });

  return { roots, children };
};

interface SubsidiaryRowProps {
  subsidiary: (typeof subsidiaries)[0];
  level: number;
  children: Record<string, typeof subsidiaries>;
}

function SubsidiaryRow({ subsidiary, level, children }: SubsidiaryRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children[subsidiary.code]?.length > 0;

  return (
    <>
      <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="size-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {expanded ? "expand_more" : "chevron_right"}
                </span>
              </button>
            ) : (
              <span className="size-5" />
            )}
            <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {subsidiary.code}
            </span>
          </div>
        </TableCell>
        <TableCell className="font-medium">{subsidiary.name}</TableCell>
        <TableCell>
          <Badge variant="outline">{subsidiary.currency}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {subsidiary.country !== "N/A" ? `${subsidiary.city}, ${subsidiary.country}` : "-"}
        </TableCell>
        <TableCell className="text-right">{subsidiary.employees || "-"}</TableCell>
        <TableCell>
          {subsidiary.isElimination ? (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
              Elimination
            </Badge>
          ) : subsidiary.isActive ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
              Inactive
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex justify-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded &&
        children[subsidiary.code]?.map((child) => (
          <SubsidiaryRow
            key={child.id}
            subsidiary={child}
            level={level + 1}
            children={children}
          />
        ))}
    </>
  );
}

export default function SubsidiariesPage() {
  const [search, setSearch] = useState("");
  const { roots, children } = getHierarchy();

  const totalEmployees = subsidiaries.reduce((sum, s) => sum + s.employees, 0);
  const activeSubs = subsidiaries.filter((s) => s.isActive && !s.isElimination).length;
  const currencies = [...new Set(subsidiaries.filter((s) => !s.isElimination).map((s) => s.currency))];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Setup", href: "/setup" },
          { label: "Subsidiaries" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Subsidiaries
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage company subsidiaries and organizational hierarchy.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">add</span>
          New Subsidiary
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {subsidiaries.filter((s) => !s.isElimination).length}
            </div>
            <p className="text-xs text-muted-foreground">Total Subsidiaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeSubs}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">{currencies.length}</div>
            <p className="text-xs text-muted-foreground">Currencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchy View */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Organization Hierarchy</CardTitle>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search subsidiaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">CODE</TableHead>
                <TableHead className="font-bold">NAME</TableHead>
                <TableHead className="font-bold">CURRENCY</TableHead>
                <TableHead className="font-bold">LOCATION</TableHead>
                <TableHead className="font-bold text-right">EMPLOYEES</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roots.map((root) => (
                <SubsidiaryRow key={root.id} subsidiary={root} level={0} children={children} />
              ))}
              {/* Show elimination entity separately */}
              {subsidiaries
                .filter((s) => s.isElimination)
                .map((elim) => (
                  <SubsidiaryRow key={elim.id} subsidiary={elim} level={0} children={children} />
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Consolidation Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
              <div>
                <p className="font-medium">Base Currency</p>
                <p className="text-sm text-muted-foreground">Primary consolidation currency</p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">USD</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
              <div>
                <p className="font-medium">Consolidation Method</p>
                <p className="text-sm text-muted-foreground">How subsidiaries are consolidated</p>
              </div>
              <Badge variant="outline">Full Consolidation</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
              <div>
                <p className="font-medium">Elimination Entity</p>
                <p className="text-sm text-muted-foreground">Entity for intercompany eliminations</p>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">ELIM</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4">
                <span className="material-symbols-outlined text-[24px] mb-2">account_tree</span>
                <span>View Org Chart</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <span className="material-symbols-outlined text-[24px] mb-2">sync</span>
                <span>Sync Exchange Rates</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <span className="material-symbols-outlined text-[24px] mb-2">summarize</span>
                <span>Run Consolidation</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <span className="material-symbols-outlined text-[24px] mb-2">download</span>
                <span>Export Structure</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
