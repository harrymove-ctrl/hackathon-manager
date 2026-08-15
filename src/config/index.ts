import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  ALLOWED_ORIGINS: z.string().default('*'),
});

export const env = envSchema.parse(process.env);
