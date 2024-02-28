import type { Account, Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser({
  firstName,
  lastName,
  accountId,
  pni,
}: {
  firstName: User["firstName"];
  lastName: User["lastName"];
  accountId: User["accountId"];
  pni: User["pni"];
}) {
  return prisma.user.create({
    data: {
      firstName,
      lastName,
      pni,
      account: {
        connect: {
          id: accountId,
        },
      },
    },
  });
}

export async function updateUser<T extends keyof User>(
  id: User["id"],
  column: T,
  value: User[T],
) {
  const data: Partial<User> = {};
  data[column] = value;

  return prisma.user.update({
    where: { id },
    data,
  });
}

export function getUsersOnAccount({ accountId }: { accountId: Account["id"] }) {
  return prisma.user.findMany({
    where: { accountId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      pni: true,
      includedOnPolicy: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUserPassword(id: User["id"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.update({
    where: { id },
    data: {
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

// export async function createUser(email: User["email"], password: string) {
//   const hashedPassword = await bcrypt.hash(password, 10);

//   return prisma.user.create({
//     data: {
//       email,
//       password: {
//         create: {
//           hash: hashedPassword,
//         },
//       },
//     },
//   });
// }

// export async function deleteUserByEmail(email: User["email"]) {
//   return prisma.user.delete({ where: { email } });
// }

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
