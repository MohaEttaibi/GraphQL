import { secret } from "./../keys";
import JWT from "jsonwebtoken";

export const getUserFromToken = (token: string) => {
  try {
    return JWT.verify(token, secret) as {
        userId: number
    }
  } catch (error) {
    // console.log({"Erroooooooooooooor: ":error});
    return null;
  }
};
