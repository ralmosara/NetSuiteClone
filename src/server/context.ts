import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    prisma,
    session,
    headers: opts.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
