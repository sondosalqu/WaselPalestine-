import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

const latency = new Trend("write_latency");
const errorRate = new Rate("error_rate");
const writes = new Counter("writes");

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "3m", target: 40 },
    { duration: "1m", target: 0 },
  ],
};

const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoxLCJpYXQiOjE3NzU1ODIyNjcsImV4cCI6MTc3NTU4MzE2N30.U70AbsuEI5z-6TqkWpsRKbg9vo4CkpGqezRaW1zrcE8";

export default function () {
const payload = JSON.stringify({
  category: "accident",
  description: `test report ${Date.now()} ${Math.random()}`,
  report_lat: 31.9 + Math.random() * 0.01,
  report_lng: 35.2 + Math.random() * 0.01,
});
  const res = http.post(
    `${BASE_URL}/api/v1/reports`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  latency.add(res.timings.duration);
  writes.add(1);

  const ok = check(res, {
    "created": (r) => r.status === 201 || r.status === 409,
  });

  errorRate.add(ok ? 0 : 1);

  sleep(1);
}