import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '2m',
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/incidents?page=1&limit=10');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}