import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { IncomeStatementPDF, IncomeStatementData } from "@/lib/pdf/report-template";

// Same data as displayed on the Income Statement page
const incomeData = {
  period: "October 2023",
  revenue: [
    { account: "4000 - Product Revenue", amount: 456780 },
    { account: "4100 - Service Revenue", amount: 123450 },
    { account: "4200 - Subscription Revenue", amount: 45600 },
  ],
  cogs: [
    { account: "5000 - Cost of Goods Sold", amount: 234560 },
    { account: "5100 - Direct Labor", amount: 45000 },
    { account: "5200 - Manufacturing Overhead", amount: 23400 },
  ],
  operatingExpenses: [
    { account: "6000 - Salaries & Wages", amount: 125000 },
    { account: "6100 - Rent Expense", amount: 15000 },
    { account: "6200 - Utilities Expense", amount: 3500 },
    { account: "6300 - Marketing & Advertising", amount: 25000 },
    { account: "6400 - Professional Services", amount: 12000 },
    { account: "6500 - Depreciation Expense", amount: 8500 },
    { account: "6600 - Insurance Expense", amount: 4500 },
    { account: "6700 - Office Supplies", amount: 2300 },
  ],
  otherIncome: [
    { account: "7000 - Interest Income", amount: 1250 },
    { account: "7100 - Other Income", amount: 800 },
  ],
  otherExpenses: [
    { account: "8000 - Interest Expense", amount: 5620 },
  ],
};

const sumItems = (items: { amount: number }[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

export async function GET(request: NextRequest) {
  try {
    const totalRevenue = sumItems(incomeData.revenue);
    const totalCOGS = sumItems(incomeData.cogs);
    const grossProfit = totalRevenue - totalCOGS;
    const totalOperatingExpenses = sumItems(incomeData.operatingExpenses);
    const operatingIncome = grossProfit - totalOperatingExpenses;
    const totalOtherIncome = sumItems(incomeData.otherIncome);
    const totalOtherExpenses = sumItems(incomeData.otherExpenses);
    const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

    // Combine all expenses for PDF
    const allExpenses = [
      { account: "Cost of Goods Sold", currentPeriod: 0, isHeader: true },
      ...incomeData.cogs.map((item) => ({ account: item.account, currentPeriod: item.amount })),
      { account: "Total COGS", currentPeriod: totalCOGS, isTotal: true },
      { account: "Operating Expenses", currentPeriod: 0, isHeader: true },
      ...incomeData.operatingExpenses.map((item) => ({ account: item.account, currentPeriod: item.amount })),
      { account: "Total Operating Expenses", currentPeriod: totalOperatingExpenses, isTotal: true },
      { account: "Other Expenses", currentPeriod: 0, isHeader: true },
      ...incomeData.otherExpenses.map((item) => ({ account: item.account, currentPeriod: item.amount })),
    ];

    // Combine revenue with other income
    const allRevenue = [
      ...incomeData.revenue.map((item) => ({ account: item.account, currentPeriod: item.amount })),
      { account: "Other Income", currentPeriod: 0, isHeader: true },
      ...incomeData.otherIncome.map((item) => ({ account: item.account, currentPeriod: item.amount })),
    ];

    const totalAllRevenue = totalRevenue + totalOtherIncome;
    const totalAllExpenses = totalCOGS + totalOperatingExpenses + totalOtherExpenses;

    const data: IncomeStatementData = {
      reportTitle: "Income Statement",
      reportDate: new Date().toLocaleDateString(),
      periodStart: "October 1, 2023",
      periodEnd: "October 31, 2023",
      company: "Your Company Name",
      currency: "USD",
      revenue: allRevenue,
      expenses: allExpenses,
      totalRevenue: totalAllRevenue,
      totalExpenses: totalAllExpenses,
      netIncome,
    };

    const pdfBuffer = await renderToBuffer(IncomeStatementPDF({ data }));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Income-Statement-October-2023.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating income statement PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
