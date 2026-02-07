import { router } from "../trpc";
import { authRouter } from "./auth";
import { salesRouter } from "./sales";
import { customersRouter } from "./customers";
import { purchasingRouter } from "./purchasing";
import { inventoryRouter } from "./inventory";
import { financeRouter } from "./finance";
import { employeesRouter } from "./employees";
import { reportsRouter } from "./reports";
import { setupRouter } from "./setup";
import { manufacturingRouter } from "./manufacturing";
import { crmRouter } from "./crm";

export const appRouter = router({
  auth: authRouter,
  sales: salesRouter,
  customers: customersRouter,
  purchasing: purchasingRouter,
  inventory: inventoryRouter,
  finance: financeRouter,
  employees: employeesRouter,
  reports: reportsRouter,
  setup: setupRouter,
  manufacturing: manufacturingRouter,
  crm: crmRouter,
});

export type AppRouter = typeof appRouter;
