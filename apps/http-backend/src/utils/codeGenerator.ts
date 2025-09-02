import crypto from "crypto";
export const generateRandomCode = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomNumbers = new Uint8Array(length);
  crypto.getRandomValues(randomNumbers);
  let code = "";
  for (let i = 0; i < length; i++) {
    const rand = randomNumbers[i] ?? Math.random() * 1000;
    code += characters[rand % 62];
  }
  return code;
};
