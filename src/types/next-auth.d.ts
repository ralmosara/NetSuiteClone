import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      permissions: Array<{
        code: string;
        accessLevel: string;
      }>;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: Array<{
      code: string;
      accessLevel: string;
    }>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: Array<{
      code: string;
      accessLevel: string;
    }>;
  }
}
