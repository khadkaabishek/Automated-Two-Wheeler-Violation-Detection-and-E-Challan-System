import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ROLES } from '../constants/roles.js';
import { PERMISSION_DEFINITIONS, PERMISSIONS } from '../constants/permissions.js';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// Which permissions each role gets by default. Super Admin gets everything.
const ROLE_PERMISSION_MAP = {
  [ROLES.SUPER_ADMIN]: 'ALL',
  [ROLES.TRAFFIC_POLICE]: [
    PERMISSIONS.VEHICLE_READ,
    PERMISSIONS.OWNER_READ,
    PERMISSIONS.CHALLAN_CREATE, PERMISSIONS.CHALLAN_READ, PERMISSIONS.CHALLAN_UPDATE,
    PERMISSIONS.VIOLATION_READ,
    // Traffic Police reviews and approves/rejects citizen-submitted payment requests.
    PERMISSIONS.PAYMENT_READ, PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.LIVE_MONITORING_READ, PERMISSIONS.LIVE_MONITORING_CREATE,
  ],
  [ROLES.VEHICLE_OWNER]: [
    // VEHICLE_CREATE lets them self-register a vehicle (always starts PENDING_APPROVAL;
    // service layer forces the owner to be their own linked profile, never someone else's).
    PERMISSIONS.VEHICLE_CREATE, PERMISSIONS.VEHICLE_READ,
    PERMISSIONS.CHALLAN_READ,
    PERMISSIONS.PAYMENT_CREATE, PERMISSIONS.PAYMENT_READ,
  ],
};

const DEFAULT_VIOLATIONS = [
  { name: 'No Helmet', description: 'Rider or pillion not wearing a helmet', fineAmount: 500 },
  { name: 'Triple Riding', description: 'More than two persons on a two-wheeler', fineAmount: 700 },
  { name: 'Overspeed', description: 'Driving above the posted speed limit', fineAmount: 1500 },
  { name: 'Wrong Parking', description: 'Parking in a no-parking zone', fineAmount: 300 },
  { name: 'No Seat Belt', description: 'Driver or passenger not wearing a seat belt', fineAmount: 500 },
  { name: 'Red Light Jump', description: 'Crossing an intersection on a red signal', fineAmount: 2000 },
  { name: 'No License', description: 'Driving without a valid license', fineAmount: 3000 },
];

async function main() {
  console.log('Seeding permissions...');
  await prisma.permission.createMany({ data: PERMISSION_DEFINITIONS, skipDuplicates: true });
  const allPermissions = await prisma.permission.findMany();
  const permissionByName = new Map(allPermissions.map((p) => [p.name, p]));

  console.log('Seeding roles...');
  const roleRecords = {};
  for (const roleName of Object.values(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, isSystem: true, description: `${roleName} role` },
    });
    roleRecords[roleName] = role;
  }

  console.log('Assigning permissions to roles...');
  for (const [roleName, permList] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = roleRecords[roleName];
    const permissionIds =
      permList === 'ALL'
        ? allPermissions.map((p) => p.id)
        : permList.map((name) => permissionByName.get(name)?.id).filter(Boolean);

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
      skipDuplicates: true,
    });
  }

  console.log('Seeding default violations...');
  for (const violation of DEFAULT_VIOLATIONS) {
    await prisma.violation.upsert({
      where: { name: violation.name },
      update: {},
      create: violation,
    });
  }

  console.log('Seeding default Super Admin user...');
  const superAdminEmail = process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@smarttraffic.gov.np';
  const superAdminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const hashedPassword = await bcrypt.hash(superAdminPassword, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      fullName: 'System Super Admin',
      email: superAdminEmail,
      phone: '9800000000',
      password: hashedPassword,
      roleId: roleRecords[ROLES.SUPER_ADMIN].id,
      status: 'ACTIVE',
      isEmailVerified: true,
    },
  });

  console.log('\nSeed complete.');
  console.log(`Super Admin login -> email: ${superAdminEmail} | password: ${superAdminPassword}`);
  console.log('IMPORTANT: change this password immediately in any non-local environment.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
