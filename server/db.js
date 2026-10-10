import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/chalobuddy?sslmode=disable';

let prisma;

try {
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ adapter });
  } else {
    if (!global.__cb_prisma) {
      global.__cb_prisma = new PrismaClient({ adapter });
    }
    prisma = global.__cb_prisma;
  }
} catch (err) {
  console.error('Failed to initialize PrismaClient adapter:', err);
  prisma = new PrismaClient();
}

export default prisma;
