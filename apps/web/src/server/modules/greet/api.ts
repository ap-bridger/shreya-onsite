import { prisma } from "@/lib/db";

export const greetings = async () => {
  const greet = await prisma.greet.create({});
  return `Hello, user #${greet.id}!`;
};
