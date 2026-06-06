import { readFileSync } from 'fs';
import { resolve } from 'path';
import { trackMetaAddToCart, trackMetaPurchase } from '../lib/meta-capi';

readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  });

async function main() {
  console.log('=== AddToCart (simulated product) ===');
  const add = await trackMetaAddToCart(
    [{ productId: 'prod-test-1', name: 'Test Mango', price: 500, quantity: 1, category: 'Mango' }],
    500
  );
  console.log(add.ok ? '✅ AddToCart sent' : `❌ AddToCart failed: ${add.error}`);

  console.log('\n=== Purchase (simulated order) ===');
  const purchase = await trackMetaPurchase(
    `order-test-${Date.now()}`,
    580,
    [{ productId: 'prod-test-1', name: 'Test Mango', price: 500, quantity: 1 }],
    { name: 'Test User', phone: '01712345678' }
  );
  console.log(purchase.ok ? '✅ Purchase sent' : `❌ Purchase failed: ${purchase.error}`);

  console.log('\nNote: Without browser IP/UA from headers(), events may be skipped.');
  console.log('Real user actions from the site include IP + User-Agent automatically.');
}

main();
