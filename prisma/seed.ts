import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await hash("Admin123!", 10);
  console.log("hashedPassword", hashedPassword)

  const admin = await prisma.user.upsert({
    where: { email: "jaradtryffin23@gmail.com" },
    update: {},
    create: {
      name: "Jarad",
      email: "jaradtryffin23@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Created admin user: ${admin.name}`);

  // Create workstations
  const reception = await prisma.workstation.upsert({
    where: { name: "Reception" },
    update: {},
    create: {
      name: "Reception",
      hasTerminal: true,
      isTillEnabled: true,
    },
  });

  const dispense = await prisma.workstation.upsert({
    where: { name: "Dispense" },
    update: {},
    create: {
      name: "Dispense",
      hasTerminal: false,
      isTillEnabled: false,
    },
  });

  console.log(`Created workstations: ${reception.name}, ${dispense.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
