import { ProviderUser, UserType } from "@repo/common";
import {
  createAccountUser,
  findAccountById,
  linkIfExistingByEmail,
} from "@repo/db";

export async function syncUserAndCreate(
  data: ProviderUser,
): Promise<UserType | null> {
  const providerUser = await findAccountById(
    data.providerName,
    data.providerId,
  );

  if (providerUser) {
    return {
      userId: providerUser.userId,
      name: providerUser.name,
    };
  }

  const existingUser = await linkIfExistingByEmail(data);
  if (existingUser) {
    return {
      userId: existingUser.userId,
      name: existingUser.name,
    };
  }

  const newUser = await createAccountUser(
    data.providerName,
    data.providerId,
    data.email,
    data.name,
  );

  if (newUser) {
    return { userId: newUser.userId, name: newUser.name };
  }
  return null;
}
