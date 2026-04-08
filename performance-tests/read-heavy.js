import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1,
  iterations: 1,
};

const BASE_URL = "http://localhost:3000";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoxLCJpYXQiOjE3NzU1ODEzNzYsImV4cCI6MTc3NTU4MjI3Nn0.RL6YZ82QcN2EP1a4nJ5F1Bf5FYCSQwxT3CMgsR1Rdss";

export default function () {
  const payload = JSON.stringify({
    category: "accident",
    description: "test report",
    report_lat: 31.9,
    report_lng: 35.2,
  });

  const res = http.post(`${BASE_URL}/api/v1/reports`, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`STATUS=${res.status}`);
  console.log(`BODY=${res.body}`);

  sleep(1);
}