import { WebSocket } from "ws";
import env from "../env";
/**
 * How long (ms) a room may sit completely empty before its Redis data is
 * purged.  Restart the countdown whenever a user re-joins.
 *  Default: 60 s  (override via EMPTY_ROOM_TTL_MS in .env)
 */
export const EMPTY_ROOM_TTL_MS = Number(env.EMPTY_ROOM_TTL_MS ?? 60_000);

/**
 * How long (ms) a room may be idle (no messages from any user) before the
 * periodic sweeper evicts it, even if users are still connected.
 *  Default: 2 h  (override via ROOM_IDLE_TTL_MS in .env)
 */
export const ROOM_IDLE_TTL_MS = Number(env.ROOM_IDLE_TTL_MS ?? 2 * 60 * 60_000);

/**
 * How often the idle sweeper runs.
 *  Default: 10 min
 */
export const SWEEP_INTERVAL_MS = Number(env.SWEEP_INTERVAL_MS ?? 10 * 60_000);

interface RoomUser {
  socket: WebSocket;
  joinedAt: number;
}

interface RoomMeta {
  /** Timestamp of the last message activity in this room */
  lastActivity: number;
  /**
   * NodeJS timer handle for the empty-room grace-period eviction.
   * Set when the last user leaves; cancelled if someone re-joins.
   */
  emptyTimer: ReturnType<typeof setTimeout> | null;
}


/** roomId → ( userId → RoomUser ) */
export const roomRegistry = new Map<string, Map<string, RoomUser>>();

/** roomId → RoomMeta  (exists for the lifetime of a room) */
export const roomMeta = new Map<string, RoomMeta>();

/** Rooms this process has an active Redis pub/sub subscription for */
export const subscribedRooms = new Set<string>();
