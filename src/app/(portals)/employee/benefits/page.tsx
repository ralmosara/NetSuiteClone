"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const healthBenefits = {
  medical: {
    plan: "Premium PPO",
    carrier: "Blue Cross Blue Shield",
    coverage: "Employee + Family",
    deductible: 2000,
    deductibleMet: 1250,
    outOfPocketMax: 6000,
    outOfPocketMet: 2100,
    monthlyCost: 450,
    companyContribution: 850,
  },
  dental: {
    plan: "Dental Plus",
    carrier: "Delta Dental",
    coverage: "Employee + Family",
    annualMax: 2500,
    used: 800,
    monthlyCost: 45,
    companyContribution: 75,
  },
  vision: {
    plan: "Vision Basic",
    carrier: "VSP",
    coverage: "Employee + Family",
    lastExam: "Mar 15, 2023",
    allowance: 200,
    used: 150,
    monthlyCost: 15,
    companyContribution: 25,
  },
};

const retirement = {
  plan401k: {
    balance: 85420.50,
    ytdContribution: 12500,
    employeeRate: 8,
    employerMatch: 4,
    vestedPercent: 100,
    investments: [
      { fund: "S&P 500 Index", allocation: 60, balance: 51252.30 },
      { fund: "Bond Index Fund", allocation: 25, balance: 21355.13 },
      { fund: "International Fund", allocation: 15, balance: 12813.08 },
    ],
  },
};

const lifeInsurance = {
  basic: {
    coverage: 150000,
    premium: 0,
    beneficiary: "Jane Morgan (Spouse)",
  },
  supplemental: {
    coverage: 300000,
    premium: 45,
    beneficiary: "Jane Morgan (Spouse)",
  },
  ad_d: {
    coverage: 150000,
    premium: 8,
    beneficiary: "Jane Morgan (Spouse)",
  },
};

const dependents = [
  { name: "Jane Morgan", relationship: "Spouse", dob: "May 12, 1988", covered: true },
  { name: "Emma Morgan", relationship: "Child", dob: "Aug 3, 2015", covered: true },
  { name: "Lucas Morgan", relationship: "Child", dob: "Jan 20, 2018", covered: true },
];

const recentClaims = [
  { id: "clm-1", date: "Oct 15, 2023", provider: "City Medical Center", type: "Medical", amount: 350, status: "paid" },
  { id: "clm-2", date: "Oct 5, 2023", provider: "Family Dentistry", type: "Dental", amount: 180, status: "paid" },
  { id: "clm-3", date: "Sep 20, 2023", provider: "Vision Care Plus", type: "Vision", amount: 150, status: "paid" },
  { id: "clm-4", date: "Sep 10, 2023", provider: "City Medical Center", type: "Medical", amount: 125, status: "processing" },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
    processing: { label: "Processing", className: "bg-amber-100 text-amber-800 border-amber-200" },
    denied: { label: "Denied", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.processing;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function EmployeeBenefitsPage() {
  const [activeTab, setActiveTab] = useState("health");

  const deductiblePercent = (healthBenefits.medical.deductibleMet / healthBenefits.medical.deductible) * 100;
  const oopPercent = (healthBenefits.medical.outOfPocketMet / healthBenefits.medical.outOfPocketMax) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Benefits
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your employee benefits.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>
            Benefits Summary
          </Button>
          <Button variant="outline">
            <span className="material-symbols-outlined text-[18px] mr-2">contact_support</span>
            Get Help
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">favorite</span>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">Active</div>
                <p className="text-xs text-muted-foreground">Health Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[20px]">savings</span>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  ${(retirement.plan401k.balance / 1000).toFixed(1)}K
                </div>
                <p className="text-xs text-muted-foreground">401(k) Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-[20px]">shield</span>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">$450K</div>
                <p className="text-xs text-muted-foreground">Life Insurance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">family_restroom</span>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{dependents.length}</div>
                <p className="text-xs text-muted-foreground">Dependents Covered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="retirement">Retirement</TabsTrigger>
          <TabsTrigger value="life">Life Insurance</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6 mt-6">
          {/* Medical */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">medical_services</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Medical Insurance</CardTitle>
                    <p className="text-sm text-muted-foreground">{healthBenefits.medical.carrier}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">{healthBenefits.medical.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage Level</span>
                    <span className="font-medium">{healthBenefits.medical.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Monthly Cost</span>
                    <span className="font-medium">${healthBenefits.medical.monthlyCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Contribution</span>
                    <span className="font-medium text-green-600">${healthBenefits.medical.companyContribution}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Deductible</span>
                      <span className="font-medium">
                        ${healthBenefits.medical.deductibleMet} / ${healthBenefits.medical.deductible}
                      </span>
                    </div>
                    <Progress value={deductiblePercent} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Out-of-Pocket Max</span>
                      <span className="font-medium">
                        ${healthBenefits.medical.outOfPocketMet} / ${healthBenefits.medical.outOfPocketMax}
                      </span>
                    </div>
                    <Progress value={oopPercent} className="h-2" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">badge</span>
                  View ID Card
                </Button>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">description</span>
                  Plan Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dental & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-purple-600">dentistry</span>
                    <CardTitle className="text-base">Dental Insurance</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span>{healthBenefits.dental.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier</span>
                    <span>{healthBenefits.dental.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Max</span>
                    <span>
                      ${healthBenefits.dental.used} / ${healthBenefits.dental.annualMax}
                    </span>
                  </div>
                  <Progress
                    value={(healthBenefits.dental.used / healthBenefits.dental.annualMax) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600">visibility</span>
                    <CardTitle className="text-base">Vision Insurance</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span>{healthBenefits.vision.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier</span>
                    <span>{healthBenefits.vision.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frame Allowance</span>
                    <span>
                      ${healthBenefits.vision.used} / ${healthBenefits.vision.allowance}
                    </span>
                  </div>
                  <Progress
                    value={(healthBenefits.vision.used / healthBenefits.vision.allowance) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dependents */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Covered Dependents</CardTitle>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dependents.map((dep, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500">person</span>
                    </div>
                    <div>
                      <p className="font-medium">{dep.name}</p>
                      <p className="text-xs text-muted-foreground">{dep.relationship}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retirement" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">savings</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">401(k) Plan</CardTitle>
                    <p className="text-sm text-muted-foreground">Fidelity Investments</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {retirement.plan401k.vestedPercent}% Vested
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-primary text-white">
                  <CardContent className="pt-6 text-center">
                    <p className="text-blue-200 text-sm">Total Balance</p>
                    <p className="text-4xl font-bold my-2">
                      ${retirement.plan401k.balance.toLocaleString()}
                    </p>
                    <p className="text-blue-200 text-sm">
                      YTD: ${retirement.plan401k.ytdContribution.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-sm text-muted-foreground">Your Contribution</p>
                    <p className="text-2xl font-bold">{retirement.plan401k.employeeRate}%</p>
                    <p className="text-xs text-muted-foreground">of gross pay</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10">
                    <p className="text-sm text-muted-foreground">Employer Match</p>
                    <p className="text-2xl font-bold text-green-600">{retirement.plan401k.employerMatch}%</p>
                    <p className="text-xs text-muted-foreground">of gross pay</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Investment Allocation</h4>
                  <div className="space-y-3">
                    {retirement.plan401k.investments.map((inv, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{inv.fund}</span>
                          <span className="font-medium">{inv.allocation}%</span>
                        </div>
                        <Progress value={inv.allocation} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          ${inv.balance.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">tune</span>
                  Change Contribution
                </Button>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">pie_chart</span>
                  Manage Investments
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="life" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Basic Life Insurance</CardTitle>
                  <Badge variant="secondary">Company Paid</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-primary">
                    ${(lifeInsurance.basic.coverage / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-muted-foreground">Coverage Amount</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Premium</span>
                    <span className="font-medium text-green-600">$0 (Employer Paid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiary</span>
                    <span>{lifeInsurance.basic.beneficiary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Supplemental Life</CardTitle>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-purple-600">
                    ${(lifeInsurance.supplemental.coverage / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-muted-foreground">Coverage Amount</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Premium</span>
                    <span className="font-medium">${lifeInsurance.supplemental.premium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiary</span>
                    <span>{lifeInsurance.supplemental.beneficiary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">AD&D Insurance</CardTitle>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-amber-600">
                    ${(lifeInsurance.ad_d.coverage / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-muted-foreground">Coverage Amount</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Premium</span>
                    <span className="font-medium">${lifeInsurance.ad_d.premium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiary</span>
                    <span>{lifeInsurance.ad_d.beneficiary}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Beneficiaries</CardTitle>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">edit</span>
                  Update Beneficiaries
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Jane Morgan</p>
                  <p className="text-sm text-muted-foreground">Spouse - Primary Beneficiary (100%)</p>
                </div>
                <Badge variant="secondary">Primary</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Claims</CardTitle>
                <Button variant="outline" size="sm">
                  <span className="material-symbols-outlined text-[16px] mr-1">filter_list</span>
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="font-bold">DATE</TableHead>
                    <TableHead className="font-bold">PROVIDER</TableHead>
                    <TableHead className="font-bold">TYPE</TableHead>
                    <TableHead className="font-bold text-right">AMOUNT</TableHead>
                    <TableHead className="font-bold">STATUS</TableHead>
                    <TableHead className="font-bold text-center">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentClaims.map((claim) => (
                    <TableRow key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <TableCell className="text-muted-foreground">{claim.date}</TableCell>
                      <TableCell className="font-medium">{claim.provider}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{claim.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">${claim.amount}</TableCell>
                      <TableCell>{getStatusBadge(claim.status)}</TableCell>
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

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-400">
                    Need to File a Claim?
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Most claims are filed automatically by your provider. If you need to submit a claim
                    manually, visit your insurance carrier's website or contact HR for assistance.
                  </p>
                  <div className="flex gap-3 mt-3">
                    <Button variant="outline" size="sm" className="border-blue-300">
                      BCBS Portal
                    </Button>
                    <Button variant="outline" size="sm" className="border-blue-300">
                      Delta Dental Portal
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
