import type { RedisClient } from "@repo/redis";
import { ELEMENT_JOBS, type AppQueueType } from "@repo/queue";
import { WebSocketShapeType } from "@repo/common";
import { RedisData } from "../types";

export type ElementRedisData = Extract<
  RedisData,
  { type: "ADD" | "DEL" | "UPD" }
>;
export class ElementService {
  constructor(
    private readonly pub: RedisClient,
    private readonly queue: AppQueueType,
  ) {}

  async add(roomId: string, event: ElementRedisData): Promise<void> {
    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.UPSERT,
        { roomId, element: event.element },
        { jobId: `element-${event.element.id}` },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }

  async update(roomId: string, event: ElementRedisData): Promise<void> {
    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.UPSERT,
        { roomId, element: event.element },
        { jobId: `element-${event.element.id}`, delay: 300 },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }
  async delete(roomId: string, event: ElementRedisData): Promise<void> {
    await Promise.all([
      this.queue.add(
        ELEMENT_JOBS.DELETE,
        {
          roomId,
          elementId: event.element.id,
        },
        { jobId: `element-${event.element.id}` },
      ),
      this.pub.publish(`room:${roomId}:events`, JSON.stringify(event)),
    ]);
  }
}

export type ElementServiceType = typeof ElementService;
