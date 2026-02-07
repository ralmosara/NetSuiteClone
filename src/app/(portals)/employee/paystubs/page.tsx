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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const paystubs = [
  {
    id: "ps-1",
    payPeriod: "Oct 16 - Oct 31, 2023",
    payDate: "Nov 3, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
  {
    id: "ps-2",
    payPeriod: "Oct 1 - Oct 15, 2023",
    payDate: "Oct 20, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
  {
    id: "ps-3",
    payPeriod: "Sep 16 - Sep 30, 2023",
    payDate: "Oct 6, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
  {
    id: "ps-4",
    payPeriod: "Sep 1 - Sep 15, 2023",
    payDate: "Sep 22, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
  {
    id: "ps-5",
    payPeriod: "Aug 16 - Aug 31, 2023",
    payDate: "Sep 8, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
  {
    id: "ps-6",
    payPeriod: "Aug 1 - Aug 15, 2023",
    payDate: "Aug 25, 2023",
    grossPay: 5833.33,
    deductions: 1458.33,
    netPay: 4375.00,
    status: "paid",
  },
];

const paystubDetails = {
  earnings: [
    { description: "Regular Salary", hours: 80, rate: 72.92, amount: 5833.33 },
  ],
  deductions: [
    { description: "Federal Income Tax", amount: 729.17 },
    { description: "State Income Tax", amount: 291.67 },
    { description: "Social Security", amount: 291.67 },
    { description: "Medicare", amount: 72.92 },
    { description: "401(k) Contribution", amount: 72.92 },
  ],
  ytdTotals: {
    grossPay: 58333.33,
    federalTax: 7291.67,
    stateTax: 2916.67,
    socialSecurity: 2916.67,
    medicare: 729.17,
    retirement: 729.17,
    netPay: 43750.00,
  },
};

const yearOptions = [
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
];

export default function EmployeePayStubsPage() {
  const [year, setYear] = useState("2023");
  const [selectedPaystub, setSelectedPaystub] = useState<typeof paystubs[0] | null>(null);

  const ytdGross = paystubs.reduce((sum, ps) => sum + ps.grossPay, 0);
  const ytdNet = paystubs.reduce((sum, ps) => sum + ps.netPay, 0);
  const ytdDeductions = paystubs.reduce((sum, ps) => sum + ps.deductions, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Pay Stubs
          </h1>
          <p className="text-muted-foreground mt-1">
            View and download your pay statements.
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>
            Download All
          </Button>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              ${(ytdGross / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">YTD Gross Pay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ${(ytdDeductions / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">YTD Deductions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              ${(ytdNet / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">YTD Net Pay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">{paystubs.length}</div>
            <p className="text-xs text-muted-foreground">Pay Periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Pay Stub Preview */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Latest Pay Stub</CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">Direct Deposit</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Pay Period</p>
                  <p className="font-medium">{paystubs[0].payPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Date</p>
                  <p className="font-medium">{paystubs[0].payDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Earnings</h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Description</TableHead>
                          <TableHead className="font-bold text-center">Hours</TableHead>
                          <TableHead className="font-bold text-right">Rate</TableHead>
                          <TableHead className="font-bold text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paystubDetails.earnings.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-center">{item.hours}</TableCell>
                            <TableCell className="text-right font-mono">
                              ${item.rate.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              ${item.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-100 dark:bg-slate-700">
                          <TableCell colSpan={3} className="font-bold">Gross Pay</TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            ${paystubs[0].grossPay.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Deductions</h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold">Description</TableHead>
                          <TableHead className="font-bold text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paystubDetails.deductions.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right font-mono text-red-600">
                              -${item.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-slate-100 dark:bg-slate-700">
                          <TableCell className="font-bold">Total Deductions</TableCell>
                          <TableCell className="text-right font-mono font-bold text-red-600">
                            -${paystubs[0].deductions.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="bg-primary text-white">
                <CardContent className="pt-6 text-center">
                  <p className="text-blue-200 text-sm">Net Pay</p>
                  <p className="text-4xl font-bold my-2">
                    ${paystubs[0].netPay.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-sm">Deposited to ****4521</p>
                  <Button variant="secondary" className="w-full mt-4">
                    <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold mb-3">YTD Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Pay</span>
                    <span className="font-mono">${paystubDetails.ytdTotals.grossPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Federal Tax</span>
                    <span className="font-mono text-red-600">-${paystubDetails.ytdTotals.federalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State Tax</span>
                    <span className="font-mono text-red-600">-${paystubDetails.ytdTotals.stateTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Security</span>
                    <span className="font-mono text-red-600">-${paystubDetails.ytdTotals.socialSecurity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicare</span>
                    <span className="font-mono text-red-600">-${paystubDetails.ytdTotals.medicare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">401(k)</span>
                    <span className="font-mono text-red-600">-${paystubDetails.ytdTotals.retirement.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Net Pay</span>
                    <span className="font-mono text-green-600">${paystubDetails.ytdTotals.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pay Stub History */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Pay Stub History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-bold">PAY PERIOD</TableHead>
                <TableHead className="font-bold">PAY DATE</TableHead>
                <TableHead className="font-bold text-right">GROSS PAY</TableHead>
                <TableHead className="font-bold text-right">DEDUCTIONS</TableHead>
                <TableHead className="font-bold text-right">NET PAY</TableHead>
                <TableHead className="font-bold text-center">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paystubs.map((stub) => (
                <TableRow key={stub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-medium">{stub.payPeriod}</TableCell>
                  <TableCell className="text-muted-foreground">{stub.payDate}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${stub.grossPay.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-600">
                    -${stub.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-green-600">
                    ${stub.netPay.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedPaystub(stub)}
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Pay Stub - {stub.payPeriod}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Pay Period</p>
                                <p className="font-medium">{stub.payPeriod}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Pay Date</p>
                                <p className="font-medium">{stub.payDate}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Gross Pay</p>
                                <p className="text-xl font-bold">${stub.grossPay.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Deductions</p>
                                <p className="text-xl font-bold text-red-600">-${stub.deductions.toLocaleString()}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Net Pay</p>
                                <p className="text-xl font-bold text-green-600">${stub.netPay.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button className="bg-primary hover:bg-blue-600">
                                <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                                Download PDF
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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

      {/* Direct Deposit Info */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Direct Deposit Settings</CardTitle>
            <Button variant="ghost" size="sm">
              <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">account_balance</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">Chase Checking ****4521</p>
              <p className="text-sm text-muted-foreground">100% of net pay deposited</p>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
