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

const payslips = [
  {
    id: "pay-1",
    payPeriod: "Oct 1-15, 2023",
    payDate: "Oct 20, 2023",
    employee: "Alex Morgan",
    employeeId: "EMP-1024",
    grossPay: 5576.92,
    deductions: 1564.52,
    netPay: 4012.40,
    status: "paid",
  },
  {
    id: "pay-2",
    payPeriod: "Oct 1-15, 2023",
    payDate: "Oct 20, 2023",
    employee: "John Doe",
    employeeId: "EMP-1025",
    grossPay: 5192.31,
    deductions: 1456.85,
    netPay: 3735.46,
    status: "paid",
  },
  {
    id: "pay-3",
    payPeriod: "Oct 1-15, 2023",
    payDate: "Oct 20, 2023",
    employee: "Emily Davis",
    employeeId: "EMP-1033",
    grossPay: 2884.62,
    deductions: 808.49,
    netPay: 2076.13,
    status: "paid",
  },
  {
    id: "pay-4",
    payPeriod: "Oct 1-15, 2023",
    payDate: "Oct 20, 2023",
    employee: "Sarah Jenkins",
    employeeId: "EMP-1018",
    grossPay: 3653.85,
    deductions: 1023.08,
    netPay: 2630.77,
    status: "paid",
  },
  {
    id: "pay-5",
    payPeriod: "Oct 16-31, 2023",
    payDate: "Nov 5, 2023",
    employee: "Alex Morgan",
    employeeId: "EMP-1024",
    grossPay: 5576.92,
    deductions: 1564.52,
    netPay: 4012.40,
    status: "pending",
  },
  {
    id: "pay-6",
    payPeriod: "Oct 16-31, 2023",
    payDate: "Nov 5, 2023",
    employee: "John Doe",
    employeeId: "EMP-1025",
    grossPay: 5192.31,
    deductions: 1456.85,
    netPay: 3735.46,
    status: "pending",
  },
];

const periodOptions = [
  { value: "all", label: "All Periods" },
  { value: "oct-1-15", label: "Oct 1-15, 2023" },
  { value: "oct-16-31", label: "Oct 16-31, 2023" },
  { value: "sep-16-30", label: "Sep 16-30, 2023" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "void", label: "Void" },
];

export default function PayslipsPage() {
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayslips = payslips.filter((p) => {
    const matchesSearch =
      p.employee.toLowerCase().includes(search.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalGross = payslips.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = payslips.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.netPay, 0);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Payslips" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Payslips
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage employee payslips and run payroll.
          </p>
        </div>
        <Button className="bg-primary hover:bg-blue-600">
          <span className="material-symbols-outlined text-[18px] mr-2">payments</span>
          Run Payroll
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{payslips.length}</div>
            <p className="text-xs text-muted-foreground">Total Payslips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {payslips.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">
              ${(totalGross / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Total Gross (Paid)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(totalNet / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Total Net (Paid)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">All Payslips</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Pay Period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">EMPLOYEE</TableHead>
                <TableHead className="font-bold">PAY PERIOD</TableHead>
                <TableHead className="font-bold">PAY DATE</TableHead>
                <TableHead className="font-bold text-right">GROSS PAY</TableHead>
                <TableHead className="font-bold text-right">DEDUCTIONS</TableHead>
                <TableHead className="font-bold text-right">NET PAY</TableHead>
                <TableHead className="font-bold">STATUS</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <div>
                      <Link
                        href={`/payroll/employees/${payslip.employeeId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {payslip.employee}
                      </Link>
                      <p className="text-xs text-muted-foreground">{payslip.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{payslip.payPeriod}</TableCell>
                  <TableCell className="text-muted-foreground">{payslip.payDate}</TableCell>
                  <TableCell className="text-right">
                    ${payslip.grossPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -${payslip.deductions.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ${payslip.netPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        payslip.status === "paid"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }
                    >
                      {payslip.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="material-symbols-outlined text-[18px]">download</span>
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
