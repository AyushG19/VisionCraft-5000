import http from "http";
import { corsMap } from "./config";

export const server = http.createServer((req, res) => {
  res.setHeaders(corsMap);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("Worker is Running");
  } else {
    res.writeHead(404);
    res.end();
  }
});
