function required(name: "VITE_API_URL" | "VITE_WS_URL"): string {
  const value = import.meta.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  VITE_API_URL: required("VITE_API_URL"),
  VITE_WS_URL: required("VITE_WS_URL"),
} as const;
