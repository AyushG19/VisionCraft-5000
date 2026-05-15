import { env } from "../config";

async function ping(url: string) {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url);

      if (res.ok) return true;
    } catch {}

    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error("Server failed to wake");
}

async function pingHttp() {
  await ping(`/api/health/ping`);
  console.log("pinged http server");
}

async function pingWs() {
  await ping(`${env.WS_BACKEND_URL}/ping`);
  console.log("pinged ws server");
}

async function pingWorker() {
  await ping(`${env.WORKER_BACKEND_URL}/ping`);
  console.log("pinged worker server");
}

export async function pingAllBackend() {
  return Promise.allSettled([pingHttp(), pingWorker(), pingWs()]);
}
