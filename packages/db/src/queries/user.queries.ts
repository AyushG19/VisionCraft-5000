import { UserType, SignupFormType } from "@repo/common";
import { prismaClient } from "../pg";

export async function getUserById(userId: string): Promise<UserType | null> {
  const res = await prismaClient.user.findFirst({ where: { id: userId } });

  if (!res) return null;
  return { userId: res.id, name: res.name };
}

export async function createUser(
  data: SignupFormType,
): Promise<UserType | null> {
  const res = await prismaClient.user.create({
    data: data,
  });

  return { userId: res.id, name: res.name };
}

export async function findUserByEmail(
  email: string,
): Promise<(UserType & { password: string }) | null> {
  const res = await prismaClient.user.findUnique({
    where: { email: email },
  });
  if (!res || !res.password) return null;
  return { userId: res.id, name: res.name, password: res.password };
}

export async function findUsersByRoom(
  roomId: string,
): Promise<UserType[] | null> {
  const res = await prismaClient.roomUser.findMany({
    where: { roomId: roomId },
    include: {
      user: true,
    },
  });

  if (!res) return null;
  const userArr = res.map((ru) => ({ userId: ru.user.id, name: ru.user.name }));
  return userArr;
}

export async function findUserInfoWithId(
  userId: string,
): Promise<UserType | null> {
  const res = await prismaClient.user.findUnique({
    where: { id: userId },
  });
  if (!res) return null;
  const resData: UserType = {
    userId: res.id,
    name: res.name,
  };
  return resData;
}
