import dotenv from "dotenv";
dotenv.config();

const loadEnvVars = () => {
  const requiredVars = [
    "PORT",
    "NODE_ENV",

    "JWT_SECRET_TOKEN",
    "JWT_REFRESH_TOKEN",
    "JWT_EXPIRES_IN",
    "JWT_REFRESH_EXPIRES_IN",

    "DATABASE_URL",
    "BACKEND_URL",
    "REDIS_URL",

    // Rezgo
    "REZGO_CID",
    "REZGO_API_KEY",
  ];

  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`❌ Missing environment variable: ${key}`);
    }
  });

  return {
    // App
    PORT: Number(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV,

    // JWT
    JWT_SECRET_TOKEN: process.env.JWT_SECRET_TOKEN,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,

    BACKEND_URL: process.env.BACKEND_URL,

    // Redis
    REDIS_URL: process.env.REDIS_URL,

    // Rezgo
    REZGO_CID: process.env.REZGO_CID,
    REZGO_API_KEY: process.env.REZGO_API_KEY,

    // SendGrid
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM: process.env.SENDGRID_FROM,

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    // Frontend
    FRONT_END_URL: process.env.FRONT_END_URL,

    // AI Engine
    AI_ENGINE_URL: process.env.AI_ENGINE_URL,
  };
};

export const envVars = loadEnvVars();
