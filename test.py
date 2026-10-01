import urllib.request
import urllib.error
import concurrent.futures
import time

url = "http://localhost:8080/api/test"

def make_request(req_id):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            status = response.status
            remaining = response.getheader('X-RateLimit-Remaining')
    except urllib.error.HTTPError as e:
        status = e.code
        remaining = e.headers.get('X-RateLimit-Remaining')
    except Exception as e:
        status = str(e)
        remaining = 'N/A'
    return req_id, status, remaining

print("Sending 20 concurrent requests to the Rate Limiter...")
start_time = time.time()

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    futures = [executor.submit(make_request, i+1) for i in range(20)]
    for future in concurrent.futures.as_completed(futures):
        results.append(future.result())

end_time = time.time()

print(f"\nAll requests completed in {end_time - start_time:.2f} seconds.")
print("-" * 45)
print(f"{'Req ID':<8} | {'Status':<10} | {'Tokens Remaining':<18}")
print("-" * 45)

results.sort(key=lambda x: x[0])
for req_id, status, remaining in results:
    print(f"{req_id:<8} | {status:<10} | {str(remaining):<18}")

print("-" * 45)
print("Summary:")
status_counts = {}
for _, status, _ in results:
    status_counts[status] = status_counts.get(status, 0) + 1

for status, count in status_counts.items():
    if status == 429:
        print(f"[RATE LIMITED]  HTTP 429: {count} requests")
    elif status == 404:
        print(f"[ALLOWED]       HTTP 404: {count} requests (Proxy to Nginx)")
    else:
        print(f"                HTTP {status}: {count} requests")
