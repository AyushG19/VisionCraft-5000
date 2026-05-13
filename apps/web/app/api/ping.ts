import { env } from "../config";

async function ping(URL: string) {
  // await axios.get(URL, {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   timeout: 5000,
  // });
  await fetch(URL, { method: "GET", mode: "no-cors", keepalive: true });
}

async function pingHttp() {
  ping(`${env.HTTP_BACKEND_URL}/api/health/ping`);
  console.log("pinged http server");
}

async function pingWs() {
  ping(`${env.WS_BACKEND_URL}/ping`);
  console.log("pinged ws server");
}

async function pingWorker() {
  ping(`${env.WORKER_BACKEND_URL}/ping`);
  console.log("pinged worker server");
}

export async function pingAllBackend() {
  return Promise.all([pingHttp(), pingWorker(), pingWs()]);
}
