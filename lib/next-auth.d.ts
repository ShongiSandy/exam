import { UserRole, Tier } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tier: Tier;
  }

  interface Session {
    user: User & {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      tier: Tier;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    tier: Tier;
  }
}