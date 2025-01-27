import { integer,pgTable,varchar,serial, boolean } from "drizzle-orm/pg-core";

export default pgTable('users',{
    id:serial("id").primaryKey(),
    name:varchar({length: 255}).notNull(),
    password:varchar({length: 255}),
    image:varchar({length: 255}),
    email:varchar({length: 255}).notNull().unique(),
    verified:boolean().notNull().default(false),
})