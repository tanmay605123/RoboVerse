const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const apiRoot = path.resolve(__dirname, '..');
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

async function main() {
  const [{ planTable }] = await prisma.$queryRawUnsafe(
    `SELECT to_regclass('public."Plan"')::text AS "planTable"`
  );

  if (planTable) {
    console.log('✅ Prisma backend schema already exists.');
    return;
  }

  console.log('🛠️ Creating missing Prisma backend tables without touching Supabase tables...');
  const sql = execFileSync(
    npx,
    ['prisma', 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'],
    { cwd: apiRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
  );

  execFileSync(npx, ['prisma', 'db', 'execute', '--stdin'], {
    cwd: apiRoot,
    input: sql,
    encoding: 'utf8',
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  console.log('✅ Prisma backend schema created.');
}

main()
  .catch((error) => {
    console.error('❌ Prisma backend schema bootstrap failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
