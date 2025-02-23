"use server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { TokenType } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import { sendMail } from "@/lib/mailer";
import { hash } from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type Usercreds = {
  name: string;
  email: string;
  password?: string;
};
type Token = {
  userid: number;
  expiresIn: string;
  type: TokenType;
};

export async function registerUser(creds: Usercreds) {
  try {
    const user = {
      name: creds.name,
      email: creds.email,
      password: "",
    };
    const hashPashword = await hash(creds.password!, 10);
    user.password = hashPashword;
    const res = await db.users.create({
      data: {
        ...user,
        repos: {
          create: {
            repo: {
              create: {
                name: "first-repo",
              },
            },
          },
        },
      },
      select: { id: true, email: true },
    });
    const token: Token = {
      userid: res.id,
      expiresIn: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      type: TokenType.verify,
    };
    const newToken = await db.tokens.create({
      data: token,
      select: { id: true, userid: true },
    });
    const tokenId = sign(newToken.id.toString(), process.env.NEXT_JWT_SECRET!);
    const tokenObj = sign(newToken, process.env.NEXT_JWT_SECRET!);
    const mailObj = {
      to: creds.email,
      from: "Account Verfication <noreply.geemble@gmail.com>",
      subject: "Account Verification for New User at Rag APP",
      body: `<p>Click <a href="${process.env.NEXT_ORIGIN}/verify?tokenId=${tokenId}&token=${tokenObj}">here</a> to verify your account at Rag App</p>`,
    };
    sendMail(mailObj).then((res) => {
      console.log(res);
    });
    return { success: 200 };
  } catch (error) {
    console.log(error);
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: 409, message: "User already exists" };
    }
    throw new Error("Error in registering user");
  }
}

export async function verifyUser(TokenId: string, tokenHash: string) {
  const response = { verified: false, message: "" };
  try {
    const tokenObj = verify(tokenHash, process.env.NEXT_JWT_SECRET!) as {
      id: number;
      userid: number;
    };
    const tokenId = parseInt(
      verify(TokenId, process.env.NEXT_JWT_SECRET!) as string
    );
    const token = await db.tokens.findFirst({ where: { id: tokenId } });
    if (
      !token ||
      token.id !== tokenObj.id ||
      token.id !== tokenId ||
      token.type !== TokenType.verify
    ) {
      response.message = "Invalid Token";
      return response;
    }
    const expiresIn = token.expiresIn.getTime();
    if (expiresIn < Date.now()) {
      await db.$transaction([
        db.tokens.delete({ where: { id: token.id } }),
        db.users.delete({ where: { id: tokenObj.userid } }),
      ]);
      response.message = "Token Expired 2";
      return response;
    }
    await db.$transaction([
      db.tokens.delete({ where: { id: token.id } }),
      db.users.update({
        where: { id: tokenObj.userid },
        data: { verified: true },
      }),
    ]);
    response.verified = true;
    response.message = "Verification Successful";
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.stack);
    } else {
      console.log(error);
    }
    response.message = "Error in verifying user";
  }
  return response;
}

export async function forgetPassword(email: string) {
  try {
    const user = await db.users.findFirst({ where: { email } });
    if (!user) {
      return { success: 404, message: "Email not found" };
    }
    const token: Token = {
      userid: user.id,
      expiresIn: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      type: TokenType.password,
    };
    const newToken = await db.tokens.upsert({
      where: {
        unique_token: {
          userid: user.id,
          type: TokenType.password,
          repoid: 0,
        },
      },
      create: {
        ...token,
        repoid: 0,
      },
      update: {
        expiresIn: token.expiresIn,
      },
      select: { id: true, userid: true },
    });
    const tokenId = sign(newToken.id.toString(), process.env.NEXT_JWT_SECRET!);
    const tokenObj = sign(newToken, process.env.NEXT_JWT_SECRET!);
    const mailObj = {
      to: email,
      from: "Password Reset <noreply.geemble@gmail.com>",
      subject: "Password Reset for Rag APP",
      body: `<p>Click <a href="${process.env.NEXT_ORIGIN}/reset-password?tokenId=${tokenId}&token=${tokenObj}">here</a> to reset your password at Rag App</p>`,
    };
    sendMail(mailObj).then((res) => {
      console.log(res);
    });
    return { success: 200 };
  } catch (error) {
    console.log(error);
    return { success: 500, message: "Error in sending mail" };
  }
}

export async function verifyResetPToken(TokenId: string, TokenObj: string) {
  try {
    const token = verify(TokenObj, process.env.NEXT_JWT_SECRET!) as {
      id: number;
      userid: number;
    };
    const tokenId = parseInt(
      verify(TokenId, process.env.NEXT_JWT_SECRET!) as string
    );
    const tokenDB = await db.tokens.findFirst({ where: { id: tokenId } });
    if (
      !tokenDB ||
      tokenDB.id !== token.id ||
      tokenDB.id !== tokenId ||
      tokenDB.type !== TokenType.password
    ) {
      return { success: 401, message: "Invalid Token" };
    }
    const expiresIn = tokenDB.expiresIn.getTime();
    if (expiresIn < Date.now()) {
      await db.tokens.delete({ where: { id: tokenDB.id } });
      return { success: 403, message: "Token Expired" };
    }
    await db.tokens.delete({ where: { id: tokenDB.id } });
    return { success: 200, message: "Token Verified", userid: tokenDB.userid };
  } catch (error) {
    console.log(error);
    return { success: 500, message: "Error in verifying token" };
  }
}

export async function resetPassword(userid: number, password: string) {
  try {
    const hashPassword = await hash(password, 10);
    await db.users.update({
      where: { id: userid },
      data: { password: hashPassword },
    });
    return { success: 200, message: "Password Reset Successful" };
  } catch (error) {
    console.log(error);
    return { success: 500, message: "Error in resetting password" };
  }
}
