import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 50 },
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/incidents?page=1&limit=10');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}