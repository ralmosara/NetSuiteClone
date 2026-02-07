"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const timeOffBalances = [
  { type: "Vacation", balance: 12, used: 8, accrued: 20, icon: "beach_access", color: "blue" },
  { type: "Sick Leave", balance: 6, used: 4, accrued: 10, icon: "medical_services", color: "red" },
  { type: "Personal", balance: 2, used: 1, accrued: 3, icon: "person", color: "purple" },
  { type: "Floating Holiday", balance: 1, used: 1, accrued: 2, icon: "celebration", color: "amber" },
];

const requests = [
  {
    id: "pto-1",
    type: "Vacation",
    startDate: "Nov 20, 2023",
    endDate: "Nov 24, 2023",
    days: 5,
    status: "approved",
    submittedDate: "Oct 15, 2023",
    approvedBy: "Sarah Johnson",
    notes: "Thanksgiving holiday",
  },
  {
    id: "pto-2",
    type: "Sick Leave",
    startDate: "Oct 10, 2023",
    endDate: "Oct 10, 2023",
    days: 1,
    status: "approved",
    submittedDate: "Oct 10, 2023",
    approvedBy: "Sarah Johnson",
    notes: "Not feeling well",
  },
  {
    id: "pto-3",
    type: "Vacation",
    startDate: "Dec 25, 2023",
    endDate: "Dec 29, 2023",
    days: 5,
    status: "pending",
    submittedDate: "Nov 1, 2023",
    notes: "Christmas vacation",
  },
  {
    id: "pto-4",
    type: "Personal",
    startDate: "Sep 15, 2023",
    endDate: "Sep 15, 2023",
    days: 1,
    status: "approved",
    submittedDate: "Sep 10, 2023",
    approvedBy: "Sarah Johnson",
    notes: "Personal appointment",
  },
  {
    id: "pto-5",
    type: "Vacation",
    startDate: "Jul 3, 2023",
    endDate: "Jul 7, 2023",
    days: 5,
    status: "approved",
    submittedDate: "Jun 1, 2023",
    approvedBy: "Sarah Johnson",
    notes: "4th of July week",
  },
];

const holidays = [
  { name: "Thanksgiving Day", date: "Nov 23, 2023" },
  { name: "Day After Thanksgiving", date: "Nov 24, 2023" },
  { name: "Christmas Eve", date: "Dec 24, 2023" },
  { name: "Christmas Day", date: "Dec 25, 2023" },
  { name: "New Year's Day", date: "Jan 1, 2024" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
    cancelled: { label: "Cancelled", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getTypeBadge = (type: string) => {
  const config: Record<string, { className: string }> = {
    Vacation: { className: "bg-blue-100 text-blue-800 border-blue-200" },
    "Sick Leave": { className: "bg-red-100 text-red-800 border-red-200" },
    Personal: { className: "bg-purple-100 text-purple-800 border-purple-200" },
    "Floating Holiday": { className: "bg-amber-100 text-amber-800 border-amber-200" },
  };
  const { className } = config[type] || config.Vacation;
  return <Badge variant="outline" className={className}>{type}</Badge>;
};

export default function EmployeeTimeOffPage() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRequests = requests.filter(
    (req) => statusFilter === "all" || req.status === statusFilter
  );

  const totalAvailable = timeOffBalances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Time Off
          </h1>
          <p className="text-muted-foreground mt-1">
            Request and manage your time off.
          </p>
        </div>
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-600">
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="type">Time Off Type</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOffBalances.map((balance) => (
                      <SelectItem key={balance.type} value={balance.type}>
                        <div className="flex items-center justify-between w-full">
                          <span>{balance.type}</span>
                          <span className="text-muted-foreground ml-4">
                            ({balance.balance} days available)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for your manager..."
                  rows={3}
                />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days Requested</span>
                  <span className="font-bold">0 days</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Remaining Balance After</span>
                  <span className="font-bold text-green-600">
                    {requestType
                      ? timeOffBalances.find((b) => b.type === requestType)?.balance || 0
                      : 0}{" "}
                    days
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRequestOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-blue-600">
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {timeOffBalances.map((balance) => {
          const percentage = (balance.used / balance.accrued) * 100;
          const colorClasses: Record<string, string> = {
            blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
            red: "text-red-600 bg-red-100 dark:bg-red-900/30",
            purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
            amber: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
          };
          const progressColors: Record<string, string> = {
            blue: "bg-blue-600",
            red: "bg-red-600",
            purple: "bg-purple-600",
            amber: "bg-amber-600",
          };
          return (
            <Card key={balance.type}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${colorClasses[balance.color]}`}
                  >
                    <span className={`material-symbols-outlined text-${balance.color}-600`}>
                      {balance.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{balance.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {balance.used} used of {balance.accrued}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{balance.balance}</span>
                    <span className="text-sm text-muted-foreground">days available</span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    // Custom color styling
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-primary text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">calendar_today</span>
              </div>
              <div>
                <p className="text-blue-200">Total Available Time Off</p>
                <p className="text-4xl font-bold">{totalAvailable} Days</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-blue-200 text-sm">Next Holiday</p>
              <p className="font-semibold">{holidays[0].name}</p>
              <p className="text-sm text-blue-200">{holidays[0].date}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg">My Requests</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold">DATES</TableHead>
                    <TableHead className="font-bold text-center">DAYS</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <TableCell>{getTypeBadge(request.type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.startDate}</p>
                          {request.startDate !== request.endDate && (
                            <p className="text-xs text-muted-foreground">to {request.endDate}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">{request.days}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Button>
                          {request.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Holidays */}
        <div>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Company Holidays</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-green-600 text-[20px]">
                        celebration
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-sm text-muted-foreground">{holiday.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Request Alert */}
          {requests.some((r) => r.status === "pending") && (
            <Card className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600">pending</span>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-400">
                      Pending Request
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      You have a time off request awaiting approval. Your manager will review it soon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
