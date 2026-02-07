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

const currencies = [
  {
    id: "cur-1",
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1.0,
    isBase: true,
    isActive: true,
    lastUpdated: "Oct 24, 2023",
  },
  {
    id: "cur-2",
    code: "EUR",
    name: "Euro",
    symbol: "€",
    exchangeRate: 0.92,
    isBase: false,
    isActive: true,
    lastUpdated: "Oct 24, 2023",
  },
  {
    id: "cur-3",
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    exchangeRate: 0.81,
    isBase: false,
    isActive: true,
    lastUpdated: "Oct 24, 2023",
  },
  {
    id: "cur-4",
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    exchangeRate: 149.50,
    isBase: false,
    isActive: true,
    lastUpdated: "Oct 24, 2023",
  },
  {
    id: "cur-5",
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    exchangeRate: 1.36,
    isBase: false,
    isActive: true,
    lastUpdated: "Oct 24, 2023",
  },
  {
    id: "cur-6",
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    exchangeRate: 1.55,
    isBase: false,
    isActive: false,
    lastUpdated: "Oct 20, 2023",
  },
];

export default function CurrencyPage() {
  const [search, setSearch] = useState("");

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Currency" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Currency Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage currencies and exchange rates for multi-currency transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">sync</span>
            Update Rates
          </Button>
          <Button className="bg-primary hover:bg-blue-600">
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Add Currency
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{currencies.length}</div>
            <p className="text-xs text-muted-foreground">Total Currencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {currencies.filter((c) => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">USD</div>
            <p className="text-xs text-muted-foreground">Base Currency</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">Oct 24</div>
            <p className="text-xs text-muted-foreground">Last Rate Update</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Exchange Rates</CardTitle>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <Input
                placeholder="Search currencies..."
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
                <TableHead className="font-bold">SYMBOL</TableHead>
                <TableHead className="font-bold text-right">EXCHANGE RATE</TableHead>
                <TableHead className="font-bold">LAST UPDATED</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCurrencies.map((currency) => (
                <TableRow key={currency.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{currency.code}</span>
                      {currency.isBase && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          Base
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell className="text-lg">{currency.symbol}</TableCell>
                  <TableCell className="text-right font-mono">
                    {currency.exchangeRate.toFixed(currency.exchangeRate < 10 ? 4 : 2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{currency.lastUpdated}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        currency.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }
                    >
                      {currency.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">history</span>
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
