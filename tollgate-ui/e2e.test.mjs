const ENDPOINT = 'http://localhost:8080/api/test';
const CONCURRENT_REQUESTS = 100;

async function runTest() {
  console.log(`Sending ${CONCURRENT_REQUESTS} concurrent requests to ${ENDPOINT}...`);
  
  const promises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(fetch(ENDPOINT).catch(() => ({ status: 500 })));
  }

  const results = await Promise.all(promises);
  
  let successCount = 0;
  let rateLimitedCount = 0;
  let errorCount = 0;

  for (const res of results) {
    if (res.status === 200) successCount++;
    else if (res.status === 429) rateLimitedCount++;
    else errorCount++;
  }

  console.log(`\n--- Test Results ---`);
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`200 OK (Allowed): ${successCount}`);
  console.log(`429 Too Many Requests (Blocked): ${rateLimitedCount}`);
  if (errorCount > 0) {
    console.log(`500/Errors: ${errorCount}`);
  }
  
  if (rateLimitedCount > 0) {
    console.log(`\n✅ Rate limiter works beautifully!`);
    process.exit(0);
  } else {
    console.log(`\n❌ Failed: No requests were rate limited.`);
    process.exit(1);
  }
}

runTest();
