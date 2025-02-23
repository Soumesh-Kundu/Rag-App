import { Role } from "@prisma/client";

export type Thread = {
  id: number;
  nameSpace: string;
  name: string;
  role: Role;
};

export type SharedUser = {
  id: number;
  name: string;
  role: Role;
};

export type AccessUsers={[key:number]:SharedUser}

export type Repo = Thread;
