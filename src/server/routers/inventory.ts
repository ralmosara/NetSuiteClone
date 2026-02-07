import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

export const inventoryRouter = router({
  // Items
  getItems: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        itemType: z.string().optional(),
        search: z.string().optional(),
        isActive: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = { isActive: input.isActive };
      if (input.itemType) where.itemType = input.itemType;
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { itemId: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        ctx.prisma.item.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { name: "asc" },
          include: {
            preferredVendor: true,
            stockLevels: {
              include: { location: { include: { warehouse: true } } },
            },
          },
        }),
        ctx.prisma.item.count({ where }),
      ]);

      // Calculate total stock for each item
      const itemsWithStock = items.map((item) => ({
        ...item,
        totalStock: item.stockLevels.reduce(
          (sum, sl) => sum + Number(sl.quantityOnHand),
          0
        ),
        availableStock: item.stockLevels.reduce(
          (sum, sl) => sum + Number(sl.quantityAvailable),
          0
        ),
      }));

      return { items: itemsWithStock, total, pages: Math.ceil(total / input.limit) };
    }),

  getItem: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { id: input.id },
        include: {
          preferredVendor: true,
          cogsAccount: true,
          incomeAccount: true,
          assetAccount: true,
          stockLevels: {
            include: { location: { include: { warehouse: true } } },
          },
          inventoryTransactions: {
            take: 20,
            orderBy: { transactionDate: "desc" },
            include: { location: true },
          },
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return item;
    }),

  createItem: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        name: z.string().min(1),
        displayName: z.string().optional(),
        description: z.string().optional(),
        itemType: z.string().optional().default("inventory"),
        basePrice: z.number().optional().default(0),
        cost: z.number().optional().default(0),
        trackInventory: z.boolean().optional().default(true),
        purchaseUnit: z.string().optional(),
        saleUnit: z.string().optional(),
        stockUnit: z.string().optional(),
        preferredVendorId: z.string().optional(),
        vendorCode: z.string().optional(),
        reorderPoint: z.number().optional(),
        preferredStockLevel: z.number().optional(),
        weight: z.number().optional(),
        weightUnit: z.string().optional(),
        isTaxable: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate item ID
      const lastItem = await ctx.prisma.item.findFirst({
        orderBy: { itemId: "desc" },
        where: { itemId: { startsWith: "SKU-" } },
      });
      const nextNumber = lastItem
        ? parseInt(lastItem.itemId.replace("SKU-", "")) + 1
        : 10001;
      const itemId = `SKU-${nextNumber}`;

      const item = await ctx.prisma.item.create({
        data: {
          itemId,
          ...input,
          displayName: input.displayName || input.name,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Item",
          entityId: item.id,
          newValue: item as any,
        },
      });

      return item;
    }),

  updateItem: protectedProcedure
    .use(createPermissionMiddleware("inventory:edit"))
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        itemType: z.string().optional(),
        basePrice: z.number().optional(),
        cost: z.number().optional(),
        trackInventory: z.boolean().optional(),
        purchaseUnit: z.string().optional(),
        saleUnit: z.string().optional(),
        stockUnit: z.string().optional(),
        preferredVendorId: z.string().optional().nullable(),
        vendorCode: z.string().optional().nullable(),
        reorderPoint: z.number().optional().nullable(),
        preferredStockLevel: z.number().optional().nullable(),
        weight: z.number().optional().nullable(),
        weightUnit: z.string().optional().nullable(),
        isTaxable: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldItem = await ctx.prisma.item.findUnique({ where: { id } });
      if (!oldItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const item = await ctx.prisma.item.update({
        where: { id },
        data,
        include: {
          preferredVendor: true,
          stockLevels: true,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Item",
          entityId: item.id,
          oldValue: oldItem as any,
          newValue: item as any,
        },
      });

      return item;
    }),

  deleteItem: protectedProcedure
    .use(createPermissionMiddleware("inventory:delete"))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { id: input.id },
        include: {
          stockLevels: { take: 1 },
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const hasStock = item.stockLevels.length > 0 && item.stockLevels.some(sl => Number(sl.quantityOnHand) > 0);

      if (hasStock) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete item with existing stock. Deactivate instead.",
        });
      }

      await ctx.prisma.item.delete({ where: { id: input.id } });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "delete",
          entityType: "Item",
          entityId: input.id,
          oldValue: item as any,
        },
      });

      return { success: true };
    }),

  // Warehouses
  getWarehouses: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      const warehouses = await ctx.prisma.warehouse.findMany({
        where: { isActive: true },
        include: {
          subsidiary: true,
          locations: true,
          _count: { select: { locations: true } },
        },
        orderBy: { name: "asc" },
      });
      return { warehouses };
    }),

  getWarehouse: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const warehouse = await ctx.prisma.warehouse.findUnique({
        where: { id: input.id },
        include: {
          subsidiary: true,
          locations: {
            include: {
              stockLevels: { include: { item: true } },
            },
          },
        },
      });

      if (!warehouse) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return warehouse;
    }),

  createWarehouse: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        subsidiaryId: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.warehouse.findUnique({
        where: { code: input.code },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Warehouse code already exists",
        });
      }

      const warehouse = await ctx.prisma.warehouse.create({
        data: input,
        include: { subsidiary: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Warehouse",
          entityId: warehouse.id,
          newValue: warehouse as any,
        },
      });

      return warehouse;
    }),

  updateWarehouse: protectedProcedure
    .use(createPermissionMiddleware("inventory:edit"))
    .input(
      z.object({
        id: z.string(),
        code: z.string().optional(),
        name: z.string().optional(),
        subsidiaryId: z.string().optional().nullable(),
        address1: z.string().optional().nullable(),
        address2: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const oldWarehouse = await ctx.prisma.warehouse.findUnique({ where: { id } });
      if (!oldWarehouse) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Warehouse not found" });
      }

      const warehouse = await ctx.prisma.warehouse.update({
        where: { id },
        data,
        include: { subsidiary: true, locations: true },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "update",
          entityType: "Warehouse",
          entityId: warehouse.id,
          oldValue: oldWarehouse as any,
          newValue: warehouse as any,
        },
      });

      return warehouse;
    }),

  createLocation: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        warehouseId: z.string(),
        code: z.string().min(1),
        name: z.string().min(1),
        aisle: z.string().optional(),
        rack: z.string().optional(),
        shelf: z.string().optional(),
        bin: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.create({
        data: input,
        include: { warehouse: true },
      });

      return location;
    }),

  // Stock Levels
  getStockLevels: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(
      z.object({
        warehouseId: z.string().optional(),
        itemId: z.string().optional(),
        lowStock: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};
      if (input.itemId) where.itemId = input.itemId;
      if (input.warehouseId) {
        where.location = { warehouseId: input.warehouseId };
      }

      const stockLevels = await ctx.prisma.stockLevel.findMany({
        where,
        include: {
          item: true,
          location: { include: { warehouse: true } },
        },
      });

      if (input.lowStock) {
        return stockLevels.filter((sl) => {
          const reorderPoint = Number(sl.item.reorderPoint) || 0;
          return Number(sl.quantityOnHand) <= reorderPoint;
        });
      }

      return stockLevels;
    }),

  // Inventory Adjustment
  createAdjustment: protectedProcedure
    .use(createPermissionMiddleware("inventory:create"))
    .input(
      z.object({
        itemId: z.string(),
        locationId: z.string(),
        quantity: z.number(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate transaction ID
      const lastTx = await ctx.prisma.inventoryTransaction.findFirst({
        orderBy: { transactionId: "desc" },
      });
      const nextNumber = lastTx
        ? parseInt(lastTx.transactionId.replace("IT-", "")) + 1
        : 10001;
      const transactionId = `IT-${nextNumber}`;

      // Create inventory transaction
      const transaction = await ctx.prisma.inventoryTransaction.create({
        data: {
          transactionId,
          itemId: input.itemId,
          locationId: input.locationId,
          transactionType: "adjustment",
          quantity: input.quantity,
          memo: input.memo,
        },
      });

      // Update or create stock level
      const existingStock = await ctx.prisma.stockLevel.findUnique({
        where: {
          itemId_locationId: {
            itemId: input.itemId,
            locationId: input.locationId,
          },
        },
      });

      if (existingStock) {
        await ctx.prisma.stockLevel.update({
          where: { id: existingStock.id },
          data: {
            quantityOnHand: { increment: input.quantity },
            quantityAvailable: { increment: input.quantity },
          },
        });
      } else {
        await ctx.prisma.stockLevel.create({
          data: {
            itemId: input.itemId,
            locationId: input.locationId,
            quantityOnHand: input.quantity,
            quantityAvailable: input.quantity,
          },
        });
      }

      return transaction;
    }),

  // Search items for autocomplete
  searchItems: protectedProcedure
    .use(createPermissionMiddleware("inventory:view"))
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.item.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { itemId: { contains: input.query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        take: 10,
        select: {
          id: true,
          itemId: true,
          name: true,
          basePrice: true,
          cost: true,
          itemType: true,
        },
      });
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure
    .use(createPermissionMiddleware("inventory:view")).query(async ({ ctx }) => {
    const [
      totalItems,
      activeItems,
      totalWarehouses,
      stockWithItems,
    ] = await Promise.all([
      ctx.prisma.item.count(),
      ctx.prisma.item.count({ where: { isActive: true } }),
      ctx.prisma.warehouse.count({ where: { isActive: true } }),
      ctx.prisma.stockLevel.findMany({
        include: { item: true },
      }),
    ]);

    // Calculate low stock items (where quantityOnHand <= item's reorderPoint)
    const lowStockItems = stockWithItems.filter(
      (sl) => sl.item.reorderPoint && Number(sl.quantityOnHand) <= Number(sl.item.reorderPoint)
    ).length;

    // Calculate total inventory value
    const totalValue = stockWithItems.reduce(
      (sum, sl) => sum + Number(sl.quantityOnHand) * Number(sl.item.cost),
      0
    );

    return {
      totalItems,
      activeItems,
      lowStockItems,
      totalWarehouses,
      totalValue,
    };
  }),
});
