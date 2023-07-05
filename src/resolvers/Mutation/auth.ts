import { Post, Prisma } from "@prisma/client";
import validator from "validator";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { Context } from "../../index";
import { secret } from "../../keys";

interface SignupArgs {
  credentials: {
    email: string;
    password: string;
  };
  name: string;
  bio: string;
}
interface SigninArgs {
  credentials: {
    email: string;
    password: string;
  };
}
interface UserPayload {
  userError: {
    message: string;
  }[];
  token: string | null;
}

export const authResolvers = {
  signup: async (
    _: any,
    { credentials, name, bio }: SignupArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;
    const isEmail = validator.isEmail(email);
    const isValidPassword = validator.isLength(password, { min: 6 });
    if (!isEmail) {
      return {
        userError: [
          {
            message: "Invalid email.",
          },
        ],
        token: null,
      };
    }
    if (!isValidPassword) {
      return {
        userError: [
          {
            message: "Password must be minimum 6 character.",
          },
        ],
        token: null,
      };
    }
    if (!name || !bio) {
      return {
        userError: [
          {
            message: "Name and Bio are requierd.",
          },
        ],
        token: null,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    await prisma.profile.create({
      data: {
        bio,
        userId: user.id,
      },
    });

    return {
      userError: [],
      token: JWT.sign({userId: user.id,},secret,{expiresIn: 3600000,})
    };
  },

  signin: async (
    _: any,
    { credentials }: SigninArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const { email, password } = credentials;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return {
        userError: [{ message: "Invalid credentials." }],
        token: null,
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        userError: [{ message: "Invalid credentials." }],
        token: null,
      };
    }

    return {
      userError: [],
      token: JWT.sign({userId: user.id,},secret,{expiresIn: 3600000,}) 
    };
  },
};
