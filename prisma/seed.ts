import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "zacaree@gmail.com";
  const firstName = "Zac";
  const lastName = "Remboldt";
  const dob = "1987-01-01";
  const address = "1234 Main St";
  const pni = true;
  const hashedPassword = await bcrypt.hash("rootroot", 10);

  // cleanup the existing database
  // await prisma.user.delete({ where: { email } }).catch(() => {
  // no worries if it doesn't exist yet
  // });

  const account = await prisma.account.create({
    data: {},
  });

  const accountId = account.id;

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      pni,
      dob,
      address,
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      account: {
        connect: {
          id: accountId,
        },
      },
    },
  });

  // await prisma.note.create({
  //   data: {
  //     title: "My first note",
  //     body: "Hello, world!",
  //     userId: user.id,
  //   },
  // });

  // await prisma.note.create({
  //   data: {
  //     title: "My second note",
  //     body: "Hello, world!",
  //     userId: user.id,
  //   },
  // });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
