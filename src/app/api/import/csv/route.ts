import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file || !type) {
      return NextResponse.json({ error: "File and type required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let imported = 0;
    let errors: string[] = [];

    switch (type) {
      case "customers":
        for (const row of data as any[]) {
          try {
            const lastCustomer = await prisma.customer.findFirst({ orderBy: { customerId: "desc" } });
            const nextNumber = lastCustomer ? parseInt(lastCustomer.customerId.replace("CUST-", "")) + 1 : 1001;

            await prisma.customer.create({
              data: {
                customerId: `CUST-${nextNumber + imported}`,
                companyName: row["Company Name"] || row["companyName"] || row["Company"],
                displayName: row["Display Name"] || row["displayName"] || row["Company Name"] || row["Company"],
                email: row["Email"] || row["email"],
                phone: row["Phone"] || row["phone"],
                industry: row["Industry"] || row["industry"],
                website: row["Website"] || row["website"],
                billingAddress1: row["Billing Address"] || row["billingAddress1"] || row["Address"],
                billingCity: row["City"] || row["billingCity"],
                billingState: row["State"] || row["billingState"],
                billingCountry: row["Country"] || row["billingCountry"],
                billingPostal: row["Postal Code"] || row["billingPostal"],
              },
            });
            imported++;
          } catch (e: any) {
            errors.push(`Row ${imported + 1}: ${e.message}`);
          }
        }
        break;

      case "vendors":
        for (const row of data as any[]) {
          try {
            const lastVendor = await prisma.vendor.findFirst({ orderBy: { vendorId: "desc" } });
            const nextNumber = lastVendor ? parseInt(lastVendor.vendorId.replace("VEND-", "")) + 1 : 1001;

            await prisma.vendor.create({
              data: {
                vendorId: `VEND-${nextNumber + imported}`,
                companyName: row["Company Name"] || row["companyName"] || row["Company"],
                displayName: row["Display Name"] || row["displayName"] || row["Company Name"] || row["Company"],
                email: row["Email"] || row["email"],
                phone: row["Phone"] || row["phone"],
                website: row["Website"] || row["website"],
                address1: row["Address"] || row["address1"],
                city: row["City"] || row["city"],
                state: row["State"] || row["state"],
                country: row["Country"] || row["country"],
                postalCode: row["Postal Code"] || row["postalCode"],
              },
            });
            imported++;
          } catch (e: any) {
            errors.push(`Row ${imported + 1}: ${e.message}`);
          }
        }
        break;

      case "items":
        for (const row of data as any[]) {
          try {
            const lastItem = await prisma.item.findFirst({ orderBy: { itemId: "desc" }, where: { itemId: { startsWith: "SKU-" } } });
            const nextNumber = lastItem ? parseInt(lastItem.itemId.replace("SKU-", "")) + 1 : 10001;

            await prisma.item.create({
              data: {
                itemId: `SKU-${nextNumber + imported}`,
                name: row["Name"] || row["name"] || row["Item Name"],
                displayName: row["Display Name"] || row["displayName"] || row["Name"] || row["name"],
                description: row["Description"] || row["description"],
                itemType: row["Type"] || row["itemType"] || "inventory",
                basePrice: parseFloat(row["Sale Price"] || row["basePrice"] || row["Price"] || "0"),
                cost: parseFloat(row["Cost"] || row["cost"] || "0"),
                trackInventory: row["Track Inventory"] === "Yes" || row["trackInventory"] === true,
              },
            });
            imported++;
          } catch (e: any) {
            errors.push(`Row ${imported + 1}: ${e.message}`);
          }
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid import type" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      imported,
      total: data.length,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error("Error importing data:", error);
    return NextResponse.json({ error: error.message || "Failed to import data" }, { status: 500 });
  }
}
