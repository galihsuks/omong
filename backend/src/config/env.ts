import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 8083),
  MONGODB_URI: required("MONGODB_URI"),
  ACCESS_TOKEN_SECRET: required("ACCESS_TOKEN_SECRET"),
};
