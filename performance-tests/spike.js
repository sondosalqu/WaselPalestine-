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
const TOKEN = __ENV.TOKEN;

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/incidents`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  check(res, {
    "spike ok": (r) => r.status === 200,
  });

  sleep(1);
}