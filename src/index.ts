import { getUserFromToken } from "./utils/getUserFromToken";
import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { Query, Mutation, Profile, Post, User } from "./resolvers/index";
import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >;

  userInfo: {
    userId: number;
  } | null;
}

// export const resolvers = {
//   Query,
//   Mutation,
// };
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    Profile,
    Post,
    User
  },
  context: async ({ req }: any): Promise<Context> => {
    // console.log(req.headers.authorization);
    const userInfo = await getUserFromToken(req.headers.authorization);
    return {
      prisma,
      userInfo,
    };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server running on ${url}`);
});
