import { serial,varchar,integer, pgTable, pgEnum } from "drizzle-orm/pg-core";

export const tokenType=pgEnum('tokenType',['verfiy','password','share'])

export default pgTable('tokens',{
    id:serial("id").primaryKey(),
    type:tokenType().notNull(),
    userid:integer().notNull(),//foreign key
    expiresIn:integer().notNull(),//in seconds
})