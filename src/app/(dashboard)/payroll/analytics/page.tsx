"use client";

import { useState } from "react";
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

const departmentStats = [
  { department: "Engineering", headcount: 45, avgSalary: 125000, totalPayroll: 5625000, turnover: 8.5, openRoles: 5 },
  { department: "Sales", headcount: 32, avgSalary: 85000, totalPayroll: 2720000, turnover: 12.3, openRoles: 8 },
  { department: "Marketing", headcount: 18, avgSalary: 78000, totalPayroll: 1404000, turnover: 6.2, openRoles: 2 },
  { department: "Finance", headcount: 12, avgSalary: 95000, totalPayroll: 1140000, turnover: 4.1, openRoles: 1 },
  { department: "HR", headcount: 8, avgSalary: 72000, totalPayroll: 576000, turnover: 5.0, openRoles: 0 },
  { department: "Operations", headcount: 25, avgSalary: 65000, totalPayroll: 1625000, turnover: 15.2, openRoles: 4 },
];

const monthlyPayrollData = [
  { month: "Jan", grossPay: 985000, deductions: 275800, netPay: 709200 },
  { month: "Feb", grossPay: 992000, deductions: 277760, netPay: 714240 },
  { month: "Mar", grossPay: 1015000, deductions: 284200, netPay: 730800 },
  { month: "Apr", grossPay: 1025000, deductions: 287000, netPay: 738000 },
  { month: "May", grossPay: 1032000, deductions: 288960, netPay: 743040 },
  { month: "Jun", grossPay: 1045000, deductions: 292600, netPay: 752400 },
  { month: "Jul", grossPay: 1058000, deductions: 296240, netPay: 761760 },
  { month: "Aug", grossPay: 1072000, deductions: 300160, netPay: 771840 },
  { month: "Sep", grossPay: 1085000, deductions: 303800, netPay: 781200 },
  { month: "Oct", grossPay: 1090000, deductions: 305200, netPay: 784800 },
];

const headcountTrend = [
  { month: "Jan", active: 132, new: 5, terminated: 3 },
  { month: "Feb", active: 134, new: 4, terminated: 2 },
  { month: "Mar", active: 136, new: 6, terminated: 4 },
  { month: "Apr", active: 138, new: 5, terminated: 3 },
  { month: "May", active: 139, new: 4, terminated: 3 },
  { month: "Jun", active: 140, new: 3, terminated: 2 },
  { month: "Jul", active: 138, new: 2, terminated: 4 },
  { month: "Aug", active: 139, new: 5, terminated: 4 },
  { month: "Sep", active: 140, new: 4, terminated: 3 },
  { month: "Oct", active: 140, new: 3, terminated: 3 },
];

const topEarners = [
  { name: "Michael Chen", title: "VP of Engineering", department: "Engineering", salary: 245000 },
  { name: "Sarah Williams", title: "Chief Financial Officer", department: "Finance", salary: 220000 },
  { name: "James Rodriguez", title: "VP of Sales", department: "Sales", salary: 195000 },
  { name: "Emily Johnson", title: "Director of Product", department: "Engineering", salary: 175000 },
  { name: "David Kim", title: "Senior Architect", department: "Engineering", salary: 168000 },
];

export default function PayrollAnalyticsPage() {
  const [period, setPeriod] = useState("2023");
  const [subsidiary, setSubsidiary] = useState("all");

  const totalHeadcount = departmentStats.reduce((sum, d) => sum + d.headcount, 0);
  const totalPayroll = departmentStats.reduce((sum, d) => sum + d.totalPayroll, 0);
  const avgSalary = totalPayroll / totalHeadcount;
  const avgTurnover = departmentStats.reduce((sum, d) => sum + d.turnover, 0) / departmentStats.length;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Analytics" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workforce Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive payroll and workforce insights.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subsidiary</label>
              <Select value={subsidiary} onValueChange={setSubsidiary}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subsidiaries</SelectItem>
                  <SelectItem value="us">US Headquarters</SelectItem>
                  <SelectItem value="uk">UK Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">group</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{totalHeadcount}</div>
                <p className="text-xs text-muted-foreground">Total Headcount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[24px]">payments</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalPayroll / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">Annual Payroll</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">trending_up</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  ${Math.round(avgSalary / 1000)}K
                </div>
                <p className="text-xs text-muted-foreground">Avg. Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">swap_horiz</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {avgTurnover.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Avg. Turnover</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">DEPARTMENT</TableHead>
                  <TableHead className="font-bold text-right">HEADCOUNT</TableHead>
                  <TableHead className="font-bold text-right">AVG SALARY</TableHead>
                  <TableHead className="font-bold text-right">TURNOVER</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentStats.map((dept) => (
                  <TableRow key={dept.department}>
                    <TableCell className="font-medium">{dept.department}</TableCell>
                    <TableCell className="text-right">{dept.headcount}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${(dept.avgSalary / 1000).toFixed(0)}K
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={dept.turnover > 10 ? "text-red-600 font-medium" : ""}>
                        {dept.turnover}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Earners */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Top Earners</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">EMPLOYEE</TableHead>
                  <TableHead className="font-bold">DEPARTMENT</TableHead>
                  <TableHead className="font-bold text-right">SALARY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEarners.map((emp, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{emp.department}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${emp.salary.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Payroll Trend */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Monthly Payroll Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">MONTH</TableHead>
                <TableHead className="font-bold text-right">GROSS PAY</TableHead>
                <TableHead className="font-bold text-right">DEDUCTIONS</TableHead>
                <TableHead className="font-bold text-right">NET PAY</TableHead>
                <TableHead className="font-bold text-right">HEADCOUNT</TableHead>
                <TableHead className="font-bold text-center">NEW HIRES</TableHead>
                <TableHead className="font-bold text-center">TERMINATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyPayrollData.map((month, idx) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">{month.month} 2023</TableCell>
                  <TableCell className="text-right font-mono">
                    ${(month.grossPay / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    -${(month.deductions / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    ${(month.netPay / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="text-right">
                    {headcountTrend[idx]?.active || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      +{headcountTrend[idx]?.new || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      -{headcountTrend[idx]?.terminated || 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Open Positions by Department</CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {departmentStats.reduce((sum, d) => sum + d.openRoles, 0)} Total Open
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departmentStats.map((dept) => (
              <div
                key={dept.department}
                className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800/30"
              >
                <div className="text-2xl font-bold text-primary">{dept.openRoles}</div>
                <p className="text-sm text-muted-foreground">{dept.department}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
