import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

export const purchasingRouter = router({
  // Vendors
  getVendors: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.search) {
        where.OR = [
          { companyName: { contains: input.search, mode: "insensitive" } },
          { vendorId: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [vendors, total] = await Promise.all([
        ctx.prisma.vendor.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { companyName: "asc" },
          include: {
            currency: true,
            _count: {
              select: { purchaseOrders: true, vendorBills: true },
            },
          },
        }),
        ctx.prisma.vendor.count({ where }),
      ]);

      return { vendors, total, pages: Math.ceil(total / input.limit) };
    }),

  getVendor: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: input.id },
        include: {
          currency: true,
          contacts: true,
          purchaseOrders: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          vendorBills: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return vendor;
    }),

  createVendor: protectedProcedure
    .use(createPermissionMiddleware("purchasing:create"))
    .input(
      z.object({
        companyName: z.string().min(1),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        currencyId: z.string().optional(),
        paymentTerms: z.string().optional(),
        taxNumber: z.string().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
        bankRouting: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lastVendor = await ctx.prisma.vendor.findFirst({
        orderBy: { vendorId: "desc" },
      });
      const nextNumber = lastVendor
        ? parseInt(lastVendor.vendorId.replace("VEND-", "")) + 1
        : 1001;
      const vendorId = `VEND-${nextNumber}`;

      const vendor = await ctx.prisma.vendor.create({
        data: {
          vendorId,
          ...input,
          displayName: input.displayName || input.companyName,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Vendor",
          entityId: vendor.id,
          newValue: vendor as any,
        },
      });

      return vendor;
    }),

  updateVendor: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(
      z.object({
        id: z.string(),
        companyName: z.string().min(1).optional(),
        displayName: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        website: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        currencyId: z.string().optional(),
        paymentTerms: z.string().optional(),
        taxNumber: z.string().optional(),
        bankName: z.string().optional(),
        bankAccount: z.string().optional(),
        bankRouting: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldVendor = await ctx.prisma.vendor.findUnique({ where: { id } });
      if (!oldVendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });
      }

      // Handle empty email
      const updateData = {
        ...data,
        email: data.email === "" ? null : data.email,
      };

      const vendor = await ctx.prisma.vendor.update({
        where: { id },
        data: updateData,
        include: {
          currency: true,
          contacts: true,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Vendor",
          entityId: vendor.id,
          oldValue: oldVendor as any,
          newValue: vendor as any,
        },
      });

      return vendor;
    }),

  deleteVendor: protectedProcedure
    .use(createPermissionMiddleware("purchasing:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findUnique({
        where: { id: input.id },
        include: {
          purchaseOrders: { take: 1 },
          vendorBills: { take: 1 },
        },
      });

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });
      }

      if (vendor.purchaseOrders.length > 0 || vendor.vendorBills.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete vendor with existing purchase orders or bills. Deactivate instead.",
        });
      }

      await ctx.prisma.vendor.delete({ where: { id: input.id } });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Vendor",
          entityId: input.id,
          oldValue: vendor as any,
        },
      });

      return { success: true };
    }),

  // Purchase Orders
  getPurchaseOrders: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        vendorId: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.vendorId) where.vendorId = input.vendorId;
      if (input.search) {
        where.OR = [
          { poNumber: { contains: input.search, mode: "insensitive" } },
          { vendor: { companyName: { contains: input.search, mode: "insensitive" } } },
        ];
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [orders, total, pendingCount, monthSpend, ytdSpend] = await Promise.all([
        ctx.prisma.purchaseOrder.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            vendor: true,
            currency: true,
            _count: { select: { lines: true } },
          },
        }),
        ctx.prisma.purchaseOrder.count({ where }),
        ctx.prisma.purchaseOrder.count({
          where: { status: { in: ["pending_approval", "approved", "sent", "partially_received"] } },
        }),
        ctx.prisma.purchaseOrder.aggregate({
          where: { orderDate: { gte: startOfMonth }, status: { not: "cancelled" } },
          _sum: { total: true },
        }),
        ctx.prisma.purchaseOrder.aggregate({
          where: { orderDate: { gte: startOfYear }, status: { not: "cancelled" } },
          _sum: { total: true },
        }),
      ]);

      return {
        orders,
        total,
        pages: Math.ceil(total / input.limit),
        stats: {
          pendingCount,
          monthSpend: monthSpend._sum.total || 0,
          ytdSpend: ytdSpend._sum.total || 0,
        },
      };
    }),

  getPurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.purchaseOrder.findUnique({
        where: { id: input.id },
        include: {
          vendor: { include: { contacts: true } },
          currency: true,
          subsidiary: true,
          createdBy: true,
          shipToWarehouse: true,
          lines: {
            include: { item: true },
            orderBy: { lineNumber: "asc" },
          },
          receipts: { include: { lines: true } },
          vendorBills: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return order;
    }),

  createPurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:create"))
    .input(
      z.object({
        vendorId: z.string(),
        currencyId: z.string(),
        orderDate: z.date().optional(),
        expectedReceiptDate: z.date().optional(),
        shipToWarehouseId: z.string().optional(),
        memo: z.string().optional(),
        vendorRefNumber: z.string().optional(),
        lines: z.array(
          z.object({
            itemId: z.string(),
            description: z.string().optional(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            taxRate: z.number().min(0).max(100).optional().default(0),
          })
        ).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lastPO = await ctx.prisma.purchaseOrder.findFirst({
        orderBy: { poNumber: "desc" },
      });
      const nextNumber = lastPO
        ? parseInt(lastPO.poNumber.replace("PO-", "")) + 1
        : 1001;
      const poNumber = `PO-${nextNumber}`;

      let subtotal = 0;
      const processedLines = input.lines.map((line, index) => {
        const amount = line.quantity * line.unitPrice;
        subtotal += amount;
        return {
          lineNumber: index + 1,
          itemId: line.itemId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate || 0,
          amount,
        };
      });

      const avgTaxRate =
        processedLines.reduce((sum, l) => sum + l.taxRate, 0) / processedLines.length;
      const taxAmount = subtotal * avgTaxRate / 100;
      const total = subtotal + taxAmount;

      const order = await ctx.prisma.purchaseOrder.create({
        data: {
          poNumber,
          vendorId: input.vendorId,
          currencyId: input.currencyId,
          createdById: ctx.session.user.id,
          orderDate: input.orderDate || new Date(),
          expectedReceiptDate: input.expectedReceiptDate,
          shipToWarehouseId: input.shipToWarehouseId,
          subtotal,
          taxAmount,
          total,
          memo: input.memo,
          vendorRefNumber: input.vendorRefNumber,
          lines: { create: processedLines },
        },
        include: {
          vendor: true,
          lines: { include: { item: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "PurchaseOrder",
          entityId: order.id,
          newValue: order as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "order",
          title: "Purchase Order Created",
          message: `${poNumber} created for ${order.vendor.companyName} — $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          link: `/purchasing/orders/${order.id}`,
        },
      });

      return order;
    }),

  updatePurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(
      z.object({
        id: z.string(),
        vendorId: z.string().optional(),
        currencyId: z.string().optional(),
        shipToWarehouseId: z.string().optional().nullable(),
        status: z.string().optional(),
        expectedReceiptDate: z.date().optional().nullable(),
        memo: z.string().optional().nullable(),
        vendorRefNumber: z.string().optional().nullable(),
        lines: z.array(
          z.object({
            itemId: z.string(),
            description: z.string().optional(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            taxRate: z.number().min(0).max(100).optional().default(0),
          })
        ).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, lines, ...data } = input;

      const oldOrder = await ctx.prisma.purchaseOrder.findUnique({
        where: { id },
        include: { lines: true },
      });
      if (!oldOrder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      }

      // Full line editing only allowed for draft/pending POs
      if (lines && oldOrder.status !== "draft" && oldOrder.status !== "pending_approval") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Line items can only be edited on draft or pending approval orders",
        });
      }

      let updateData: any = { ...data };

      // Recalculate totals if lines are provided
      if (lines && lines.length > 0) {
        let subtotal = 0;
        const processedLines = lines.map((line, index) => {
          const amount = line.quantity * line.unitPrice;
          subtotal += amount;
          return {
            lineNumber: index + 1,
            itemId: line.itemId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxRate: line.taxRate || 0,
            amount,
          };
        });

        const avgTaxRate =
          processedLines.reduce((sum, l) => sum + l.taxRate, 0) / processedLines.length;
        const taxAmount = subtotal * avgTaxRate / 100;
        const total = subtotal + taxAmount;

        // Delete existing lines and recreate
        await ctx.prisma.purchaseOrderLine.deleteMany({
          where: { purchaseOrderId: id },
        });

        updateData = {
          ...updateData,
          subtotal,
          taxAmount,
          total,
          lines: { create: processedLines },
        };
      }

      const order = await ctx.prisma.purchaseOrder.update({
        where: { id },
        data: updateData,
        include: {
          vendor: true,
          lines: { include: { item: true } },
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "PurchaseOrder",
          entityId: order.id,
          oldValue: oldOrder as any,
          newValue: order as any,
        },
      });

      return order;
    }),

  approvePurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.purchaseOrder.findUnique({ where: { id: input.id } });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      }

      if (order.status !== "draft" && order.status !== "pending_approval") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only draft or pending approval orders can be approved" });
      }

      const updatedOrder = await ctx.prisma.purchaseOrder.update({
        where: { id: input.id },
        data: { status: "approved" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "approve",
          entityType: "PurchaseOrder",
          entityId: input.id,
          oldValue: order as any,
          newValue: updatedOrder as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "approval",
          title: "Purchase Order Approved",
          message: `${order.poNumber} has been approved — $${Number(order.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          link: `/purchasing/orders/${input.id}`,
        },
      });

      return updatedOrder;
    }),

  receivePurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.purchaseOrder.findUnique({
        where: { id: input.id },
        include: { lines: true },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      }

      // Generate receipt number
      const lastReceipt = await ctx.prisma.itemReceipt.findFirst({
        orderBy: { receiptNumber: "desc" },
      });
      const nextNumber = lastReceipt
        ? parseInt(lastReceipt.receiptNumber.replace("IR-", "")) + 1
        : 10001;
      const receiptNumber = `IR-${nextNumber}`;

      // Create item receipt with all lines
      const receipt = await ctx.prisma.itemReceipt.create({
        data: {
          receiptNumber,
          purchaseOrderId: input.id,
          receiptDate: new Date(),
          status: "received",
          lines: {
            create: order.lines.map((line) => ({
              itemId: line.itemId,
              quantity: line.quantity,
            })),
          },
        },
      });

      // Update PO line quantities and status
      for (const line of order.lines) {
        await ctx.prisma.purchaseOrderLine.update({
          where: { id: line.id },
          data: { quantityReceived: line.quantity },
        });
      }

      const updatedOrder = await ctx.prisma.purchaseOrder.update({
        where: { id: input.id },
        data: { status: "received" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "receive",
          entityType: "PurchaseOrder",
          entityId: input.id,
          newValue: { ...updatedOrder, receiptNumber } as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "order",
          title: "Purchase Order Received",
          message: `${order.poNumber} items received — Receipt ${receiptNumber}`,
          link: `/purchasing/orders/${input.id}`,
        },
      });

      return { order: updatedOrder, receipt };
    }),

  closePurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.purchaseOrder.findUnique({ where: { id: input.id } });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      }

      const updatedOrder = await ctx.prisma.purchaseOrder.update({
        where: { id: input.id },
        data: { status: "closed" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "close",
          entityType: "PurchaseOrder",
          entityId: input.id,
          oldValue: order as any,
          newValue: updatedOrder as any,
        },
      });

      return updatedOrder;
    }),

  cancelPurchaseOrder: protectedProcedure
    .use(createPermissionMiddleware("purchasing:edit"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.purchaseOrder.findUnique({
        where: { id: input.id },
        include: { receipts: true },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Purchase order not found" });
      }

      if (order.receipts.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot cancel a purchase order that has receipts",
        });
      }

      const updatedOrder = await ctx.prisma.purchaseOrder.update({
        where: { id: input.id },
        data: { status: "cancelled" },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "cancel",
          entityType: "PurchaseOrder",
          entityId: input.id,
          oldValue: order as any,
          newValue: updatedOrder as any,
        },
      });

      // Create notification
      await ctx.prisma.notification.create({
        data: {
          userId: ctx.session.user.id,
          type: "alert",
          title: "Purchase Order Cancelled",
          message: `${order.poNumber} has been cancelled`,
          link: `/purchasing/orders/${input.id}`,
        },
      });

      return updatedOrder;
    }),

  // Vendor Bills
  getVendorBills: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        status: z.string().optional(),
        vendorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.status) where.status = input.status;
      if (input.vendorId) where.vendorId = input.vendorId;

      const [bills, total] = await Promise.all([
        ctx.prisma.vendorBill.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            vendor: true,
            currency: true,
          },
        }),
        ctx.prisma.vendorBill.count({ where }),
      ]);

      return { bills, total, pages: Math.ceil(total / input.limit) };
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure
    .use(createPermissionMiddleware("purchasing:view")).query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPOs,
      monthPOs,
      pendingPOs,
      openBills,
      overdueBills,
      monthSpend,
    ] = await Promise.all([
      ctx.prisma.purchaseOrder.count(),
      ctx.prisma.purchaseOrder.count({
        where: { orderDate: { gte: startOfMonth } },
      }),
      ctx.prisma.purchaseOrder.count({
        where: { status: { in: ["pending_approval", "approved", "sent"] } },
      }),
      ctx.prisma.vendorBill.count({
        where: { status: "open" },
      }),
      ctx.prisma.vendorBill.count({
        where: { status: "open", dueDate: { lt: now } },
      }),
      ctx.prisma.purchaseOrder.aggregate({
        where: { orderDate: { gte: startOfMonth } },
        _sum: { total: true },
      }),
    ]);

    return {
      totalPOs,
      monthPOs,
      pendingPOs,
      openBills,
      overdueBills,
      monthSpend: monthSpend._sum.total || 0,
    };
  }),
});
