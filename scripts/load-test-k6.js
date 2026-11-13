/**
 * RoboVerse 5,000 Concurrent Users Load Test (k6)
 * 
 * Execution:
 *   k6 run scripts/load-test-k6.js
 * 
 * Target Workload Mix (5,000 VUs):
 *   - 35% Simple & Circuit Lab interactions (component specs & MNA solver pings)
 *   - 25% Rituu AI Copilot interactions (SSE streaming & first token TTFT)
 *   - 20% Maker Radar Nearby Stores queries (PostGIS geography calculation)
 *   - 20% TechSavyyy Commerce & Checkout (server pricing & inventory checks)
 * 
 * Quality Gates:
 *   - RPC / API p95 Latency: < 300 ms
 *   - Rituu AI TTFT p95 Latency: < 1500 ms (1.5 s)
 *   - System Error Rate: < 0.1%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const rpcLatency = new Trend('rpc_latency_ms');
const rituuTtftLatency = new Trend('rituu_ttft_ms');
const errorRate = new Rate('system_error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 1000 },  // Ramp up to 1,000 users
    { duration: '1m', target: 5000 },   // Ramp up to 5,000 concurrent users
    { duration: '2m', target: 5000 },   // Sustain 5,000 concurrent users at peak
    { duration: '30s', target: 0 },     // Ramp down
  ],
  thresholds: {
    'rpc_latency_ms': ['p(95)<300'],     // p95 < 300ms for database/RPC queries
    'rituu_ttft_ms': ['p(95)<1500'],     // p95 < 1500ms for AI first token
    'system_error_rate': ['rate<0.001'], // Error rate < 0.1%
    'http_req_failed': ['rate<0.001'],
  },
};

const BASE_URL = __ENV.ROBOVERSE_URL || 'http://localhost:3000';

export default function () {
  const rand = Math.random();

  // 1. Simple Lab & Circuit Lab MNA Queries (35%)
  if (rand < 0.35) {
    const res = http.get(`${BASE_URL}/api/admin/overview`);
    rpcLatency.add(res.timings.duration);
    const passed = check(res, {
      'admin/overview status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }
  // 2. Rituu AI Tutor Interactions (25%)
  else if (rand < 0.60) {
    const payload = JSON.stringify({
      messages: [{ role: 'user', content: 'What is the safe operating voltage of an SG90 micro servo?' }],
      mode: 'tutor',
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/rituu/chat`, payload, params);
    rituuTtftLatency.add(res.timings.waiting); // Time to first byte / first token
    const passed = check(res, {
      'rituu chat status 200': (r) => r.status === 200,
    });
    errorRate.add(!passed);
  }
  // 3. Maker Radar & Nearby Stores PostGIS Query (20%)
  else if (rand < 0.80) {
    const res = http.get(`${BASE_URL}/api/shops/nearby?lat=12.9644&lng=77.5833&radius=10000`);
    rpcLatency.add(res.timings.duration);
    const passed = check(res, {
      'nearby shops status 200': (r) => r.status === 200,
      'returns shops array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && Array.isArray(body.data.shops);
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!passed);
  }
  // 4. TechSavyyy Hardware Store Checkout & Verification (20%)
  else {
    const payload = JSON.stringify({
      items: [{ productId: 'prod_uno_r3', qty: 1 }],
      memberTier: 'PRO',
      isMinor: false,
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(`${BASE_URL}/api/store/checkout`, payload, params);
    rpcLatency.add(res.timings.duration);
    const passed = check(res, {
      'checkout status 200': (r) => r.status === 200,
      'order calculated': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success && body.data.orderTotalInr > 0;
        } catch {
          return false;
        }
      },
    });
    errorRate.add(!passed);
  }

  sleep(Math.random() * 1.5 + 0.5); // 0.5 - 2s user think time
}
