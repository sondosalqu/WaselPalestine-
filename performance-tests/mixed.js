import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 30,
  duration: '40s',
};

export default function () {
  const getRes = http.get('http://localhost:3000/api/v1/incidents?page=1&limit=10');

  check(getRes, {
    'GET status is 200': (r) => r.status === 200,
  });

  const payload = JSON.stringify({
    type_id: 1,
    severity: 'LOW',
    description: 'k6 mixed test incident',
    checkpoint_id: 1
  });

const params = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoxLCJpYXQiOjE3NzMyODU0MDIsImV4cCI6MTc3MzI4NjMwMn0.-3OcBxt1wiNsY2OnxuY1GP_C5XJSjJypnxwmDknM7BI'
  },
};

  const postRes = http.post('http://localhost:3000/api/v1/incidents', payload, params);

  check(postRes, {
    'POST status is 201': (r) => r.status === 201,
  });

  sleep(1);
}