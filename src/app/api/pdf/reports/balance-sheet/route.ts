import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { BalanceSheetPDF, BalanceSheetData } from "@/lib/pdf/report-template";

// Same data as displayed on the Balance Sheet page
const balanceSheetData = {
  asOf: "October 31, 2023",
  assets: {
    current: [
      { account: "1000 - Cash and Cash Equivalents", amount: 245680 },
      { account: "1100 - Accounts Receivable", amount: 189450 },
      { account: "1150 - Allowance for Doubtful Accounts", amount: -5000 },
      { account: "1200 - Inventory", amount: 892340 },
      { account: "1300 - Prepaid Expenses", amount: 23400 },
    ],
    fixed: [
      { account: "1500 - Property, Plant & Equipment", amount: 1250000 },
      { account: "1550 - Accumulated Depreciation", amount: -312500 },
      { account: "1600 - Intangible Assets", amount: 85000 },
    ],
  },
  liabilities: {
    current: [
      { account: "2000 - Accounts Payable", amount: 156780 },
      { account: "2100 - Accrued Expenses", amount: 45600 },
      { account: "2200 - Short-term Loans", amount: 100000 },
      { account: "2300 - Current Portion of Long-term Debt", amount: 50000 },
    ],
    longTerm: [
      { account: "2500 - Long-term Debt", amount: 450000 },
      { account: "2600 - Deferred Tax Liabilities", amount: 28500 },
    ],
  },
  equity: [
    { account: "3000 - Common Stock", amount: 500000 },
    { account: "3100 - Retained Earnings", amount: 892490 },
    { account: "3200 - Current Year Earnings", amount: 144500 },
  ],
};

const sumItems = (items: { amount: number }[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

export async function GET(request: NextRequest) {
  try {
    const totalCurrentAssets = sumItems(balanceSheetData.assets.current);
    const totalFixedAssets = sumItems(balanceSheetData.assets.fixed);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities = sumItems(balanceSheetData.liabilities.current);
    const totalLongTermLiabilities = sumItems(balanceSheetData.liabilities.longTerm);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity = sumItems(balanceSheetData.equity);

    // Transform to PDF format
    const transformItems = (items: { account: string; amount: number }[]) =>
      items.map((item) => ({
        account: item.account,
        currentPeriod: item.amount,
        previousPeriod: 0,
      }));

    const data: BalanceSheetData = {
      reportTitle: "Balance Sheet",
      reportDate: new Date().toLocaleDateString(),
      periodEnd: balanceSheetData.asOf,
      company: "Your Company Name",
      currency: "USD",
      assets: [
        { account: "Current Assets", currentPeriod: 0, previousPeriod: 0, isHeader: true },
        ...transformItems(balanceSheetData.assets.current),
        { account: "Total Current Assets", currentPeriod: totalCurrentAssets, previousPeriod: 0, isTotal: true },
        { account: "Fixed Assets", currentPeriod: 0, previousPeriod: 0, isHeader: true },
        ...transformItems(balanceSheetData.assets.fixed),
        { account: "Total Fixed Assets", currentPeriod: totalFixedAssets, previousPeriod: 0, isTotal: true },
      ],
      liabilities: [
        { account: "Current Liabilities", currentPeriod: 0, previousPeriod: 0, isHeader: true },
        ...transformItems(balanceSheetData.liabilities.current),
        { account: "Total Current Liabilities", currentPeriod: totalCurrentLiabilities, previousPeriod: 0, isTotal: true },
        { account: "Long-term Liabilities", currentPeriod: 0, previousPeriod: 0, isHeader: true },
        ...transformItems(balanceSheetData.liabilities.longTerm),
        { account: "Total Long-term Liabilities", currentPeriod: totalLongTermLiabilities, previousPeriod: 0, isTotal: true },
      ],
      equity: transformItems(balanceSheetData.equity),
      totalAssets,
      totalLiabilities,
      totalEquity,
    };

    const pdfBuffer = await renderToBuffer(BalanceSheetPDF({ data }));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Balance-Sheet-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating balance sheet PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
