import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
};

export default function () {

  const payload = JSON.stringify({
    type_id: 1,
    severity: "LOW",
    description: "Load test incident",
    checkpoint_id: 1
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
  };

  let res = http.post('http://localhost:3000/api/v1/incidents', payload, params);

  check(res, { 'incident created': (r) => r.status === 201 });

  sleep(1);
}