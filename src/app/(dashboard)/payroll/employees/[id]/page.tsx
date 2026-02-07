"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number | string | null | undefined) {
  if (amount == null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "on_leave":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">On Leave</Badge>;
    case "terminated":
      return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Terminated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTimeOffStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    case "pending":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getPayslipStatusBadge(status: string) {
  switch (status) {
    case "paid":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
    case "draft":
      return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Draft</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatEmploymentType(type: string) {
  const map: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
    intern: "Intern",
  };
  return map[type] || type;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [timeOffOpen, setTimeOffOpen] = useState(false);

  const { data: employee, isLoading, error } = trpc.employees.getEmployee.useQuery({ id });
  const { data: departments } = trpc.employees.getDepartments.useQuery();

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Employees", href: "/payroll/employees" },
          { label: "Error" },
        ]} />
        <div className="p-8 text-center">
          <span className="material-symbols-outlined text-[48px] text-red-400 mb-4">error</span>
          <p className="text-red-500 text-lg">
            {error.data?.code === "NOT_FOUND" ? "Employee not found" : "Error loading employee"}
          </p>
          <p className="text-muted-foreground mt-1">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/payroll/employees")}>
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !employee) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Employees", href: "/payroll/employees" },
          { label: "Loading..." },
        ]} />
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const salary = employee.salary ? parseFloat(employee.salary.toString()) : 0;
  const yearsOfService = Math.max(0,
    new Date().getFullYear() - new Date(employee.hireDate).getFullYear()
  );
  const address = [employee.address1, employee.address2, employee.city, employee.state, employee.postalCode, employee.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Payroll", href: "/payroll" },
          { label: "Employees", href: "/payroll/employees" },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-white text-xl font-bold">
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {employee.firstName} {employee.lastName}
              </h1>
              {getStatusBadge(employee.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {employee.employeeId} {employee.jobTitle ? `• ${employee.jobTitle}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {employee.department?.name ?? "No Department"} {yearsOfService > 0 ? `• ${yearsOfService} years` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                Edit
              </Button>
            </DialogTrigger>
            <EditEmployeeDialog
              employee={employee}
              departments={departments || []}
              onClose={() => setEditOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {salary > 0 ? formatCurrency(salary) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {employee.salaryFrequency ? `${employee.salaryFrequency.charAt(0).toUpperCase() + employee.salaryFrequency.slice(1)} Salary` : "Salary"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {employee.timeOffRequests?.filter((r: any) => r.status === "approved").length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Approved Time Off</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {employee.payslips?.length ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Pay Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-600">{yearsOfService}</div>
            <p className="text-xs text-muted-foreground">Years of Service</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="compensation"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Compensation
          </TabsTrigger>
          <TabsTrigger
            value="timeoff"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Time Off
          </TabsTrigger>
          <TabsTrigger
            value="benefits"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            Benefits
          </TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Full Name</p>
                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Date of Birth</p>
                    <p className="font-medium">{formatDate(employee.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Phone</p>
                    <p className="font-medium">{employee.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Gender</p>
                    <p className="font-medium">{employee.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Marital Status</p>
                    <p className="font-medium">{employee.maritalStatus || "—"}</p>
                  </div>
                </div>
                {address && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Address</p>
                    <p className="font-medium">{address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Department</p>
                    <p className="font-medium">{employee.department?.name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Job Title</p>
                    <p className="font-medium">{employee.jobTitle || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Employment Type</p>
                    <p className="font-medium">{formatEmploymentType(employee.employmentType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Hire Date</p>
                    <p className="font-medium">{formatDate(employee.hireDate)}</p>
                  </div>
                  {employee.subsidiary && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Subsidiary</p>
                      <p className="font-medium">{employee.subsidiary.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">Reports To</p>
                    {employee.supervisor ? (
                      <Link
                        href={`/payroll/employees/${employee.supervisor.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {employee.supervisor.firstName} {employee.supervisor.lastName}
                      </Link>
                    ) : (
                      <p className="font-medium">—</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {employee.emergencyContactName ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Name</p>
                      <p className="font-medium">{employee.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Relationship</p>
                      <p className="font-medium">{employee.emergencyContactRelation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Phone</p>
                      <p className="font-medium">{employee.emergencyContactPhone || "—"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No emergency contact on file.</p>
                )}
              </CardContent>
            </Card>

            {/* Direct Reports */}
            {employee.directReports && employee.directReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Direct Reports ({employee.directReports.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {employee.directReports.map((report: any) => (
                      <div key={report.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                            {report.firstName[0]}{report.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/payroll/employees/${report.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {report.firstName} {report.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{report.jobTitle || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ─── Compensation Tab ─── */}
        <TabsContent value="compensation" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Salary Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    {employee.salaryFrequency ? `${employee.salaryFrequency.charAt(0).toUpperCase() + employee.salaryFrequency.slice(1)} Salary` : "Salary"}
                  </p>
                  <p className="text-2xl font-bold">{salary > 0 ? formatCurrency(salary) : "—"}</p>
                </div>
                {salary > 0 && employee.salaryFrequency === "annual" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Monthly</p>
                      <p className="font-medium">{formatCurrency(salary / 12)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Per Pay Period (Bi-Weekly)</p>
                      <p className="font-medium">{formatCurrency(salary / 26)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Pay History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {employee.payslips && employee.payslips.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="font-bold">PAY PERIOD</TableHead>
                        <TableHead className="font-bold text-right">GROSS</TableHead>
                        <TableHead className="font-bold text-right">NET</TableHead>
                        <TableHead className="font-bold">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.payslips.map((pay: any) => (
                        <TableRow key={pay.id}>
                          <TableCell className="font-medium">
                            {formatDate(pay.payPeriodStart)} – {formatDate(pay.payPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(pay.grossPay)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(pay.netPay)}</TableCell>
                          <TableCell>{getPayslipStatusBadge(pay.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No pay records yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Time Off Tab ─── */}
        <TabsContent value="timeoff" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Time Off Requests</CardTitle>
              <Dialog open={timeOffOpen} onOpenChange={setTimeOffOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                    Request Time Off
                  </Button>
                </DialogTrigger>
                <TimeOffRequestDialog
                  employeeId={employee.id}
                  onClose={() => setTimeOffOpen(false)}
                />
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              {employee.timeOffRequests && employee.timeOffRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">TYPE</TableHead>
                      <TableHead className="font-bold">START DATE</TableHead>
                      <TableHead className="font-bold">END DATE</TableHead>
                      <TableHead className="font-bold text-center">DAYS</TableHead>
                      <TableHead className="font-bold">STATUS</TableHead>
                      <TableHead className="font-bold">REASON</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.timeOffRequests.map((req: any) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium capitalize">{req.requestType}</TableCell>
                        <TableCell>{formatDate(req.startDate)}</TableCell>
                        <TableCell>{formatDate(req.endDate)}</TableCell>
                        <TableCell className="text-center">{parseFloat(req.totalDays?.toString() || "0")}</TableCell>
                        <TableCell>{getTimeOffStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {req.reason || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No time off requests yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Benefits Tab ─── */}
        <TabsContent value="benefits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Benefits</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {employee.benefits && employee.benefits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold">BENEFIT TYPE</TableHead>
                      <TableHead className="font-bold">PLAN NAME</TableHead>
                      <TableHead className="font-bold text-right">EMPLOYEE</TableHead>
                      <TableHead className="font-bold text-right">EMPLOYER</TableHead>
                      <TableHead className="font-bold">EFFECTIVE DATE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employee.benefits.map((benefit: any) => (
                      <TableRow key={benefit.id}>
                        <TableCell className="font-medium capitalize">{benefit.benefitType}</TableCell>
                        <TableCell>{benefit.planName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(benefit.employeeContribution)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(benefit.employerContribution)}</TableCell>
                        <TableCell>{formatDate(benefit.effectiveDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No benefits enrolled.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Edit Employee Dialog ─── */

function EditEmployeeDialog({
  employee,
  departments,
  onClose,
}: {
  employee: any;
  departments: any[];
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.employees.updateEmployee.useMutation({
    onSuccess: () => {
      utils.employees.getEmployee.invalidate({ id: employee.id });
      utils.employees.getEmployees.invalidate();
      utils.employees.getDashboardStats.invalidate();
      onClose();
    },
  });

  const [form, setForm] = useState({
    firstName: employee.firstName || "",
    lastName: employee.lastName || "",
    email: employee.email || "",
    phone: employee.phone || "",
    jobTitle: employee.jobTitle || "",
    departmentId: employee.departmentId || "",
    employmentType: employee.employmentType || "full_time",
    status: employee.status || "active",
    salary: employee.salary ? parseFloat(employee.salary.toString()) : "",
    salaryFrequency: employee.salaryFrequency || "annual",
    address1: employee.address1 || "",
    city: employee.city || "",
    state: employee.state || "",
    postalCode: employee.postalCode || "",
    country: employee.country || "",
    emergencyContactName: employee.emergencyContactName || "",
    emergencyContactPhone: employee.emergencyContactPhone || "",
    emergencyContactRelation: employee.emergencyContactRelation || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate({
      id: employee.id,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      jobTitle: form.jobTitle.trim() || null,
      departmentId: form.departmentId || null,
      employmentType: form.employmentType,
      status: form.status,
      salary: form.salary ? Number(form.salary) : null,
      salaryFrequency: form.salaryFrequency || null,
      address1: form.address1.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      postalCode: form.postalCode.trim() || null,
      country: form.country.trim() || null,
      emergencyContactName: form.emergencyContactName.trim() || null,
      emergencyContactPhone: form.emergencyContactPhone.trim() || null,
      emergencyContactRelation: form.emergencyContactRelation.trim() || null,
    });
  }

  function updateField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Employee</DialogTitle>
        <DialogDescription>
          Update {employee.firstName} {employee.lastName}&apos;s information.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name *</Label>
              <Input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last Name *</Label>
              <Input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Employment Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Job Title</Label>
              <Input value={form.jobTitle} onChange={(e) => updateField("jobTitle", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.departmentId} onValueChange={(v) => updateField("departmentId", v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employment Type</Label>
              <Select value={form.employmentType} onValueChange={(v) => updateField("employmentType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full-Time</SelectItem>
                  <SelectItem value="part_time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Compensation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Salary</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.salary}
                onChange={(e) => updateField("salary", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={form.salaryFrequency} onValueChange={(v) => updateField("salaryFrequency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Street Address</Label>
              <Input value={form.address1} onChange={(e) => updateField("address1", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => updateField("state", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Postal Code</Label>
              <Input value={form.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.emergencyContactName} onChange={(e) => updateField("emergencyContactName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.emergencyContactPhone} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Relationship</Label>
              <Input value={form.emergencyContactRelation} onChange={(e) => updateField("emergencyContactRelation", e.target.value)} />
            </div>
          </div>
        </div>

        {updateMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{updateMutation.error.message}</p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

/* ─── Time Off Request Dialog ─── */

function TimeOffRequestDialog({
  employeeId,
  onClose,
}: {
  employeeId: string;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const createMutation = trpc.employees.createTimeOffRequest.useMutation({
    onSuccess: () => {
      utils.employees.getEmployee.invalidate({ id: employeeId });
      onClose();
    },
  });

  const [form, setForm] = useState({
    requestType: "vacation",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.startDate) errs.startDate = "Start date is required";
    if (!form.endDate) errs.endDate = "End date is required";
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = "End date must be after start date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate({
      employeeId,
      requestType: form.requestType,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      reason: form.reason.trim() || undefined,
    });
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Request Time Off</DialogTitle>
        <DialogDescription>Submit a new time off request.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Request Type</Label>
          <Select value={form.requestType} onValueChange={(v) => setForm((p) => ({ ...p, requestType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="bereavement">Bereavement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            />
            {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>End Date *</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            />
            {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Reason</Label>
          <Input
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            placeholder="Optional reason for time off"
          />
        </div>

        {createMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{createMutation.error.message}</p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
