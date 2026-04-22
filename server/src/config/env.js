import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverEnvPath = path.resolve(__dirname, "../../.env");
const rootEnvPath = path.resolve(__dirname, "../../../.env");

// Load server/.env first, then project-root .env as fallback.
// Existing process.env values are preserved because override defaults to false.
dotenv.config({ path: serverEnvPath });
dotenv.config({ path: rootEnvPath });

const required = ["MONGODB_URI", "JWT_SECRET", "OPENAI_API_KEY", "GEMINI_API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[WARN] Missing environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  openAiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiMaxRetries: Number(process.env.GEMINI_MAX_RETRIES) || 3,
  geminiRetryBaseDelayMs: Number(process.env.GEMINI_RETRY_BASE_DELAY_MS) || 800,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  vectorIndexName: process.env.VECTOR_INDEX_NAME || "chunks_vector_index",
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!"
};