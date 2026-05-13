import { prismaClient } from "./pg";

export * from "./queries/element.queries";
export * from "./queries/user.queries";
export * from "./queries/room.queries";
export * from "./queries/chat.queries";
export * from "./queries/account.queries";

export async function warmupDb() {
  await prismaClient.$queryRaw`SELECT 1`;
}
