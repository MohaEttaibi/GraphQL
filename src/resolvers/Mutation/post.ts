import { canUserMutatePost } from "./../../utils/canUserMutatePost";
import { Context } from "../../index";
import { Post, Prisma } from "@prisma/client";

interface PostArgs {
  post: {
    title?: string;
    content?: string;
  };
}
interface PostPayloadType {
  userError: {
    message: string;
  }[];
  post: Post | Prisma.Prisma__PostClient<Post> | null;
}

export const postResolvers = {
  postCreate: async (
    _: any,
    { post }: PostArgs,
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userError: [
          {
            message: "Forbidden Access.",
          },
        ],
        post: null,
      };
    }
    const { title, content } = post;
    if (!title || !content) {
      return {
        userError: [
          {
            message: "No title Or content Inserted",
          },
        ],
        post: null,
      };
    }
    return {
      userError: [],
      post: prisma.post.create({
        data: {
          title,
          content,
          authorId: userInfo.userId,
        },
      }),
    };
  },
  postUpdate: async (
    _: any,
    { post, postId }: { postId: string; post: PostArgs["post"] },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userError: [
          {
            message: "Forbidden Access.",
          },
        ],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) return error;
    const { title, content } = post;
    if (!title && !content) {
      return {
        userError: [
          {
            message: "Need to have at least one field",
          },
        ],
        post: null,
      };
    }
    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });
    if (!existingPost) {
      return {
        userError: [
          {
            message: "Post dose not exist",
          },
        ],
        post: null,
      };
    }

    let payloadToUpdate = {
      title,
      content,
    };

    if (!title) delete payloadToUpdate.title;
    if (!content) delete payloadToUpdate.content;

    return {
      userError: [],
      post: prisma.post.update({
        data: {
          ...payloadToUpdate,
        },
        where: {
          id: Number(postId),
        },
      }),
    };
  },
  postDelete: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userError: [
          {
            message: "Forbidden Access.",
          },
        ],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) return error;
    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });
    if (!post) {
      return {
        userError: [
          {
            message: "Post was deleted",
          },
        ],
        post: null,
      };
    }
    await prisma.post.delete({
      where: {
        id: Number(postId),
      },
    });
    return {
      userError: [],
      post,
    };
  },

  postPublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userError: [
          {
            message: "Forbidden Access.",
          },
        ],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) return error;

    return {
      userError: [],
      post: prisma.post.update({
        where: { id: Number(postId) },
        data: { published: true },
      }),
    };
  },

  postUnpublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return {
        userError: [
          {
            message: "Forbidden Access.",
          },
        ],
        post: null,
      };
    }
    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });
    if (error) return error;

    return {
      userError: [],
      post: prisma.post.update({
        where: { id: Number(postId) },
        data: { published: false },
      }),
    };
  },
};
