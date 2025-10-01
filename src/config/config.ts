import dotenv from "dotenv";

dotenv.config();

export const CONFIG = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_URL:
    process.env.OPENROUTER_URL ||
    "https://openrouter.ai/api/v1/chat/completions",
  MODEL: "openai/gpt-4o",
  IMAGE_MODEL: "openai/gpt-4o",
};

if (!CONFIG.OPENROUTER_API_KEY) {
  console.error("❌ Error: OPENROUTER_API_KEY is not set in .env file");
  process.exit(1);
}
