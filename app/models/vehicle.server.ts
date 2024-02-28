import type { Account, User, Vehicle } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Vehicle } from "@prisma/client";

export function getVehicle({
  id,
  accountId,
}: Pick<Vehicle, "id"> & {
  accountId: Account["id"];
}) {
  return prisma.vehicle.findFirst({
    select: { id: true, year: true, make: true, model: true },
    where: { id, accountId },
  });
}

export function getVehicleListItems({
  accountId,
}: {
  accountId: Account["id"];
}) {
  return prisma.vehicle.findMany({
    where: { accountId },
    select: {
      id: true,
      year: true,
      make: true,
      model: true,
      vin: true,
      includedOnPolicy: true,
    },
    orderBy: { id: "desc" },
  });
}

export function createVehicle({
  year,
  make,
  model,
  vin,
  accountId,
  includedOnPolicy,
}: Pick<Vehicle, "year" | "make" | "model" | "vin" | "includedOnPolicy"> & {
  accountId: Account["id"];
}) {
  return prisma.vehicle.create({
    data: {
      year,
      make,
      model,
      vin,
      includedOnPolicy,
      account: {
        connect: {
          id: accountId,
        },
      },
    },
  });
}

export async function updateVehicle<T extends keyof Vehicle>(
  id: Vehicle["id"],
  column: T,
  value: Vehicle[T],
) {
  const data: Partial<Vehicle> = {};
  data[column] = value;

  return prisma.vehicle.update({
    where: { id },
    data,
  });
}

export function deleteVehicle({
  id,
  accountId,
}: Pick<Vehicle, "id"> & { accountId: Account["id"] }) {
  return prisma.vehicle.deleteMany({
    where: { id, accountId },
  });
}
