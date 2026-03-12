import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  const requests = [
    `${BASE_URL}/incidents?page=1&limit=10`,
    `${BASE_URL}/incidents?page=2&limit=10`,
    `${BASE_URL}/incidents?page=1&limit=20`,
    `${BASE_URL}/incidents?page=1&limit=10&severity=LOW`,
    `${BASE_URL}/incidents?page=1&limit=10&severity=MEDIUM`,
  ];

  const url = requests[Math.floor(Math.random() * requests.length)];
  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response body not empty': (r) => r.body && r.body.length > 0,
  });

  sleep(1);
}