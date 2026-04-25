import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "1m",
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
    "read ok": (r) => r.status === 200,
  });

  sleep(1);
}