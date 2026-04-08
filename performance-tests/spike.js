import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 10 },
    { duration: "30s", target: 0 },
  ],
};

const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoxLCJpYXQiOjE3NzU1NzI3MjAsImV4cCI6MTc3NTU3MzYyMH0.zTJfLLEtiioaTrvwRZjnJTmlqpiF0uiPCu9gNZykPNc";

export default function () {
  const res = http.get(
    `${BASE_URL}/api/v1/incidents`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    }
  );

  check(res, { "spike ok": (r) => r.status === 200 });

  sleep(1);
}