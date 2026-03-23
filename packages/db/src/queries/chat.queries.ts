import { MessageType } from "@repo/common";
import { Prisma, prismaClient } from "../pg";

type EnrichedMessage = Extract<MessageType, { status: "TO_FRONTEND" }>;

export type Chat = Prisma.ChatGetPayload<{
  select: { message: true; roomId: true; sentAt: true; userId: true };
}>;

export async function addChat(roomId: string, message: EnrichedMessage) {
  const data: Chat = {
    message: message.content,
    roomId: roomId,
    sentAt: new Date(message.timeStamp_ms),
    userId: message.sender_id,
  };
  await prismaClient.chat.create({
    data: data,
  });
}
