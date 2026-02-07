import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Currencies
  console.log("Creating currencies...");
  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      decimalPlaces: 2,
      isBase: true,
      isActive: true,
    },
  });

  const eur = await prisma.currency.upsert({
    where: { code: "EUR" },
    update: {},
    create: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      decimalPlaces: 2,
      isBase: false,
      isActive: true,
    },
  });

  const gbp = await prisma.currency.upsert({
    where: { code: "GBP" },
    update: {},
    create: {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      decimalPlaces: 2,
      isBase: false,
      isActive: true,
    },
  });

  // Create Permissions
  console.log("Creating permissions...");
  const modules = [
    "dashboard",
    "sales",
    "purchasing",
    "inventory",
    "finance",
    "payroll",
    "reports",
    "setup",
  ];
  const permissionActions = ["view", "create", "edit", "delete"];

  for (const module of modules) {
    for (const action of permissionActions) {
      await prisma.permission.upsert({
        where: { code: `${module}:${action}` },
        update: {},
        create: {
          code: `${module}:${action}`,
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
          module: module,
          description: `Permission to ${action} ${module}`,
        },
      });
    }
  }

  // Create Roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: {
      name: "Administrator",
      description: "Full system access",
      isSystem: true,
    },
  });

  const salesManagerRole = await prisma.role.upsert({
    where: { name: "Sales Manager" },
    update: {},
    create: {
      name: "Sales Manager",
      description: "Sales and CRM access",
      isSystem: false,
    },
  });

  const accountantRole = await prisma.role.upsert({
    where: { name: "Accountant" },
    update: {},
    create: {
      name: "Accountant",
      description: "Finance and reporting access",
      isSystem: false,
    },
  });

  // Assign all permissions to admin
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
        accessLevel: "full",
      },
    });
  }

  // Create Subsidiary
  console.log("Creating subsidiary...");
  const headquarters = await prisma.subsidiary.upsert({
    where: { code: "HQ" },
    update: {},
    create: {
      code: "HQ",
      name: "US Headquarters",
      currencyId: usd.id,
      address: "100 Main Street",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      postalCode: "94102",
      phone: "+1 (555) 123-4567",
      email: "info@company.com",
      isActive: true,
    },
  });

  // Create Department
  console.log("Creating departments...");
  const salesDept = await prisma.department.upsert({
    where: { code: "SALES" },
    update: {},
    create: {
      code: "SALES",
      name: "Sales",
      isActive: true,
    },
  });

  const financeDept = await prisma.department.upsert({
    where: { code: "FINANCE" },
    update: {},
    create: {
      code: "FINANCE",
      name: "Finance",
      isActive: true,
    },
  });

  const engineeringDept = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {},
    create: {
      code: "ENG",
      name: "Engineering",
      isActive: true,
    },
  });

  // Create Admin User
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      email: "admin@company.com",
      name: "System Administrator",
      password: hashedPassword,
      roleId: adminRole.id,
      subsidiaryId: headquarters.id,
      isActive: true,
    },
  });

  // Create Sales Manager User
  const salesManagerUser = await prisma.user.upsert({
    where: { email: "sarah.jenkins@company.com" },
    update: {},
    create: {
      email: "sarah.jenkins@company.com",
      name: "Sarah Jenkins",
      password: hashedPassword,
      roleId: salesManagerRole.id,
      subsidiaryId: headquarters.id,
      departmentId: salesDept.id,
      isActive: true,
    },
  });

  // Create Customers
  console.log("Creating customers...");
  const customers = [
    {
      customerId: "CUST-4921",
      companyName: "Global Corp Inc.",
      displayName: "Global Corp Inc.",
      email: "billing@globalcorp.com",
      phone: "+1 (555) 012-3456",
      website: "https://globalcorp.com",
      industry: "Tech/Software",
      billingAddress1: "1200 Innovation Drive",
      billingCity: "San Francisco",
      billingState: "CA",
      billingCountry: "United States",
      billingPostal: "94107",
      creditLimit: 50000,
      paymentTerms: "Net 30",
      status: "active",
    },
    {
      customerId: "CUST-3842",
      companyName: "Acme Solutions",
      displayName: "Acme Solutions",
      email: "accounts@acme.com",
      phone: "+1 (555) 234-5678",
      industry: "Manufacturing",
      billingAddress1: "500 Industrial Way",
      billingCity: "Chicago",
      billingState: "IL",
      billingCountry: "United States",
      billingPostal: "60601",
      creditLimit: 25000,
      paymentTerms: "Net 30",
      status: "active",
    },
    {
      customerId: "CUST-2901",
      companyName: "Tech Industries",
      displayName: "Tech Industries",
      email: "finance@techindustries.io",
      phone: "+1 (555) 345-6789",
      industry: "Technology",
      billingAddress1: "789 Tech Park",
      billingCity: "Austin",
      billingState: "TX",
      billingCountry: "United States",
      billingPostal: "73301",
      creditLimit: 100000,
      paymentTerms: "Net 45",
      status: "active",
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { customerId: customer.customerId },
      update: {},
      create: {
        ...customer,
        currencyId: usd.id,
      },
    });
  }

  // Create Vendors
  console.log("Creating vendors...");
  const vendors = [
    {
      vendorId: "VEND-1001",
      companyName: "Apple Inc.",
      displayName: "Apple Inc.",
      email: "enterprise@apple.com",
      phone: "+1 (800) 275-2273",
      address1: "One Apple Park Way",
      city: "Cupertino",
      state: "CA",
      country: "United States",
      postalCode: "95014",
      paymentTerms: "Net 30",
      status: "active",
    },
    {
      vendorId: "VEND-1002",
      companyName: "Dell Technologies",
      displayName: "Dell Technologies",
      email: "business@dell.com",
      phone: "+1 (800) 999-3355",
      address1: "One Dell Way",
      city: "Round Rock",
      state: "TX",
      country: "United States",
      postalCode: "78682",
      paymentTerms: "Net 30",
      status: "active",
    },
  ];

  for (const vendor of vendors) {
    await prisma.vendor.upsert({
      where: { vendorId: vendor.vendorId },
      update: {},
      create: {
        ...vendor,
        currencyId: usd.id,
      },
    });
  }

  // Create Items
  console.log("Creating items...");
  const items = [
    {
      itemId: "NB-PRO-16",
      name: "MacBook Pro 16\"",
      displayName: "MacBook Pro 16\" - M2 Max, 32GB RAM, 1TB SSD",
      description: "MacBook Pro 16-inch with M2 Max chip, 32GB unified memory, 1TB SSD",
      itemType: "inventory",
      basePrice: 2499,
      cost: 2100,
      isTaxable: true,
    },
    {
      itemId: "ACC-HUB-C",
      name: "USB-C Multiport Adapter",
      displayName: "USB-C Multiport Adapter - HDMI, USB 3.0, Ethernet",
      description: "USB-C hub with HDMI, USB 3.0 ports, and Ethernet",
      itemType: "inventory",
      basePrice: 79,
      cost: 45,
      isTaxable: true,
    },
    {
      itemId: "SERV-INSTALL",
      name: "Installation Service",
      displayName: "On-site Installation and Configuration Service (Hours)",
      description: "Professional on-site installation and configuration service",
      itemType: "service",
      basePrice: 150,
      cost: 75,
      isTaxable: false,
    },
    {
      itemId: "ACC-2030",
      name: "Laptop Stand",
      displayName: "Aluminum Adjustable Laptop Stand, Silver",
      description: "Ergonomic aluminum laptop stand with adjustable height",
      itemType: "inventory",
      basePrice: 45,
      cost: 22,
      isTaxable: true,
    },
    {
      itemId: "OFF-1002",
      name: "A4 Paper Ream",
      displayName: "A4 Printing Paper, 500 sheets",
      description: "Premium white A4 printing paper, 80gsm",
      itemType: "inventory",
      basePrice: 8.50,
      cost: 4.25,
      isTaxable: true,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { itemId: item.itemId },
      update: {},
      create: {
        ...item,
        trackInventory: item.itemType === "inventory",
      },
    });
  }

  // Create Warehouse
  console.log("Creating warehouse...");
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { code: "WH-SF-MAIN" },
    update: {},
    create: {
      code: "WH-SF-MAIN",
      name: "San Francisco Main Production Warehouse",
      subsidiaryId: headquarters.id,
      address1: "500 Warehouse Blvd",
      city: "San Francisco",
      state: "CA",
      country: "United States",
      postalCode: "94124",
      isActive: true,
    },
  });

  // Create Location
  const mainLocation = await prisma.location.upsert({
    where: {
      warehouseId_code: {
        warehouseId: mainWarehouse.id,
        code: "A-01-01",
      },
    },
    update: {},
    create: {
      code: "A-01-01",
      name: "Aisle A, Rack 01, Shelf 01",
      warehouseId: mainWarehouse.id,
      aisle: "A",
      rack: "01",
      shelf: "01",
      isActive: true,
    },
  });

  // Create Chart of Accounts
  console.log("Creating chart of accounts...");
  const accounts = [
    { accountNumber: "1000", name: "Cash and Cash Equivalents", accountType: "asset", subType: "bank" },
    { accountNumber: "1100", name: "Accounts Receivable", accountType: "asset", subType: "accounts_receivable" },
    { accountNumber: "1200", name: "Inventory", accountType: "asset", subType: "inventory" },
    { accountNumber: "1500", name: "Property, Plant & Equipment", accountType: "asset", subType: "fixed_asset" },
    { accountNumber: "2000", name: "Accounts Payable", accountType: "liability", subType: "accounts_payable" },
    { accountNumber: "2100", name: "Short-term Loans", accountType: "liability", subType: "short_term" },
    { accountNumber: "2500", name: "Long-term Debt", accountType: "liability", subType: "long_term" },
    { accountNumber: "3000", name: "Common Stock", accountType: "equity" },
    { accountNumber: "3100", name: "Retained Earnings", accountType: "equity" },
    { accountNumber: "4000", name: "Product Revenue", accountType: "income" },
    { accountNumber: "4100", name: "Service Revenue", accountType: "income" },
    { accountNumber: "5000", name: "Cost of Goods Sold", accountType: "cogs" },
    { accountNumber: "6000", name: "Salaries & Wages", accountType: "expense" },
    { accountNumber: "6100", name: "Rent Expense", accountType: "expense" },
    { accountNumber: "6200", name: "Utilities Expense", accountType: "expense" },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { accountNumber: account.accountNumber },
      update: {},
      create: {
        ...account,
        subsidiaryId: headquarters.id,
        balance: 0,
      },
    });
  }

  // Create Employees
  console.log("Creating employees...");
  const employees = [
    {
      employeeId: "EMP-1024",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@company.com",
      phone: "+1 (555) 111-2222",
      jobTitle: "Senior Software Engineer",
      hireDate: new Date("2019-10-24"),
      employmentType: "full_time",
      status: "active",
      salary: 145000,
      salaryFrequency: "annual",
    },
    {
      employeeId: "EMP-1025",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+1 (555) 222-3333",
      jobTitle: "Product Manager",
      hireDate: new Date("2021-09-15"),
      employmentType: "full_time",
      status: "active",
      salary: 135000,
      salaryFrequency: "annual",
    },
    {
      employeeId: "EMP-1033",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@company.com",
      phone: "+1 (555) 333-4444",
      jobTitle: "HR Specialist",
      hireDate: new Date("2023-01-10"),
      employmentType: "full_time",
      status: "active",
      salary: 75000,
      salaryFrequency: "annual",
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { employeeId: employee.employeeId },
      update: {},
      create: {
        ...employee,
        subsidiaryId: headquarters.id,
        departmentId: engineeringDept.id,
      },
    });
  }

  // Get created entities for relationships
  const globalCorp = await prisma.customer.findUnique({ where: { customerId: "CUST-4921" } });
  const acmeSolutions = await prisma.customer.findUnique({ where: { customerId: "CUST-3842" } });
  const techIndustries = await prisma.customer.findUnique({ where: { customerId: "CUST-2901" } });
  const appleVendor = await prisma.vendor.findUnique({ where: { vendorId: "VEND-1001" } });
  const dellVendor = await prisma.vendor.findUnique({ where: { vendorId: "VEND-1002" } });
  const macbookItem = await prisma.item.findUnique({ where: { itemId: "NB-PRO-16" } });
  const hubItem = await prisma.item.findUnique({ where: { itemId: "ACC-HUB-C" } });
  const installItem = await prisma.item.findUnique({ where: { itemId: "SERV-INSTALL" } });
  const standItem = await prisma.item.findUnique({ where: { itemId: "ACC-2030" } });

  // Create Sales Orders
  console.log("Creating sales orders...");
  const salesOrders = [
    {
      orderNumber: "SO-5012",
      customerId: globalCorp!.id,
      status: "fulfilled",
      orderDate: new Date("2023-10-15"),
      expectedShipDate: new Date("2023-10-22"),
      subtotal: 52577,
      taxAmount: 4731.93,
      total: 57308.93,
      memo: "Rush delivery requested",
    },
    {
      orderNumber: "SO-5013",
      customerId: acmeSolutions!.id,
      status: "pending_fulfillment",
      orderDate: new Date("2023-10-18"),
      expectedShipDate: new Date("2023-10-25"),
      subtotal: 12450,
      taxAmount: 1120.50,
      total: 13570.50,
    },
    {
      orderNumber: "SO-5014",
      customerId: techIndustries!.id,
      status: "pending_approval",
      orderDate: new Date("2023-10-20"),
      expectedShipDate: new Date("2023-10-30"),
      subtotal: 87500,
      taxAmount: 7875,
      total: 95375,
      memo: "Annual hardware refresh",
    },
    {
      orderNumber: "SO-5015",
      customerId: globalCorp!.id,
      status: "approved",
      orderDate: new Date("2023-10-22"),
      expectedShipDate: new Date("2023-10-29"),
      subtotal: 24990,
      taxAmount: 2249.10,
      total: 27239.10,
    },
  ];

  for (const order of salesOrders) {
    const so = await prisma.salesOrder.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: {
        ...order,
        subsidiaryId: headquarters.id,
        currencyId: usd.id,
        createdById: salesManagerUser.id,
      },
    });

    // Add line items
    if (order.orderNumber === "SO-5012") {
      await prisma.salesOrderLine.createMany({
        data: [
          { salesOrderId: so.id, itemId: macbookItem!.id, description: "MacBook Pro 16\"", quantity: 20, unitPrice: 2499, amount: 49980, lineNumber: 1 },
          { salesOrderId: so.id, itemId: hubItem!.id, description: "USB-C Multiport Adapter", quantity: 20, unitPrice: 79, amount: 1580, lineNumber: 2 },
          { salesOrderId: so.id, itemId: installItem!.id, description: "Installation Service", quantity: 6.78, unitPrice: 150, amount: 1017, lineNumber: 3 },
        ],
        skipDuplicates: true,
      });
    }
  }

  // Create Invoices
  console.log("Creating invoices...");
  const invoices = [
    {
      invoiceNumber: "INV-2023-0892",
      customerId: globalCorp!.id,
      status: "paid",
      invoiceDate: new Date("2023-10-15"),
      dueDate: new Date("2023-11-14"),
      subtotal: 57308.93,
      taxAmount: 4731.93,
      total: 57308.93,
      amountPaid: 57308.93,
      amountDue: 0,
    },
    {
      invoiceNumber: "INV-2023-0893",
      customerId: acmeSolutions!.id,
      status: "open",
      invoiceDate: new Date("2023-10-18"),
      dueDate: new Date("2023-11-17"),
      subtotal: 12450,
      taxAmount: 1120.50,
      total: 13570.50,
      amountPaid: 0,
      amountDue: 13570.50,
    },
    {
      invoiceNumber: "INV-2023-0894",
      customerId: techIndustries!.id,
      status: "open",
      invoiceDate: new Date("2023-09-20"),
      dueDate: new Date("2023-10-20"),
      subtotal: 45000,
      taxAmount: 4050,
      total: 49050,
      amountPaid: 0,
      amountDue: 49050,
    },
  ];

  for (const invoice of invoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: invoice.invoiceNumber },
      update: {},
      create: {
        ...invoice,
        currencyId: usd.id,
      },
    });
  }

  // Create Quotes
  console.log("Creating quotes...");
  const quotes = [
    {
      quoteNumber: "QT-2023-0456",
      customerId: globalCorp!.id,
      status: "sent",
      quoteDate: new Date("2023-10-25"),
      expirationDate: new Date("2023-11-25"),
      subtotal: 125000,
      taxAmount: 11250,
      total: 136250,
      memo: "Q4 hardware expansion proposal",
    },
    {
      quoteNumber: "QT-2023-0457",
      customerId: techIndustries!.id,
      status: "draft",
      quoteDate: new Date("2023-10-26"),
      expirationDate: new Date("2023-11-26"),
      subtotal: 87500,
      taxAmount: 7875,
      total: 95375,
    },
    {
      quoteNumber: "QT-2023-0458",
      customerId: acmeSolutions!.id,
      status: "accepted",
      quoteDate: new Date("2023-10-20"),
      expirationDate: new Date("2023-11-20"),
      subtotal: 35000,
      taxAmount: 3150,
      total: 38150,
    },
  ];

  for (const quote of quotes) {
    await prisma.quote.upsert({
      where: { quoteNumber: quote.quoteNumber },
      update: {},
      create: {
        ...quote,
        currencyId: usd.id,
      },
    });
  }

  // Create Purchase Orders
  console.log("Creating purchase orders...");
  const purchaseOrders = [
    {
      poNumber: "PO-3001",
      vendorId: appleVendor!.id,
      status: "received",
      orderDate: new Date("2023-10-01"),
      expectedReceiptDate: new Date("2023-10-15"),
      subtotal: 52475,
      taxAmount: 0,
      total: 52475,
    },
    {
      poNumber: "PO-3002",
      vendorId: dellVendor!.id,
      status: "sent",
      orderDate: new Date("2023-10-18"),
      expectedReceiptDate: new Date("2023-11-01"),
      subtotal: 34500,
      taxAmount: 0,
      total: 34500,
    },
    {
      poNumber: "PO-3003",
      vendorId: appleVendor!.id,
      status: "pending_approval",
      orderDate: new Date("2023-10-25"),
      expectedReceiptDate: new Date("2023-11-10"),
      subtotal: 87450,
      taxAmount: 0,
      total: 87450,
      memo: "Q4 inventory replenishment",
    },
  ];

  for (const po of purchaseOrders) {
    const purchaseOrder = await prisma.purchaseOrder.upsert({
      where: { poNumber: po.poNumber },
      update: {},
      create: {
        ...po,
        subsidiaryId: headquarters.id,
        currencyId: usd.id,
        createdById: adminUser.id,
      },
    });

    if (po.poNumber === "PO-3001") {
      await prisma.purchaseOrderLine.createMany({
        data: [
          { purchaseOrderId: purchaseOrder.id, itemId: macbookItem!.id, description: "MacBook Pro 16\"", quantity: 25, unitPrice: 2099, amount: 52475, lineNumber: 1 },
        ],
        skipDuplicates: true,
      });
    }
  }

  // Create BOMs (Bill of Material)
  console.log("Creating BOMs...");
  const bom = await prisma.billOfMaterial.upsert({
    where: { bomId: "BOM-001" },
    update: {},
    create: {
      bomId: "BOM-001",
      name: "Smart Hub Pro Assembly",
      assemblyItemId: hubItem!.id,
      revision: "2.1",
      isActive: true,
      effectiveDate: new Date("2023-01-15"),
    },
  });

  await prisma.bOMComponent.createMany({
    data: [
      { bomId: bom.id, itemId: hubItem!.id, quantity: 1, unit: "EA", lineNumber: 1 },
      { bomId: bom.id, itemId: standItem!.id, quantity: 1, unit: "EA", lineNumber: 2 },
    ],
    skipDuplicates: true,
  });

  // Create Work Orders
  console.log("Creating work orders...");
  const workOrders = [
    {
      workOrderNumber: "WO-2023-0145",
      bomId: bom.id,
      plannedQuantity: 100,
      completedQuantity: 85,
      status: "in_progress",
      priority: "high",
      plannedStartDate: new Date("2023-10-15"),
      plannedEndDate: new Date("2023-10-30"),
      actualStartDate: new Date("2023-10-16"),
    },
    {
      workOrderNumber: "WO-2023-0146",
      bomId: bom.id,
      plannedQuantity: 50,
      completedQuantity: 50,
      status: "completed",
      priority: "normal",
      plannedStartDate: new Date("2023-10-01"),
      plannedEndDate: new Date("2023-10-12"),
      actualStartDate: new Date("2023-10-01"),
      actualEndDate: new Date("2023-10-11"),
    },
    {
      workOrderNumber: "WO-2023-0147",
      bomId: bom.id,
      plannedQuantity: 200,
      completedQuantity: 0,
      status: "planned",
      priority: "normal",
      plannedStartDate: new Date("2023-11-01"),
      plannedEndDate: new Date("2023-11-20"),
    },
  ];

  for (const wo of workOrders) {
    await prisma.workOrder.upsert({
      where: { workOrderNumber: wo.workOrderNumber },
      update: {},
      create: wo,
    });
  }

  // Create Support Cases
  console.log("Creating support cases...");
  const supportCases = [
    {
      caseNumber: "CASE-8842",
      customerId: globalCorp!.id,
      assignedToId: salesManagerUser.id,
      subject: "Unable to access admin dashboard",
      description: "User reports 403 error when trying to access the admin dashboard after recent update.",
      priority: "high",
      status: "in_progress",
      category: "Technical",
    },
    {
      caseNumber: "CASE-8843",
      customerId: acmeSolutions!.id,
      assignedToId: salesManagerUser.id,
      subject: "Invoice discrepancy",
      description: "Customer reports mismatch between quoted price and invoice amount.",
      priority: "medium",
      status: "open",
      category: "Billing",
    },
    {
      caseNumber: "CASE-8844",
      customerId: techIndustries!.id,
      assignedToId: salesManagerUser.id,
      subject: "Feature request: bulk export",
      description: "Request for ability to bulk export transaction history to CSV.",
      priority: "low",
      status: "waiting",
      category: "Feature Request",
    },
    {
      caseNumber: "CASE-8845",
      customerId: globalCorp!.id,
      subject: "Product delivery damaged",
      description: "3 units from order SO-5012 arrived with damaged packaging.",
      priority: "high",
      status: "resolved",
      category: "Shipping",
      resolvedAt: new Date("2023-10-20"),
    },
  ];

  for (const supportCase of supportCases) {
    await prisma.supportCase.upsert({
      where: { caseNumber: supportCase.caseNumber },
      update: {},
      create: supportCase,
    });
  }

  // Create Subscriptions
  console.log("Creating subscriptions...");
  const subscriptions = [
    {
      subscriptionId: "SUB-2023-001",
      customerId: globalCorp!.id,
      planName: "Enterprise",
      planType: "monthly",
      status: "active",
      startDate: new Date("2023-01-01"),
      monthlyValue: 499,
    },
    {
      subscriptionId: "SUB-2023-015",
      customerId: acmeSolutions!.id,
      planName: "Professional",
      planType: "monthly",
      status: "active",
      startDate: new Date("2023-03-15"),
      monthlyValue: 149,
    },
    {
      subscriptionId: "SUB-2023-022",
      customerId: techIndustries!.id,
      planName: "Enterprise",
      planType: "annual",
      status: "active",
      startDate: new Date("2023-06-01"),
      monthlyValue: 998,
    },
  ];

  for (const subscription of subscriptions) {
    await prisma.subscription.upsert({
      where: { subscriptionId: subscription.subscriptionId },
      update: {},
      create: subscription,
    });
  }

  // Create Fixed Assets
  console.log("Creating fixed assets...");
  const ppeAccount = await prisma.account.findUnique({ where: { accountNumber: "1500" } });

  const fixedAssets = [
    {
      assetId: "FA-2023-001",
      name: "Office Building - HQ",
      description: "Main headquarters office building",
      assetType: "building",
      purchaseDate: new Date("2020-01-15"),
      purchasePrice: 2500000,
      netBookValue: 2375000,
      depreciationMethod: "straight_line",
      usefulLife: 480, // 40 years in months
      salvageValue: 500000,
      status: "active",
    },
    {
      assetId: "FA-2023-002",
      name: "Manufacturing Equipment",
      description: "CNC machines and assembly line equipment",
      assetType: "equipment",
      purchaseDate: new Date("2022-06-01"),
      purchasePrice: 450000,
      netBookValue: 382500,
      depreciationMethod: "straight_line",
      usefulLife: 120, // 10 years in months
      salvageValue: 45000,
      status: "active",
    },
    {
      assetId: "FA-2023-003",
      name: "Company Vehicles",
      description: "Fleet of delivery trucks",
      assetType: "vehicle",
      purchaseDate: new Date("2023-01-10"),
      purchasePrice: 180000,
      netBookValue: 162000,
      depreciationMethod: "declining_balance",
      usefulLife: 60, // 5 years in months
      salvageValue: 30000,
      status: "active",
    },
  ];

  for (const asset of fixedAssets) {
    await prisma.fixedAsset.upsert({
      where: { assetId: asset.assetId },
      update: {},
      create: {
        ...asset,
        accountId: ppeAccount!.id,
      },
    });
  }

  // Create Journal Entries / Transactions
  console.log("Creating journal entries...");
  const cashAccount = await prisma.account.findUnique({ where: { accountNumber: "1000" } });
  const arAccount = await prisma.account.findUnique({ where: { accountNumber: "1100" } });
  const revenueAccount = await prisma.account.findUnique({ where: { accountNumber: "4000" } });

  const journalEntries = [
    {
      entryNumber: "JE-2023-0001",
      entryDate: new Date("2023-10-15"),
      memo: "Sales revenue - SO-5012",
      status: "posted",
      totalDebit: 57308.93,
      totalCredit: 57308.93,
    },
    {
      entryNumber: "JE-2023-0002",
      entryDate: new Date("2023-10-18"),
      memo: "Purchase order payment - PO-3001",
      status: "posted",
      totalDebit: 52475,
      totalCredit: 52475,
    },
    {
      entryNumber: "JE-2023-0003",
      entryDate: new Date("2023-10-20"),
      memo: "Customer payment received",
      status: "posted",
      totalDebit: 57308.93,
      totalCredit: 57308.93,
    },
  ];

  for (const entry of journalEntries) {
    const je = await prisma.journalEntry.upsert({
      where: { entryNumber: entry.entryNumber },
      update: {},
      create: entry,
    });

    // Add journal lines
    if (entry.entryNumber === "JE-2023-0001") {
      await prisma.journalEntryLine.createMany({
        data: [
          { journalEntryId: je.id, accountId: arAccount!.id, debit: 57308.93, credit: 0, memo: "Accounts Receivable", lineNumber: 1 },
          { journalEntryId: je.id, accountId: revenueAccount!.id, debit: 0, credit: 57308.93, memo: "Product Revenue", lineNumber: 2 },
        ],
        skipDuplicates: true,
      });
    } else if (entry.entryNumber === "JE-2023-0003") {
      await prisma.journalEntryLine.createMany({
        data: [
          { journalEntryId: je.id, accountId: cashAccount!.id, debit: 57308.93, credit: 0, memo: "Cash received", lineNumber: 1 },
          { journalEntryId: je.id, accountId: arAccount!.id, debit: 0, credit: 57308.93, memo: "AR cleared", lineNumber: 2 },
        ],
        skipDuplicates: true,
      });
    }
  }

  // Create Notifications
  console.log("Creating notifications...");
  const now = new Date();
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        type: "order",
        title: "New Sales Order",
        message: "SO-10001 received from Acme Corp for $45,250.00",
        link: "/sales/orders",
        isRead: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "approval",
        title: "PO Pending Approval",
        message: "PO-1001 requires your approval - $28,500.00",
        link: "/purchasing/orders",
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "alert",
        title: "Low Stock Alert",
        message: "Widget Pro (SKU-001) is below reorder point",
        link: "/inventory/items",
        isRead: false,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "payment",
        title: "Payment Received",
        message: "Payment of $12,500.00 received from TechStart Inc",
        link: "/finance/transactions",
        isRead: true,
        readAt: new Date(now.getTime() - 90 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "support",
        title: "Support Case Escalated",
        message: "CASE-8842 escalated to high priority",
        link: "/crm/support",
        isRead: true,
        readAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "system",
        title: "Report Generated",
        message: "Monthly P&L report is ready for download",
        link: "/reports/income-statement",
        isRead: true,
        readAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "order",
        title: "Order Shipped",
        message: "SO-10003 has been shipped via FedEx",
        link: "/sales/orders",
        isRead: true,
        readAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        type: "approval",
        title: "Expense Approved",
        message: "Your expense report EXP-0042 has been approved",
        isRead: true,
        readAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Database seed completed successfully!");
  console.log("\n📋 Test credentials:");
  console.log("   Email: admin@company.com");
  console.log("   Password: admin123");
  console.log("\n📊 Seeded data summary:");
  console.log("   - 3 Currencies (USD, EUR, GBP)");
  console.log("   - 3 Roles with permissions");
  console.log("   - 2 Users");
  console.log("   - 3 Customers");
  console.log("   - 2 Vendors");
  console.log("   - 5 Items");
  console.log("   - 4 Sales Orders");
  console.log("   - 3 Invoices");
  console.log("   - 3 Quotes");
  console.log("   - 3 Purchase Orders");
  console.log("   - 1 BOM with components");
  console.log("   - 3 Work Orders");
  console.log("   - 4 Support Cases");
  console.log("   - 3 Subscriptions");
  console.log("   - 3 Fixed Assets");
  console.log("   - 3 Journal Entries");
  console.log("   - 8 Notifications");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
