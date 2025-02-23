"use server";

import { getServerUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { SharedUser } from "@/lib/types";
import { Prisma, Role, TokenType } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";
import { headers } from "next/headers";
//server action for Repos table

export async function initialRepo(nameSpace?: string) {
  const session = await getServerUser();
  if (!session || !session.user) {
    throw new Error("User not found");
  }
  try {
    const userid = parseInt(session?.user?.id!);
    const repo = await db.repos.findFirst({
      where: {
        nameSpace,
        users: {
          some: {
            userid,
          },
        },
      },
      select: {
        id: true,
        name: true,
        nameSpace: true,
        users: {
          where: { userid },
          select: { role: true },
        },
      },
    });
    const initRepo = {
      id: repo?.id || 0,
      name: repo?.name || "",
      role: repo?.users[0].role || Role.owner,
      nameSpace: repo?.nameSpace || "",
    };
    return initRepo;
  } catch (error) {
    console.log(error);
    return { id: NaN, name: "", role: Role.owner, nameSpace: "" };
  }
}

export async function getOwnRepos() {
  const session = await getServerUser();
  if (!session || !session.user) {
    throw new Error("User not found");
  }
  try {
    const userid = parseInt(session?.user?.id!);
    const ownRepos = await db.repos.findMany({
      where: {
        users: {
          //fetching from the relation
          some: {
            userid,
            role: Role.owner,
          },
        },
      },
      select: {
        id: true,
        name: true,
        nameSpace: true,
        users: {
          where: { userid },
          select: { role: true },
        },
      },
    });
    const filterdOwnRepos = ownRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      nameSpace: repo.nameSpace,
      role: repo.users[0].role,
    }));

    return filterdOwnRepos;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function getSharedRepos() {
  const session = await getServerUser();
  if (!session || !session.user) {
    throw new Error("User not found");
  }
  try {
    const userid = parseInt(session?.user?.id!);
    const sharedRepos = await db.repos.findMany({
      where: {
        users: {
          //fetching from the relation
          some: {
            userid,
            role: {
              not: Role.owner,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        nameSpace: true,
        users: {
          where: { userid },
          select: { role: true },
        },
      },
    });
    const filterdSharedRepos = sharedRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      nameSpace: repo.nameSpace,
      role: repo.users[0].role,
    }));
    return filterdSharedRepos;
  } catch (error) {
    console.log(error);
    return [];
  }
}
export async function createRepo(name: string) {
  const session = await getServerUser();
  if (!session || !session.user) {
    return { status: false, error: "User not found" };
  }
  try {
    const userid = parseInt(session?.user?.id!);
    const repo = await db.repos.create({
      data: {
        name,
        users: {
          create: {
            userid,
            role: Role.owner,
          },
        },
      },
    });
    return { new: repo, status: true };
  } catch (error) {
    console.log(error);
    return { status: false, error: "Error creating repo" };
  }
}

export async function deleteRepo(
  repoId: number
): Promise<{ deleted: boolean; status: number; error?: string }> {
  const session = await getServerUser();
  if (!session || !session.user) {
    return { error: "User not found", deleted: false, status: 401 };
  }
  try {
    const userid = parseInt(session?.user?.id!);
    await db.repos.delete({
      where: {
        id: repoId,
        users: {
          some: {
            userid,
            role: Role.owner,
          },
        },
      },
    });
    return { deleted: true, status: 200 };
  } catch (error) {
    console.log(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return { deleted: false, status: 404, error: "Repo not found" };
    return { deleted: false, status: 405, error: "Error occured" };
  }
}

export async function renameRepo(repoId: number, name: string) {
  const session = await getServerUser();
  if (!session || !session.user) {
    return { error: "User not found" };
  }
  try {
    const userid = parseInt(session?.user?.id!);
    await db.repos.update({
      where: {
        id: repoId,
        users: {
          some: {
            userid,
            role: Role.owner,
          },
        },
      },
      data: { name },
    });

    return { status: 200 };
  } catch (error) {
    console.log(error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    )
      return { status: 400, error: "Repo not found" };
    return { status: 500, error: "Error renaming repo" };
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export async function shareRepo(
  repoNamespace: string,
  email: string,
  role: Role,
  description: string
) {
  const session = await getServerUser();
  const origin = (await headers()).get("host");
  if (!session || !session.user) {
    return { status: 401, error: "User not found" };
  }
  try {
    const userid = parseInt(session?.user?.id!);
    const repo = await db.repos.findFirst({
      where: {
        nameSpace: repoNamespace,
        users: {
          some: {
            userid,
          },
        },
      },
      select: {
        id: true,
        name: true,
        users:{
          select:{
            userid:true
          }
        }
      },
    });
    if (!repo) return { status: 400, error: "Repo not found" };

    const sharingUser = await db.users.findFirst({ where: { email } });
    if (!sharingUser) return { status: 404, error: "Sharing User not found" };
    if (sharingUser.id === userid)
      return { status: 403, error: "Cannot share with yourself" };
    if(repo.users.find((user)=>user.userid===sharingUser.id)) return {status:403,error:"User already has access"}
    const newToken = await db.tokens.upsert({
      where:{
        unique_token:{
          userid:sharingUser.id,
          type:TokenType.share,
          repoid:repo.id
        }
      },
      create:{
        type: TokenType.share,
        expiresIn: new Date(Date.now() + 1000 * 60 * 60 * 24),
        userid: sharingUser.id,
        repoid: repo.id,
        role
      },
      update:{
        role,
        expiresIn: new Date(Date.now() + 1000 * 60 * 60 * 24),
      }
    });
    const tokenObj = { tokenid: newToken.id, userid: sharingUser.id };
    const tokenId = sign(`${newToken.id}`, process.env.NEXT_JWT_SECRET!);
    const token = sign(tokenObj, process.env.NEXT_JWT_SECRET!);
    const mailObj = {
      to: email,
      from: `Invite for ${repo.name} Repository <noreply.geemble@gmail.com>`,
      subject: "Repo Sharing",
      body: `You have been given access as <strong>${capitalize(
        role
      )}</strong> of ${repo.name} Repository by ${
        session.user.name
      }.\nClick on the link to accept the share\n <a href="${
        process.env.NEXT_ORIGIN
      }/accept-invite?tokenId=${tokenId}&token=${token}" >Accept Share</a>`,
    };
    if (description.length > 1) {
      mailObj.body += `\nMessage from inviter: ${description}`;
    }
    sendMail(mailObj);
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Error sharing repo" };
  }
}

export async function verifyRepoShare(TokenId: string, TokenObj: string) {
  const tokenId = parseInt(
    verify(TokenId, process.env.NEXT_JWT_SECRET!) as string
  );
  const tokenObj = verify(TokenObj, process.env.NEXT_JWT_SECRET!) as {
    tokenid: number;
    userid: number;
  };
  try {
    const token = await db.tokens.findFirst({
      where: {
        id: tokenId,
        type: TokenType.share,
        userid: tokenObj.userid,
      },
    });
    if (!token) return { status: 400, error: "Invalid Token" };
    if (token.expiresIn < new Date())
      return { status: 400, error: "Token expired" };
    db.$transaction([
      db.tokens.delete({ where: { id: tokenId } }),
      db.repos.update({
        where: { id: token?.repoid! },
        data: {
          users: {
            create: {
              userid: token.userid,
              role: token?.role!,
            },
          },
        },
      }),
    ]);
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500, res: [] };
  }
}

const RoleArray:Role[]=[Role.owner,Role.editor]
export async function getSharedUsers(nameSpace: string) {
  const session = await getServerUser();
  if (!session || !session.user) {
    return { status: 401, res: [] };
  }
  try {
    const userid = parseInt(session.user.id);
    const repoRole=await db.access_Repo.findFirst({
      where:{
        userid,
        repo:{
          nameSpace
        }
      },
      select:{
        role:true
      }
    })
    if(!repoRole || !RoleArray.slice(0,2).includes(repoRole?.role!)) return {status:400,res:[]}
    let endIndex=1
    if(Role.editor==repoRole.role){ 
      endIndex++ 
    };
    const sharedUsers = await db.access_Repo.findMany({
      where: {
        repo: {
          nameSpace,
        },
        role: {
          notIn:RoleArray.slice(0,endIndex)
        },
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (sharedUsers.length === 0) return { status: 200, res: [] };
    const unwrappedUsers = sharedUsers.reduce<{[key:number]:SharedUser}>((acc, user) => {
      acc[user.user.id] = { ...user.user, role: user.role };
      return acc
    }, {});
    return { status: 200, res: unwrappedUsers };
  } catch (error) {
    console.log(error);
    return { status: 500, res: [] };
  }
}

export async function deleteUserFromRepo(repoid: number, userid: number) {
  const session = await getServerUser();
  if (!session || !session.user) {
    return { status: 401, error: "User not found" };
  }
  try {
    const requesterId=parseInt(session.user.id)
    const isOwner=await db.access_Repo.findFirst({
      where:{
        userid:requesterId,
        repoid,
        role:Role.owner
      }
    })
    if(!isOwner) return {status:403,error:"Not authorized"};
    await db.access_Repo.delete({
      where: {
        userid_repoid: {
          repoid,
          userid,
        }
      },
    });
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Error deleting user" };
  }
}


export async function updateUserRoles(data:{id:number,role:Role}[],repoId:number){
  const session = await getServerUser();
  if (!session || !session.user) {
    return { status: 401, error: "User not found" };
  }
  try {
    const requesterId=parseInt(session.user.id)
    const isOwner=await db.access_Repo.findFirst({
      where:{
        userid:requesterId,
        repoid:repoId,
        role:Role.owner
      }
    })
    if(!isOwner) return {status:403,error:"Not authorized"};
    const groupByRole=data.reduce((acc,item)=>{
      acc.get(item.role)?.push(item) || acc.set(item.role,[item])
      return acc
    },new Map<Role,{id:number,role:Role}[]>())
    const updatePromise=Array.from(groupByRole.entries()).map(([role,users])=>{
      return db.access_Repo.updateMany({
        where:{
          repoid:repoId,
          userid:{
            in:users.map((user)=>user.id)
          }
        },
        data:{
          role
        }
      })
    })
    const result=await db.$transaction(updatePromise)
    console.log(result)
    return { status: 200 };
  } catch (error) {
    console.log(error);
    return { status: 500, error: "Error updating user roles" };
  }

}