import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "5m",
};

const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoxLCJpYXQiOjE3NzU1ODQyNjAsImV4cCI6MTc3NTU4NTE2MH0._OYdk2unfkYzz1PkwYP3Yu2K1r1JLPzxt1TYd0O4X-4";

export default function () {
  if (Math.random() < 0.7) {
    const res = http.get(
      `${BASE_URL}/api/v1/incidents`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );

    check(res, { "read ok": (r) => r.status === 200 });
  } else {
   const res = http.post(
  `${BASE_URL}/api/v1/reports`,
  JSON.stringify({
    category: "accident",
    description: `mixed test ${Date.now()} ${Math.random()}`,
    report_lat: 31.9 + Math.random() * 0.01,
    report_lng: 35.2 + Math.random() * 0.01,
  }),
  {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  }
);
    check(res, { "write ok": (r) => r.status === 201 || r.status === 409 });
  }

  sleep(1);
}