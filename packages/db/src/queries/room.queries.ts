import { Prisma, prismaClient } from "../pg";

export async function createNewRoom(slug: string, adminId: string) {
  const newRoom = await prismaClient.room.create({
    data: {
      slug,
      admin: {
        connect: { id: adminId },
      },
      // add admin as a member in the same transaction
      userRooms: {
        create: {
          userId: adminId,
        },
      },
    },
  });
  return newRoom;
}

export async function removeUserFromRoom(userId: string, roomId: string) {
  const rel = await prismaClient.roomUser.delete({
    where: {
      roomId_userId: {
        userId,
        roomId,
      },
    },
  });
}

export type Room = Prisma.RoomGetPayload<object>;
export async function findRoomFromSlug(slug: string): Promise<Room | null> {
  const room = await prismaClient.room.findFirst({
    where: {
      slug: slug,
    },
  });

  return room;
}

export type RoomMembers = Prisma.UserGetPayload<{
  select: { id: true; name: true };
}>[];

export async function insertUserToRoom(
  userId: string,
  roomId: string,
): Promise<RoomMembers> {
  const res = await prismaClient.roomUser.create({
    data: {
      user: {
        connect: { id: userId },
      },
      room: {
        connect: { id: roomId },
      },
    },
  });
  return findAllUsersInRoom(res.roomId);
}

export async function findAllUsersInRoom(roomId: string): Promise<RoomMembers> {
  const res = await prismaClient.roomUser.findMany({
    where: { roomId },
    select: { user: { select: { id: true, name: true } } },
  });
  const users = res.map((ru) => ru.user);
  return users;
}

export async function deleteRoom(roomId: string) {
  await prismaClient.room.delete({
    where: { id: roomId },
  });
}
