"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImportDialogProps {
  type: "customers" | "vendors" | "items";
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function ImportDialog({ type, onSuccess, children }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ imported: number; total: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch("/api/import/csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);

      if (data.imported > 0) {
        toast({
          title: "Import successful",
          description: `Imported ${data.imported} of ${data.total} records.`,
        });
        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const typeLabels = {
    customers: "Customers",
    vendors: "Vendors",
    items: "Items",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import {typeLabels[type]}</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import {type}. The file should include columns for the required fields.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-2">
                <span className="material-symbols-outlined text-4xl text-muted-foreground">upload_file</span>
                <p className="text-sm text-muted-foreground">
                  {isUploading ? "Uploading..." : "Click to upload CSV or Excel file"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .csv, .xlsx, .xls files
                </p>
              </div>
            </label>
          </div>

          {result && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Records imported:</span>
                <span className="font-medium text-green-600">{result.imported}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total records:</span>
                <span className="font-medium">{result.total}</span>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-600">Errors:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Expected columns for {type}:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {type === "customers" && (
                <>
                  <li>• Company Name (required)</li>
                  <li>• Email, Phone, Industry, Website</li>
                  <li>• Address, City, State, Country, Postal Code</li>
                </>
              )}
              {type === "vendors" && (
                <>
                  <li>• Company Name (required)</li>
                  <li>• Email, Phone, Website</li>
                  <li>• Address, City, State, Country, Postal Code</li>
                </>
              )}
              {type === "items" && (
                <>
                  <li>• Name (required)</li>
                  <li>• Description, Type</li>
                  <li>• Sale Price, Cost</li>
                  <li>• Track Inventory (Yes/No)</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
