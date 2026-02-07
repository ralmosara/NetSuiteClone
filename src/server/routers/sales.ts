import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

const salesOrderLineSchema = z.object({
  itemId: z.string(),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  discountPercent: z.number().min(0).max(100).optional().default(0),
  taxRate: z.number().min(0).max(100).optional().default(0),
});

export const salesRouter = router({
  // Sales Orders
  getSalesOrders: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.customerId) where.customerId = input.customerId;
      if (input.dateFrom || input.dateTo) {
        where.orderDate = {};
        if (input.dateFrom) where.orderDate.gte = input.dateFrom;
        if (input.dateTo) where.orderDate.lte = input.dateTo;
      }
      if (input.search) {
        where.OR = [
          { orderNumber: { contains: input.search, mode: "insensitive" } },
          { customer: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [orders, total] = await Promise.all([
        ctx.prisma.salesOrder.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: true,
            currency: true,
            lines: {
              include: { item: true },
            },
            _count: { select: { lines: true } },
          },
        }),
        ctx.prisma.salesOrder.count({ where }),
      ]);

      return {
        orders,
        total,
        pages: Math.ceil(total / input.limit),
        page: input.page,
      };
    }),

  getSalesOrder: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.salesOrder.findUnique({
        where: { id: input.id },
        include: {
          customer: {
            include: { contacts: true },
          },
          currency: true,
          subsidiary: true,
          createdBy: true,
          lines: {
            include: { item: true },
            orderBy: { lineNumber: "asc" },
          },
          invoices: true,
          fulfillments: {
            include: { lines: true },
          },
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return order;
    }),

  createSalesOrder: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        currencyId: z.string(),
        orderDate: z.date().optional(),
        expectedShipDate: z.date().optional(),
        shipToAddress1: z.string().optional(),
        shipToAddress2: z.string().optional(),
        shipToCity: z.string().optional(),
        shipToState: z.string().optional(),
        shipToCountry: z.string().optional(),
        shipToPostal: z.string().optional(),
        shippingMethod: z.string().optional(),
        shippingCost: z.number().optional().default(0),
        discountPercent: z.number().optional().default(0),
        memo: z.string().optional(),
        internalNotes: z.string().optional(),
        lines: z.array(salesOrderLineSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate order number
      const lastOrder = await ctx.prisma.salesOrder.findFirst({
        orderBy: { orderNumber: "desc" },
      });
      const nextNumber = lastOrder
        ? parseInt(lastOrder.orderNumber.replace("SO-", "")) + 1
        : 10001;
      const orderNumber = `SO-${nextNumber}`;

      // Calculate totals
      let subtotal = 0;
      const processedLines = input.lines.map((line, index) => {
        const lineAmount =
          line.quantity * line.unitPrice * (1 - (line.discountPercent || 0) / 100);
        subtotal += lineAmount;
        return {
          lineNumber: index + 1,
          itemId: line.itemId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountPercent: line.discountPercent || 0,
          taxRate: line.taxRate || 0,
          amount: lineAmount,
        };
      });

      const discountAmount = subtotal * (input.discountPercent || 0) / 100;
      const taxableAmount = subtotal - discountAmount;
      const avgTaxRate =
        processedLines.reduce((sum, l) => sum + l.taxRate, 0) / processedLines.length;
      const taxAmount = taxableAmount * avgTaxRate / 100;
      const total = taxableAmount + taxAmount + (input.shippingCost || 0);

      const order = await ctx.prisma.salesOrder.create({
        data: {
          orderNumber,
          customerId: input.customerId,
          currencyId: input.currencyId,
          createdById: ctx.session.user.id,
          orderDate: input.orderDate || new Date(),
          expectedShipDate: input.expectedShipDate,
          shipToAddress1: input.shipToAddress1,
          shipToAddress2: input.shipToAddress2,
          shipToCity: input.shipToCity,
          shipToState: input.shipToState,
          shipToCountry: input.shipToCountry,
          shipToPostal: input.shipToPostal,
          shippingMethod: input.shippingMethod,
          shippingCost: input.shippingCost || 0,
          discountPercent: input.discountPercent || 0,
          discountAmount,
          subtotal,
          taxAmount,
          total,
          memo: input.memo,
          internalNotes: input.internalNotes,
          lines: {
            create: processedLines,
          },
        },
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "SalesOrder",
          entityId: order.id,
          newValue: order as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "order",
          title: "Sales Order Created",
          message: `${orderNumber} created for ${order.customer.companyName} — $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          link: `/sales/orders/${order.id}`,
        },
      });

      return order;
    }),

  updateSalesOrder: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.string().optional(),
        expectedShipDate: z.date().optional(),
        shipToAddress1: z.string().optional(),
        shipToAddress2: z.string().optional(),
        shipToCity: z.string().optional(),
        shipToState: z.string().optional(),
        shipToCountry: z.string().optional(),
        shipToPostal: z.string().optional(),
        shippingMethod: z.string().optional(),
        shippingCost: z.number().optional(),
        memo: z.string().optional(),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldOrder = await ctx.prisma.salesOrder.findUnique({
        where: { id },
      });

      if (!oldOrder) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const order = await ctx.prisma.salesOrder.update({
        where: { id },
        data,
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "SalesOrder",
          entityId: order.id,
          oldValue: oldOrder as any,
          newValue: order as any,
        },
      });

      // Create notification for status changes
      if (input.status && input.status !== oldOrder.status) {
        const statusLabels: Record<string, { title: string; type: string }> = {
          confirmed: { title: "Sales Order Confirmed", type: "order" },
          shipped: { title: "Sales Order Shipped", type: "order" },
          delivered: { title: "Sales Order Delivered", type: "success" },
          cancelled: { title: "Sales Order Cancelled", type: "alert" },
          closed: { title: "Sales Order Closed", type: "order" },
        };
        const info = statusLabels[input.status];
        if (info) {
          await ctx.prisma.notification.create({
            data: {
              userId: ctx.session.user.id,
              type: info.type,
              title: info.title,
              message: `${order.orderNumber} status changed to ${input.status} — $${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              link: `/sales/orders/${order.id}`,
            },
          });
        }
      }

      return order;
    }),

  // Quotes
  getQuotes: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.customerId) where.customerId = input.customerId;
      if (input.search) {
        where.OR = [
          { quoteNumber: { contains: input.search, mode: "insensitive" } },
          { customer: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [quotes, total, stats] = await Promise.all([
        ctx.prisma.quote.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: true,
            currency: true,
            lines: { include: { item: true } },
          },
        }),
        ctx.prisma.quote.count({ where }),
        ctx.prisma.quote.groupBy({
          by: ["status"],
          _sum: { total: true },
          _count: true,
        }),
      ]);

      return { quotes, total, pages: Math.ceil(total / input.limit), stats };
    }),

  getQuote: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({
        where: { id: input.id },
        include: {
          customer: { include: { contacts: true } },
          currency: true,
          lines: {
            include: { item: true },
            orderBy: { lineNumber: "asc" },
          },
        },
      });

      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      return quote;
    }),

  createQuote: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        currencyId: z.string(),
        quoteDate: z.date().optional(),
        expirationDate: z.date().optional(),
        terms: z.string().optional(),
        memo: z.string().optional(),
        lines: z.array(
          z.object({
            itemId: z.string(),
            description: z.string().optional(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate quote number
      const lastQuote = await ctx.prisma.quote.findFirst({
        orderBy: { quoteNumber: "desc" },
      });
      const nextNumber = lastQuote
        ? parseInt(lastQuote.quoteNumber.replace("QT-", "")) + 1
        : 10001;
      const quoteNumber = `QT-${nextNumber}`;

      // Calculate totals
      let subtotal = 0;
      const processedLines = input.lines.map((line, index) => {
        const lineAmount = line.quantity * line.unitPrice;
        subtotal += lineAmount;
        return {
          lineNumber: index + 1,
          itemId: line.itemId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: lineAmount,
        };
      });

      // Default expiration 30 days from now
      const expirationDate = input.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const quote = await ctx.prisma.quote.create({
        data: {
          quoteNumber,
          customerId: input.customerId,
          currencyId: input.currencyId,
          quoteDate: input.quoteDate || new Date(),
          expirationDate,
          terms: input.terms,
          memo: input.memo,
          subtotal,
          discountAmount: 0,
          taxAmount: 0,
          total: subtotal,
          lines: {
            create: processedLines,
          },
        },
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Quote",
          entityId: quote.id,
          newValue: quote as any,
        },
      });

      return quote;
    }),

  updateQuote: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.string().optional(),
        expirationDate: z.date().optional(),
        terms: z.string().optional(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldQuote = await ctx.prisma.quote.findUnique({ where: { id } });
      if (!oldQuote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      const quote = await ctx.prisma.quote.update({
        where: { id },
        data,
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Quote",
          entityId: quote.id,
          oldValue: oldQuote as any,
          newValue: quote as any,
        },
      });

      return quote;
    }),

  deleteQuote: protectedProcedure
    .use(createPermissionMiddleware("sales:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({ where: { id: input.id } });
      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      await ctx.prisma.quote.delete({ where: { id: input.id } });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Quote",
          entityId: input.id,
          oldValue: quote as any,
        },
      });

      return { success: true };
    }),

  convertQuoteToOrder: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(z.object({ quoteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.prisma.quote.findUnique({
        where: { id: input.quoteId },
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      if (quote.status === "accepted") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Quote has already been converted" });
      }

      // Generate order number
      const lastOrder = await ctx.prisma.salesOrder.findFirst({
        orderBy: { orderNumber: "desc" },
      });
      const nextNumber = lastOrder
        ? parseInt(lastOrder.orderNumber.replace("SO-", "")) + 1
        : 10001;
      const orderNumber = `SO-${nextNumber}`;

      // Create sales order from quote
      const order = await ctx.prisma.salesOrder.create({
        data: {
          orderNumber,
          customerId: quote.customerId,
          currencyId: quote.currencyId,
          createdById: ctx.session.user.id,
          orderDate: new Date(),
          subtotal: quote.subtotal,
          discountAmount: quote.discountAmount,
          taxAmount: quote.taxAmount,
          total: quote.total,
          memo: quote.memo,
          lines: {
            create: quote.lines.map((line, index) => ({
              lineNumber: index + 1,
              itemId: line.itemId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discountPercent: 0,
              taxRate: 0,
              amount: line.amount,
            })),
          },
        },
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      // Update quote status
      await ctx.prisma.quote.update({
        where: { id: input.quoteId },
        data: { status: "accepted" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "SalesOrder",
          entityId: order.id,
          newValue: { ...order, convertedFromQuote: quote.quoteNumber } as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "order",
          title: "Quote Converted to Order",
          message: `${quote.quoteNumber} converted to ${orderNumber} for ${order.customer.companyName} — $${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          link: `/sales/orders/${order.id}`,
        },
      });

      return order;
    }),

  // Invoices
  getInvoices: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;
      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.customerId) where.customerId = input.customerId;
      if (input.search) {
        where.OR = [
          { invoiceNumber: { contains: input.search, mode: "insensitive" } },
          { customer: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const [invoices, total, stats] = await Promise.all([
        ctx.prisma.invoice.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            customer: true,
            currency: true,
            salesOrder: true,
          },
        }),
        ctx.prisma.invoice.count({ where }),
        ctx.prisma.invoice.aggregate({
          _sum: { total: true, amountDue: true, amountPaid: true },
          _count: true,
          where: { status: { in: ["open", "partially_paid"] } },
        }),
      ]);

      // Get overdue count
      const overdueCount = await ctx.prisma.invoice.count({
        where: { status: "open", dueDate: { lt: new Date() } },
      });

      return {
        invoices,
        total,
        pages: Math.ceil(total / input.limit),
        stats: {
          totalOutstanding: stats._sum.amountDue || 0,
          openCount: stats._count,
          overdueCount,
        },
      };
    }),

  createInvoice: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        customerId: z.string(),
        currencyId: z.string(),
        salesOrderId: z.string().optional(),
        invoiceDate: z.date().optional(),
        dueDate: z.date().optional(),
        terms: z.string().optional(),
        billToAddress1: z.string().optional(),
        billToAddress2: z.string().optional(),
        billToCity: z.string().optional(),
        billToState: z.string().optional(),
        billToCountry: z.string().optional(),
        billToPostal: z.string().optional(),
        memo: z.string().optional(),
        lines: z.array(
          z.object({
            itemId: z.string(),
            description: z.string().optional(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate invoice number
      const lastInvoice = await ctx.prisma.invoice.findFirst({
        orderBy: { invoiceNumber: "desc" },
      });
      const nextNumber = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.replace("INV-", "")) + 1
        : 10001;
      const invoiceNumber = `INV-${nextNumber}`;

      // Calculate totals
      let subtotal = 0;
      const processedLines = input.lines.map((line, index) => {
        const lineAmount = line.quantity * line.unitPrice;
        subtotal += lineAmount;
        return {
          lineNumber: index + 1,
          itemId: line.itemId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          amount: lineAmount,
        };
      });

      const taxAmount = 0; // Tax can be added later if needed
      const total = subtotal + taxAmount;

      // Calculate due date based on terms if not provided
      let dueDate = input.dueDate;
      if (!dueDate && input.terms) {
        const daysMatch = input.terms.match(/Net\s*(\d+)/i);
        if (daysMatch) {
          const days = parseInt(daysMatch[1]);
          dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + days);
        }
      }
      if (!dueDate) {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Default Net 30
      }

      const invoice = await ctx.prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: input.customerId,
          currencyId: input.currencyId,
          salesOrderId: input.salesOrderId,
          invoiceDate: input.invoiceDate || new Date(),
          dueDate,
          terms: input.terms || "Net 30",
          subtotal,
          taxAmount,
          total,
          amountDue: total,
          memo: input.memo,
          lines: {
            create: processedLines,
          },
        },
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Invoice",
          entityId: invoice.id,
          newValue: invoice as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "order",
          title: "Invoice Created",
          message: `${invoiceNumber} created for ${invoice.customer.companyName} — $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          link: `/sales/invoices/${invoice.id}`,
        },
      });

      return invoice;
    }),

  getInvoice: protectedProcedure
    .use(createPermissionMiddleware("sales:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.id },
        include: {
          customer: { include: { contacts: true } },
          currency: true,
          salesOrder: true,
          lines: {
            include: { item: true },
            orderBy: { lineNumber: "asc" },
          },
          payments: {
            orderBy: { paymentDate: "desc" },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return invoice;
    }),

  updateInvoice: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.string().optional(),
        dueDate: z.date().optional(),
        terms: z.string().optional(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldInvoice = await ctx.prisma.invoice.findUnique({ where: { id } });
      if (!oldInvoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const invoice = await ctx.prisma.invoice.update({
        where: { id },
        data,
        include: {
          customer: true,
          lines: { include: { item: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Invoice",
          entityId: invoice.id,
          oldValue: oldInvoice as any,
          newValue: invoice as any,
        },
      });

      return invoice;
    }),

  voidInvoice: protectedProcedure
    .use(createPermissionMiddleware("sales:edit"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.id },
        include: { payments: true },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.payments.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot void an invoice with payments. Please reverse payments first.",
        });
      }

      const updatedInvoice = await ctx.prisma.invoice.update({
        where: { id: input.id },
        data: { status: "void" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "void",
          entityType: "Invoice",
          entityId: input.id,
          oldValue: invoice as any,
          newValue: updatedInvoice as any,
        },
      });

      return { success: true };
    }),

  recordPayment: protectedProcedure
    .use(createPermissionMiddleware("sales:create"))
    .input(
      z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        paymentDate: z.date().optional(),
        paymentMethod: z.string(),
        referenceNumber: z.string().optional(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "void") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot record payment on a void invoice" });
      }

      if (invoice.status === "paid") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice is already fully paid" });
      }

      const amountDue = Number(invoice.amountDue);
      if (input.amount > amountDue) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Payment amount ($${input.amount}) exceeds balance due ($${amountDue.toFixed(2)})`,
        });
      }

      // Generate payment number
      const lastPayment = await ctx.prisma.payment.findFirst({
        orderBy: { paymentNumber: "desc" },
      });
      const nextNumber = lastPayment
        ? parseInt(lastPayment.paymentNumber.replace("PMT-", "")) + 1
        : 10001;
      const paymentNumber = `PMT-${nextNumber}`;

      // Create payment
      const payment = await ctx.prisma.payment.create({
        data: {
          paymentNumber,
          invoiceId: input.invoiceId,
          amount: input.amount,
          paymentDate: input.paymentDate || new Date(),
          paymentMethod: input.paymentMethod,
          referenceNumber: input.referenceNumber,
          memo: input.memo,
        },
      });

      // Update invoice
      const newAmountPaid = Number(invoice.amountPaid) + input.amount;
      const newAmountDue = Number(invoice.total) - newAmountPaid;
      const newStatus = newAmountDue <= 0 ? "paid" : "partially_paid";

      await ctx.prisma.invoice.update({
        where: { id: input.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Payment",
          entityId: payment.id,
          newValue: payment as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "payment",
          title: "Payment Recorded",
          message: `${paymentNumber} — $${input.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} received (${invoice.invoiceNumber})`,
          link: `/sales/invoices/${input.invoiceId}`,
        },
      });

      return payment;
    }),

  deletePayment: protectedProcedure
    .use(createPermissionMiddleware("sales:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.id },
        include: { invoice: true },
      });

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Payment not found" });
      }

      // Update invoice amounts
      const invoice = payment.invoice;
      const newAmountPaid = Number(invoice.amountPaid) - Number(payment.amount);
      const newAmountDue = Number(invoice.total) - newAmountPaid;
      const newStatus = newAmountPaid <= 0 ? "open" : "partially_paid";

      await ctx.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
        },
      });

      // Delete payment
      await ctx.prisma.payment.delete({
        where: { id: input.id },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Payment",
          entityId: input.id,
          oldValue: payment as any,
        },
      });

      return { success: true };
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure
    .use(createPermissionMiddleware("sales:view")).query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      openInvoices,
      overdueInvoices,
    ] = await Promise.all([
      ctx.prisma.salesOrder.count(),
      ctx.prisma.salesOrder.count({
        where: { orderDate: { gte: startOfMonth } },
      }),
      ctx.prisma.salesOrder.count({
        where: {
          orderDate: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
      ctx.prisma.salesOrder.count({
        where: { status: "pending_fulfillment" },
      }),
      ctx.prisma.salesOrder.aggregate({
        _sum: { total: true },
      }),
      ctx.prisma.salesOrder.aggregate({
        where: { orderDate: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      ctx.prisma.invoice.count({
        where: { status: "open" },
      }),
      ctx.prisma.invoice.count({
        where: { status: "open", dueDate: { lt: now } },
      }),
    ]);

    return {
      totalOrders,
      monthOrders,
      lastMonthOrders,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      monthRevenue: monthRevenue._sum.total || 0,
      openInvoices,
      overdueInvoices,
      orderGrowth: lastMonthOrders > 0
        ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0,
    };
  }),
});
