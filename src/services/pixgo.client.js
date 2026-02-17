import axios from "axios";

export function createPixgoClient() {
  const apiKey = process.env.PIXGO_API_KEY;
  const baseURL = process.env.PIXGO_BASE_URL || "https://pixgo.org/api/v1";

  if (!apiKey) {
    throw new Error("PIXGO_API_KEY não configurada no .env");
  }

  return axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey
    }
  });
}
