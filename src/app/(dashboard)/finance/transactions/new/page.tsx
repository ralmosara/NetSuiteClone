"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/error-utils";

interface JournalLine {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  memo: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    memo: "",
  });

  const [lines, setLines] = useState<JournalLine[]>([
    { id: "1", accountId: "", debit: "", credit: "", memo: "" },
    { id: "2", accountId: "", debit: "", credit: "", memo: "" },
  ]);

  const { data: accounts } = trpc.finance.getAccounts.useQuery({});

  const createJournalEntry = trpc.finance.createJournalEntry.useMutation({
    onSuccess: (data) => {
      toast({ title: "Journal entry created", description: `Entry ${data.entryNumber} has been created successfully.` });
      router.push(`/finance/transactions/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: parseApiError(error), variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate lines
    const validLines = lines.filter(
      (line) => line.accountId && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );

    if (validLines.length < 2) {
      toast({ title: "Error", description: "At least two valid lines are required", variant: "destructive" });
      return;
    }

    const totalDebit = validLines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
    const totalCredit = validLines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast({ title: "Error", description: `Debits ($${totalDebit.toFixed(2)}) must equal Credits ($${totalCredit.toFixed(2)})`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    createJournalEntry.mutate({
      entryDate: new Date(formData.entryDate),
      memo: formData.memo || undefined,
      lines: validLines.map((line) => ({
        accountId: line.accountId,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        memo: line.memo || undefined,
      })),
    });
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), accountId: "", debit: "", credit: "", memo: "" }]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) {
      toast({ title: "Error", description: "At least two lines are required", variant: "destructive" });
      return;
    }
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLine, value: string) => {
    setLines(
      lines.map((line) => {
        if (line.id === id) {
          // If entering debit, clear credit and vice versa
          if (field === "debit" && value && parseFloat(value) > 0) {
            return { ...line, [field]: value, credit: "" };
          }
          if (field === "credit" && value && parseFloat(value) > 0) {
            return { ...line, [field]: value, debit: "" };
          }
          return { ...line, [field]: value };
        }
        return line;
      })
    );
  };

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  const difference = Math.abs(totalDebit - totalCredit);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions", href: "/finance/transactions" },
          { label: "New Journal Entry" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            New Journal Entry
          </h1>
          <p className="text-muted-foreground mt-1">Create a new general ledger journal entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Entry Header */}
          <Card>
            <CardHeader>
              <CardTitle>Entry Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryDate">Entry Date *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo</Label>
                  <Textarea
                    id="memo"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="Entry description"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journal Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Journal Lines</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                Add Line
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="font-bold w-[40%]">ACCOUNT *</TableHead>
                      <TableHead className="font-bold w-[20%]">MEMO</TableHead>
                      <TableHead className="font-bold text-right w-[15%]">DEBIT</TableHead>
                      <TableHead className="font-bold text-right w-[15%]">CREDIT</TableHead>
                      <TableHead className="font-bold text-center w-[10%]">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Select
                            value={line.accountId}
                            onValueChange={(v) => updateLine(line.id, "accountId", v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts?.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.accountNumber} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.memo}
                            onChange={(e) => updateLine(line.id, "memo", e.target.value)}
                            placeholder="Line memo"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.debit}
                              onChange={(e) => updateLine(line.id, "debit", e.target.value)}
                              className="pl-7 text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={line.credit}
                              onChange={(e) => updateLine(line.id, "credit", e.target.value)}
                              className="pl-7 text-right"
                              placeholder="0.00"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeLine(line.id)}
                          >
                            <span className="material-symbols-outlined text-[18px] text-destructive">delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                      <TableCell colSpan={2} className="text-right">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        ${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Balance Indicator */}
          <Card className={isBalanced ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[24px] ${isBalanced ? "text-green-600" : "text-amber-600"}`}>
                    {isBalanced ? "check_circle" : "warning"}
                  </span>
                  <div>
                    <p className={`font-medium ${isBalanced ? "text-green-700" : "text-amber-700"}`}>
                      {isBalanced ? "Entry is balanced" : "Entry is not balanced"}
                    </p>
                    {!isBalanced && (
                      <p className="text-sm text-amber-600">
                        Difference: ${difference.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        {totalDebit > totalCredit ? " (Debits exceed Credits)" : " (Credits exceed Debits)"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Debits: <span className="font-medium text-green-600">${totalDebit.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Credits: <span className="font-medium text-red-600">${totalCredit.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-blue-600"
            disabled={isSubmitting || !isBalanced}
          >
            {isSubmitting ? "Creating..." : "Create Journal Entry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
