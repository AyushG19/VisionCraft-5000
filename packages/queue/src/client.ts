// packages/queue/src/client.ts
import IORedis from "ioredis";
import { Queue, Worker, UnrecoverableError } from "bullmq";
import type { Job, JobsOptions } from "bullmq";
import type { AppJob, JobPayload } from "./jobs";

let _connection: IORedis | null = null;
let _queue: Queue | null = null;

export function initQueue(redisUrl: string): void {
  _connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  _queue = new Queue("persist", {
    connection: _connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
}

function getQueue(): Queue {
  if (!_queue)
    throw new Error("[Queue] Not initialized — call initQueue() first");
  return _queue;
}

function getConnection(): IORedis {
  if (!_connection)
    throw new Error("[Queue] Not initialized — call initQueue() first");
  return _connection;
}

export const appQueue = {
  add<T extends AppJob["name"]>(
    name: T,
    data: JobPayload<T>,
    opts?: JobsOptions,
  ) {
    return getQueue().add(name, data, opts);
  },

  getJob(jobId: string) {
    return getQueue().getJob(jobId);
  },
};

export type AppQueueType = typeof appQueue;

export function createWorker(
  processor: (job: Job<AppJob["data"]>) => Promise<void>,
) {
  return new Worker("persist", processor as any, {
    connection: getConnection(),
    concurrency: 10,
  });
}

export { UnrecoverableError };
