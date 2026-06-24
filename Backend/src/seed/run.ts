import fs from 'fs/promises';
import path from 'path';
import postgres from 'postgres';
import { seedBatch2 } from './seed-tourism-entries';
import { seedBatch3 } from './seed-tourism-entries-batch3';

type SeedTarget = 'all' | 'batch2' | 'batch3' | 'accommodation' | 'planning-prices';

const validTargets = new Set<SeedTarget>(['all', 'batch2', 'batch3', 'accommodation', 'planning-prices']);

function getTarget(): SeedTarget {
  const target = (process.argv[2] ?? 'all').toLowerCase() as SeedTarget;

  if (!validTargets.has(target)) {
    console.error(`Unknown seed target "${target}". Use one of: all, batch2, batch3, accommodation, planning-prices.`);
    process.exit(1);
  }

  return target;
}

async function runSqlSeed(seedFile: string) {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error('NEON_DATABASE_URL is missing. Check Backend/.env.');
  }

  const seedPath = path.join(__dirname, seedFile);
  const seedSql = await fs.readFile(seedPath, 'utf8');
  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    const result = await sql.unsafe(seedSql);
    console.log(`Applied ${seedFile}; affected ${result.count ?? 0} rows.`);
  } finally {
    await sql.end();
  }
}

async function seedAccommodation() {
  await runSqlSeed('accommodation-tourism-entries.sql');
}

async function seedPlanningPrices() {
  await runSqlSeed('planning-prices.sql');
}

async function run() {
  const target = getTarget();

  if (target === 'all' || target === 'batch2') {
    await seedBatch2();
  }

  if (target === 'all' || target === 'batch3') {
    await seedBatch3();
  }

  if (target === 'all' || target === 'accommodation') {
    await seedAccommodation();
  }

  if (target === 'planning-prices') {
    await seedPlanningPrices();
  }

  console.log('Tourism seed completed.');
}

run().catch((error) => {
  console.error('Tourism seed failed:', error);
  process.exit(1);
});
