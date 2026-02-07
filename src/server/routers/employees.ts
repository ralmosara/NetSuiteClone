import { z } from "zod";
import { router, protectedProcedure, createPermissionMiddleware } from "../trpc";
import { TRPCError } from "@trpc/server";

export const employeesRouter = router({
  getEmployees: protectedProcedure
    .use(createPermissionMiddleware("payroll:view"))
    .input(
      z.object({
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
        departmentId: z.string().optional(),
        status: z.string().optional(),
        employmentType: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.departmentId) where.departmentId = input.departmentId;
      if (input.status) where.status = input.status;
      if (input.employmentType) where.employmentType = input.employmentType;
      if (input.search) {
        where.OR = [
          { firstName: { contains: input.search, mode: "insensitive" } },
          { lastName: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { employeeId: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const [employees, total] = await Promise.all([
        ctx.prisma.employee.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          include: {
            department: true,
            subsidiary: true,
            supervisor: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        ctx.prisma.employee.count({ where }),
      ]);

      return { employees, total, pages: Math.ceil(total / input.limit) };
    }),

  getEmployee: protectedProcedure
    .use(createPermissionMiddleware("payroll:view"))
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.prisma.employee.findUnique({
        where: { id: input.id },
        include: {
          department: true,
          subsidiary: true,
          supervisor: true,
          directReports: {
            select: { id: true, firstName: true, lastName: true, jobTitle: true },
          },
          payslips: {
            take: 12,
            orderBy: { payDate: "desc" },
          },
          timeOffRequests: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          benefits: true,
        },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return employee;
    }),

  createEmployee: protectedProcedure
    .use(createPermissionMiddleware("payroll:create"))
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        dateOfBirth: z.date().optional(),
        gender: z.string().optional(),
        subsidiaryId: z.string().optional(),
        departmentId: z.string().optional(),
        jobTitle: z.string().optional(),
        supervisorId: z.string().optional(),
        hireDate: z.date(),
        employmentType: z.string().optional().default("full_time"),
        salary: z.number().optional(),
        salaryFrequency: z.string().optional(),
        address1: z.string().optional(),
        address2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        emergencyContactRelation: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lastEmployee = await ctx.prisma.employee.findFirst({
        orderBy: { employeeId: "desc" },
      });
      const nextNumber = lastEmployee
        ? parseInt(lastEmployee.employeeId.replace("EMP-", "")) + 1
        : 1001;
      const employeeId = `EMP-${nextNumber}`;

      const employee = await ctx.prisma.employee.create({
        data: {
          employeeId,
          ...input,
        },
        include: {
          department: true,
          subsidiary: true,
        },
      });

      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: "create",
          entityType: "Employee",
          entityId: employee.id,
          newValue: employee as any,
        },
      });

      return employee;
    }),

  updateEmployee: protectedProcedure
    .use(createPermissionMiddleware("payroll:edit"))
    .input(
      z.object({
        id: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        dateOfBirth: z.date().optional().nullable(),
        gender: z.string().optional().nullable(),
        maritalStatus: z.string().optional().nullable(),
        subsidiaryId: z.string().optional().nullable(),
        departmentId: z.string().optional().nullable(),
        jobTitle: z.string().optional().nullable(),
        supervisorId: z.string().optional().nullable(),
        terminationDate: z.date().optional().nullable(),
        employmentType: z.string().optional(),
        status: z.string().optional(),
        salary: z.number().optional().nullable(),
        salaryFrequency: z.string().optional().nullable(),
        address1: z.string().optional().nullable(),
        address2: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        postalCode: z.string().optional().nullable(),
        emergencyContactName: z.string().optional().nullable(),
        emergencyContactPhone: z.string().optional().nullable(),
        emergencyContactRelation: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const employee = await ctx.prisma.employee.update({
        where: { id },
        data,
        include: {
          department: true,
          subsidiary: true,
        },
      });

      return employee;
    }),

  // Departments
  getDepartments: protectedProcedure
    .use(createPermissionMiddleware("payroll:view")).query(async ({ ctx }) => {
    return ctx.prisma.department.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        _count: { select: { employees: true } },
      },
      orderBy: { name: "asc" },
    });
  }),

  // Time Off
  getTimeOffRequests: protectedProcedure
    .use(createPermissionMiddleware("payroll:view"))
    .input(
      z.object({
        employeeId: z.string().optional(),
        status: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.employeeId) where.employeeId = input.employeeId;
      if (input.status) where.status = input.status;

      const [requests, total] = await Promise.all([
        ctx.prisma.timeOffRequest.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        ctx.prisma.timeOffRequest.count({ where }),
      ]);

      return { requests, total, pages: Math.ceil(total / input.limit) };
    }),

  createTimeOffRequest: protectedProcedure
    .use(createPermissionMiddleware("payroll:create"))
    .input(
      z.object({
        employeeId: z.string(),
        requestType: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate business days
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      let days = 0;
      const current = new Date(start);
      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }

      return ctx.prisma.timeOffRequest.create({
        data: {
          ...input,
          totalDays: days,
        },
        include: { employee: true },
      });
    }),

  updateTimeOffRequestStatus: protectedProcedure
    .use(createPermissionMiddleware("payroll:edit"))
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["approved", "rejected", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.timeOffRequest.update({
        where: { id: input.id },
        data: {
          status: input.status,
          approvedById: ctx.session.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  // Payslips
  getPayslips: protectedProcedure
    .use(createPermissionMiddleware("payroll:view"))
    .input(
      z.object({
        employeeId: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where: any = {};
      if (input.employeeId) where.employeeId = input.employeeId;

      const [payslips, total] = await Promise.all([
        ctx.prisma.payslip.findMany({
          where,
          skip,
          take: input.limit,
          orderBy: { payDate: "desc" },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        ctx.prisma.payslip.count({ where }),
      ]);

      return { payslips, total, pages: Math.ceil(total / input.limit) };
    }),

  // Dashboard stats
  getDashboardStats: protectedProcedure
    .use(createPermissionMiddleware("payroll:view")).query(async ({ ctx }) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalEmployees,
      activeEmployees,
      departmentCounts,
      pendingTimeOff,
      newHires,
      turnoverCount,
    ] = await Promise.all([
      ctx.prisma.employee.count(),
      ctx.prisma.employee.count({ where: { status: "active" } }),
      ctx.prisma.employee.groupBy({
        by: ["departmentId"],
        _count: true,
        where: { status: "active" },
      }),
      ctx.prisma.timeOffRequest.count({ where: { status: "pending" } }),
      ctx.prisma.employee.count({
        where: { hireDate: { gte: startOfYear } },
      }),
      ctx.prisma.employee.count({
        where: { terminationDate: { gte: startOfYear } },
      }),
    ]);

    const turnoverRate = activeEmployees > 0
      ? (turnoverCount / activeEmployees) * 100
      : 0;

    return {
      totalEmployees,
      activeEmployees,
      departmentCounts,
      pendingTimeOff,
      newHires,
      turnoverRate,
    };
  }),
});
