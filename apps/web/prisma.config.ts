import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
    // directUrl is used by prisma migrate / prisma db push (bypasses pooler)
    directUrl: process.env.DIRECT_URL,
  },
});
