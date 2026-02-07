"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const employeeInfo = {
  name: "Alex Morgan",
  employeeId: "EMP-1024",
  department: "Engineering",
  title: "Senior Software Engineer",
  manager: "Sarah Jenkins",
  hireDate: "Oct 24, 2019",
  email: "alex.morgan@company.com",
};

const timeOffBalance = {
  vacation: { available: 15, used: 5, pending: 2 },
  sick: { available: 8, used: 2, pending: 0 },
  personal: { available: 3, used: 1, pending: 0 },
};

const recentPaystubs = [
  { id: "ps-1", period: "Oct 1-15, 2023", payDate: "Oct 20, 2023", gross: 5576.92, net: 4012.40 },
  { id: "ps-2", period: "Sep 16-30, 2023", payDate: "Oct 5, 2023", gross: 5576.92, net: 4012.40 },
  { id: "ps-3", period: "Sep 1-15, 2023", payDate: "Sep 20, 2023", gross: 5576.92, net: 4012.40 },
];

const pendingRequests = [
  { id: "req-1", type: "Vacation", dates: "Dec 23-31, 2023", days: 5, status: "pending" },
];

const announcements = [
  {
    id: "ann-1",
    title: "Open Enrollment Deadline",
    content: "Benefits open enrollment closes November 15th. Review and update your elections.",
    date: "Oct 20, 2023",
    priority: "high",
  },
  {
    id: "ann-2",
    title: "Holiday Schedule",
    content: "The office will be closed November 23-24 for Thanksgiving.",
    date: "Oct 18, 2023",
    priority: "normal",
  },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function EmployeePortalPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-white text-xl font-bold">AM</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome, {employeeInfo.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              {employeeInfo.title} • {employeeInfo.department}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/employee/time-off/new">
            <Button>
              <span className="material-symbols-outlined text-[18px] mr-2">add</span>
              Request Time Off
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[24px]">beach_access</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{timeOffBalance.vacation.available}</div>
                <p className="text-xs text-muted-foreground">Vacation Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">medical_services</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{timeOffBalance.sick.available}</div>
                <p className="text-xs text-muted-foreground">Sick Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[24px]">pending_actions</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{pendingRequests.length}</div>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">payments</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">Oct 20</div>
                <p className="text-xs text-muted-foreground">Next Pay Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 divide-y">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  {announcement.priority === "high" && (
                    <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">priority_high</span>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">{announcement.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pay Stubs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg">Recent Pay Stubs</CardTitle>
            <Link href="/employee/paystubs">
              <Button variant="ghost" size="sm">
                View All
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-bold">PAY PERIOD</TableHead>
                  <TableHead className="font-bold text-right">GROSS</TableHead>
                  <TableHead className="font-bold text-right">NET</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPaystubs.map((stub) => (
                  <TableRow key={stub.id}>
                    <TableCell>
                      <Link href={`/employee/paystubs/${stub.id}`} className="font-medium text-primary hover:underline">
                        {stub.period}
                      </Link>
                      <p className="text-xs text-muted-foreground">Paid {stub.payDate}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      ${stub.gross.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${stub.net.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Time Off Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg">Time Off Balance</CardTitle>
            <Link href="/employee/time-off">
              <Button variant="ghost" size="sm">
                View All
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Vacation</span>
                <span className="text-sm text-muted-foreground">
                  {timeOffBalance.vacation.available} of {timeOffBalance.vacation.available + timeOffBalance.vacation.used} days
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${(timeOffBalance.vacation.available / (timeOffBalance.vacation.available + timeOffBalance.vacation.used)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Sick Leave</span>
                <span className="text-sm text-muted-foreground">
                  {timeOffBalance.sick.available} of {timeOffBalance.sick.available + timeOffBalance.sick.used} days
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(timeOffBalance.sick.available / (timeOffBalance.sick.available + timeOffBalance.sick.used)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Personal</span>
                <span className="text-sm text-muted-foreground">
                  {timeOffBalance.personal.available} of {timeOffBalance.personal.available + timeOffBalance.personal.used} days
                </span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${(timeOffBalance.personal.available / (timeOffBalance.personal.available + timeOffBalance.personal.used)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Pending Requests</h4>
                {pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                    <div>
                      <p className="font-medium">{req.type}</p>
                      <p className="text-sm text-muted-foreground">{req.dates} ({req.days} days)</p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/employee/time-off/new">
              <Button variant="outline" className="w-full h-auto flex-col py-6">
                <span className="material-symbols-outlined text-[28px] mb-2 text-primary">event_available</span>
                <span>Request Time Off</span>
              </Button>
            </Link>
            <Link href="/employee/paystubs">
              <Button variant="outline" className="w-full h-auto flex-col py-6">
                <span className="material-symbols-outlined text-[28px] mb-2 text-primary">receipt</span>
                <span>View Pay Stubs</span>
              </Button>
            </Link>
            <Link href="/employee/benefits">
              <Button variant="outline" className="w-full h-auto flex-col py-6">
                <span className="material-symbols-outlined text-[28px] mb-2 text-primary">health_and_safety</span>
                <span>View Benefits</span>
              </Button>
            </Link>
            <Link href="/employee/profile">
              <Button variant="outline" className="w-full h-auto flex-col py-6">
                <span className="material-symbols-outlined text-[28px] mb-2 text-primary">person</span>
                <span>Update Profile</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
