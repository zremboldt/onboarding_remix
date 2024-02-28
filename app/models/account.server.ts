import type { Password, Account } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { Account } from "@prisma/client";

export async function getAccountById(id: Account["id"]) {
  return prisma.account.findUnique({ where: { id } });
}

export async function createAccount() {
  return prisma.account.create({
    data: {},
  });
}

export async function accountHasVehicles(id: Account["id"]): Promise<boolean> {
  const account = await prisma.account.findUnique({
    where: { id },
    include: { vehicles: true },
  });

  if (account && account.vehicles.length > 0) {
    return true;
  }

  return false;
}
