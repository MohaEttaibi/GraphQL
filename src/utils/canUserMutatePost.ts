import { secret } from "./../keys";
import JWT from "jsonwebtoken";
import { Context } from "..";

interface canUserMutatePostParams {
  userId: number;
  postId: number;
  prisma: Context["prisma"];
}

export const canUserMutatePost = async ({
  userId,
  postId,
  prisma,
}: canUserMutatePostParams) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return {
      userError: [
        {
          message: "User Not Found.",
        },
      ],
      post: null,
    };
  }
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post?.authorId !== user.id) {
    return {
      userError: [
        {
          message: "Is not your post",
        },
      ],
      post: null,
    };
  }
};
