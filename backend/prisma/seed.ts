import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let org = await prisma.organization.findUnique({ where: { id: 'clztimw2c00017isj34j6byr3' } });
  if (!org) {
    org = await prisma.organization.create({
      data: { id: 'clztimw2c00017isj34j6byr3' },
    });
  }

  await prisma.mergeTag.createMany({
    data: [
      {
        orgId: org.id,
        key: 'user.first_name',
        label: 'First Name',
        default_value: 'John',
      },
      {
        orgId: org.id,
        key: 'user.last_name',
        label: 'Last Name',
        default_value: 'Doe',
      },
      {
        orgId: org.id,
        key: 'user.email',
        label: 'Email',
        default_value: 'john.doe@example.com',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
