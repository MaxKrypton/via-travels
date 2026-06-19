import { seedBatch2 } from './seed-tourism-entries';
import { seedBatch3 } from './seed-tourism-entries-batch3';

type SeedTarget = 'all' | 'batch2' | 'batch3';

const validTargets = new Set<SeedTarget>(['all', 'batch2', 'batch3']);

function getTarget(): SeedTarget {
  const target = (process.argv[2] ?? 'all').toLowerCase() as SeedTarget;

  if (!validTargets.has(target)) {
    console.error(`Unknown seed target "${target}". Use one of: all, batch2, batch3.`);
    process.exit(1);
  }

  return target;
}

async function run() {
  const target = getTarget();

  if (target === 'all' || target === 'batch2') {
    await seedBatch2();
  }

  if (target === 'all' || target === 'batch3') {
    await seedBatch3();
  }

  console.log('Tourism seed completed.');
}

run().catch((error) => {
  console.error('Tourism seed failed:', error);
  process.exit(1);
});
