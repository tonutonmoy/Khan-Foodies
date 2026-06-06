import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  });

const token = process.env.META_ACCESS_TOKEN;
if (!token) {
  console.error('META_ACCESS_TOKEN missing in .env');
  process.exit(1);
}

const ids = [
  { label: 'META_DATASET_ID', id: process.env.META_DATASET_ID },
  { label: 'META_PIXEL_ID', id: process.env.META_PIXEL_ID },
  { label: 'OLD_PIXEL', id: '1317500153169434' },
].filter((x) => x.id);

async function testEvent(label: string, pixelId: string, withUserData: boolean) {
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: 'ViewContent',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: `test_${Date.now()}`,
        custom_data: {
          currency: 'BDT',
          value: 100,
          content_ids: ['test-product-1'],
          content_type: 'product',
        },
        ...(withUserData
          ? {
              user_data: {
                client_ip_address: '103.123.45.67',
                client_user_agent:
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
              },
            }
          : {}),
      },
    ],
  };

  const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token!)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  console.log(`\n[${label}] withUserData=${withUserData} ID=${pixelId}`);
  console.log(`Status: ${response.status}`);
  console.log(JSON.stringify(result, null, 2));
}

(async () => {
  const datasetId = process.env.META_DATASET_ID!;
  await testEvent('DATASET', datasetId, false);
  await testEvent('DATASET', datasetId, true);
})();
