import { Account, Provider } from "@prisma/client";
import { Prisma, prismaClient } from "../pg";
import { ProviderUser, UserType } from "@repo/common";

export async function findAccountById(
  providerName: Provider,
  accountId: string,
): Promise<UserType | null> {
  const res = await prismaClient.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: providerName,
        providerAccountId: accountId,
      },
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!res) return null;
  return { userId: res.userId, name: res.user.name };
}

export async function createAccountUser(
  providerName: Provider,
  providerId: string,
  email: string,
  name: string,
): Promise<UserType | null> {
  const res = await prismaClient.user.create({
    data: {
      email: email,
      name: name,
      accounts: {
        create: { provider: providerName, providerAccountId: providerId },
      },
    },
  });
  if (!res) return null;
  return { userId: res.id, name: res.name };
}

export async function linkIfExistingByEmail(
  data: ProviderUser,
): Promise<UserType | null> {
  const res = await prismaClient.user.findUnique({
    where: { email: data.email },
  });
  if (!res) return null;
  const res2 = await prismaClient.account.create({
    data: {
      provider: data.providerName,
      providerAccountId: data.providerId,
      userId: res.id,
    },
    include: { user: { select: { name: true } } },
  });
  if (!res2) return null;
  return { userId: res2.userId, name: res2.user.name };
}
